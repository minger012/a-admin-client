<template>
  <div>
    <n-card :bordered="false" class="mt-4 proCard">
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.username"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
      >
        <template #tableTitle>
          <n-button type="primary" @click="addAdmin">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增管理员
          </n-button>
        </template>
      </BasicTable>
    </n-card>

    <AdminModal ref="adminModalRef" @reloadTable="reloadTable" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, onMounted } from 'vue';
  import { useMessage, useDialog } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { getAdminList, deleteAdmin } from '@/api/system/admin';
  import { getRoleList } from '@/api/system/role';
  import { columns, AdminData } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import AdminModal from './AdminModal.vue';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const adminModalRef = ref();
  const roleMap = ref<Record<number, string>>({});

  const actionColumn = reactive({
    width: 200,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record: AdminData) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
          },
          {
            label: '删除',
            onClick: handleDelete.bind(null, record),
            type: 'error',
            // 不允许删除admin账号
            ifShow: () => record.username !== 'admin',
          },
        ],
      });
    },
  });

  // 加载角色列表并构建映射关系
  async function loadRoles() {
    try {
      const res: any = await getRoleList({ pageSize: 100, page: 1 });
      
      if (res.code === 1 && res.data.list) {
        const map: Record<number, string> = {};
        res.data.list.forEach(item => {
          map[item.id] = item.name;
        });
        roleMap.value = map;
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  }

  const loadDataTable = async (res: any) => {
    const params = {
      pageSize: res.pageSize,
      page: res.page,
      ...res.searchInfo,
    };
    
    try {
      const response: any = await getAdminList(params);
      
      // 确保角色映射已加载
      if (Object.keys(roleMap.value).length === 0) {
        await loadRoles();
      }
      
      if (response.code === 1) {
        // 为每个管理员添加角色名称
        const list = (response.data.list || []).map(item => ({
          ...item,
          role_name: roleMap.value[item.auth_id] || `未知角色 (ID: ${item.auth_id})`,
        }));
        
        return {
          list,
          page: response.data.page,
          pageCount: response.data.total_page,
          pageSize: response.data.page_size,
          itemCount: response.data.total,
        };
      } else {
        message.error(response.msg || '获取管理员列表失败');
        return { list: [], page: 1, pageCount: 0, pageSize: 10, itemCount: 0 };
      }
    } catch (error) {
      message.error('获取管理员列表失败');
      return { list: [], page: 1, pageCount: 0, pageSize: 10, itemCount: 0 };
    }
  };

  function addAdmin() {
    adminModalRef.value.openAddModal();
  }

  function onCheckedRow(rowKeys: any[]) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleEdit(record: AdminData) {
    adminModalRef.value.openEditModal(record);
  }

  function handleDelete(record: AdminData) {
    dialog.warning({
      title: '删除确认',
      content: `确定要删除管理员 "${record.username}" 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          message.loading('删除中...');
          const res: any = await deleteAdmin(record.username);
          
          if (res.code === 1) {
            message.success('删除成功');
            reloadTable();
          } else {
            message.error(res.msg || '删除失败');
          }
        } catch (error: any) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  }
  
  // 组件挂载时加载角色列表
  onMounted(() => {
    loadRoles();
  });
</script>

<style lang="less" scoped></style>
