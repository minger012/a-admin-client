<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="管理员分组">
        管理员分组可以设置不同的角色和权限
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
      >
        <template #tableTitle>
          <n-button type="primary" @click="addRole">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增分组
          </n-button>
        </template>
      </BasicTable>
    </n-card>

    <RoleModal ref="roleModalRef" @reloadTable="reloadTable" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, h } from 'vue';
  import { useMessage, useDialog } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { getRoleList, deleteRole } from '@/api/system/role';
  import { columns, RoleData } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import RoleModal from './RoleModal.vue';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const roleModalRef = ref();

  const actionColumn = reactive({
    width: 200,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record: RoleData) {
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
            style: 'color: #ff4d4f',
          },
        ],
      });
    },
  });

  const loadDataTable = async (res: any) => {
    const params = {
      pageSize: res.pageSize,
      page: res.page,
      ...res.searchInfo,
    };
    
    try {
      const response = await getRoleList(params);
      const { data } = response;
      
      return {
        list: data.list || [],
        page: data.page,
        pageCount: data.total_page,
        pageSize: data.page_size,
        itemCount: data.total,
      };
    } catch (error) {
      message.error('获取角色列表失败');
      return { list: [], page: 1, pageCount: 0, pageSize: 10, itemCount: 0 };
    }
  };

  function addRole() {
    roleModalRef.value.openAddModal();
  }

  function onCheckedRow(rowKeys: any[]) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleEdit(record: RoleData) {
    roleModalRef.value.openEditModal(record);
  }

  function handleDelete(record: RoleData) {
    dialog.warning({
      title: '删除确认',
      content: `确定要删除角色 "${record.name}" 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          message.loading('删除中...');
          const res = await deleteRole(record.name);
          const { data } = res;
          
          if (data.code === 1) {
            message.success('删除成功');
            reloadTable();
          } else {
            message.error(data.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  }
</script>

<style lang="less" scoped></style>
