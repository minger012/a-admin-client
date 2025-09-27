<template>
  <n-card :bordered="false">
    <div class="flex justify-between mb-4">
      <div>
        <n-button type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增公告
        </n-button>
      </div>
    </div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1200"
      :striped="true"
    >
    </BasicTable>
    
    <!-- 添加/编辑公告弹窗 -->
    <n-modal v-model:show="showModal" :title="modalTitle" preset="dialog">
      <n-form
        :model="formValue"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="标题" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入标题" />
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input
            v-model:value="formValue.content"
            type="textarea"
            placeholder="请输入内容"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </n-form-item>
        <n-form-item label="首页弹窗" path="is_home">
          <n-switch v-model:value="formValue.is_home" :checked-value="1" :unchecked-value="0">
            <template #checked>打开</template>
            <template #unchecked>关闭</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="closeModal">取消</n-button>
          <n-button type="primary" @click="confirmForm" :loading="submitLoading">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { getNoticeList, addNotice, editNotice, deleteNotice } from '@/api/content/announcement';
  import { formatToDateTime } from '@/utils/dateUtil';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  
  // 弹窗相关变量
  const showModal = ref(false);
  const modalTitle = ref('新增公告');
  const isEdit = ref(false);
  const submitLoading = ref(false);
  
  // 表单数据和验证规则
  const formValue = reactive({
    id: null,
    name: '',
    content: '',
    is_home: 0
  });
  
  const rules = {
    name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入标题'
    },
    content: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入内容'
    }
  };

  // 表格列配置
  const columns = reactive([
    {
      title: '名称',
      key: 'name',
      width: 180,
    },
    {
      title: '内容',
      key: 'content',
      width: 300,
    },
    {
      title: '首页弹窗',
      key: 'is_home',
      width: 120,
      render(row) {
        return h(
          'span',
          {
            style: {
              color: row.is_home === 1 ? '#18a058' : '#d03050',
            },
          },
          row.is_home === 1 ? '打开' : '关闭'
        );
      },
    },
    {
      title: '创建时间',
      key: 'create_time',
      width: 180,
      render(row) {
        return h('span', {}, formatToDateTime(row.create_time * 1000));
      },
    }
  ]);

  // 表格操作列配置
  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '修改公告',
            onClick: handleEdit.bind(null, record),
            type: "primary"
          },
          {
            label: '删除',
            onClick: handleDelete.bind(null, record),
            type: "error"
          },
        ],
      });
    },
  });

  // 选中行
  function onCheckedRow(rowKeys) {
    console.log('选中行', rowKeys);
  }

  // 加载表格数据
  async function loadDataTable(res) {
    const params = {
      page: res.page,
      pageSize: res.pageSize,
    };

    try {
      const response = await getNoticeList(params);
      if (response.code === 1) {
        return {
          list: response.data.list || [],
          page: response.data.page,
          pageSize: response.data.page_size,
          pageCount: response.data.total_page,
          itemCount: response.data.total,
        };
      } else {
        message.error(response.msg || '获取公告列表失败');
        return {
          list: [],
          page: 1,
          pageSize: 10,
          pageCount: 0,
          itemCount: 0,
        };
      }
    } catch (error) {
      message.error('获取公告列表失败: ' + error.message);
      return {
        list: [],
        page: 1,
        pageSize: 10,
        pageCount: 0,
        itemCount: 0,
      };
    }
  }

  // 重载表格数据
  function reloadTable() {
    actionRef.value?.reload();
  }

  // 新增公告
  function handleAdd() {
    isEdit.value = false;
    modalTitle.value = '新增公告';
    
    // 重置表单
    formValue.id = null;
    formValue.name = '';
    formValue.content = '';
    formValue.is_home = 0;
    
    // 显示弹窗
    showModal.value = true;
  }
  
  // 编辑公告
  function handleEdit(record) {
    isEdit.value = true;
    modalTitle.value = '修改公告';
    
    // 填充表单数据
    formValue.id = record.id;
    formValue.name = record.name;
    formValue.content = record.content;
    formValue.is_home = record.is_home;
    
    // 显示弹窗
    showModal.value = true;
  }

  // 关闭弹窗
  function closeModal() {
    showModal.value = false;
  }

  // 提交表单
  function confirmForm() {
    formRef.value?.validate(async (errors) => {
      if (errors) return;

      submitLoading.value = true;
      
      try {
        const params = {
          name: formValue.name,
          content: formValue.content,
          is_home: formValue.is_home
        };

        let response;

        if (isEdit.value) {
          // 编辑模式
          params.id = formValue.id;
          response = await editNotice(params);
        } else {
          // 新增模式
          response = await addNotice(params);
        }

        if (response.code === 1) {
          message.success(`${isEdit.value ? '修改' : '添加'}公告成功`);
          closeModal();
          reloadTable();
        } else {
          message.error(response.msg || `${isEdit.value ? '修改' : '添加'}公告失败`);
        }
      } catch (error) {
        message.error(`${isEdit.value ? '修改' : '添加'}公告失败: ` + error.message);
      } finally {
        submitLoading.value = false;
      }
    });
  }

  // 删除公告
  function handleDelete(record) {
    const { id } = record;
    
    // 显示确认对话框
    window.$dialog.warning({
      title: '删除公告',
      content: '确定要删除此公告吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteNotice(id);
          if (response.code === 1) {
            message.success('删除公告成功');
            reloadTable();
          } else {
            message.error(response.msg || '删除公告失败');
          }
        } catch (error) {
          message.error('删除公告失败: ' + error.message);
        }
      }
    });
  }
</script>

<style scoped></style>
