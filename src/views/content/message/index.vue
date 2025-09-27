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
          新增站内信
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
    
    <!-- 添加/编辑站内信弹窗 -->
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
        <n-form-item label="用户ID" path="uid">
          <n-input-number v-model:value="formValue.uid" placeholder="请输入用户ID" :min="1" style="width: 100%" />
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
  import { getMailList, addMail, editMail, deleteMail } from '@/api/content/message';
  import { formatToDateTime } from '@/utils/dateUtil';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  
  // 表格列配置
  // 弹窗相关变量
  const showModal = ref(false);
  const modalTitle = ref('新增站内信');
  const isEdit = ref(false);
  const submitLoading = ref(false);
  
  // 表单数据和验证规则
  const formValue = reactive({
    id: null,
    name: '',
    content: '',
    uid: null
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
    },
    uid: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请输入用户ID',
      type: 'number'
    }
  };
  
  // 表格列配置
  const columns = reactive([
    {
      title: '消息标题',
      key: 'name',
      width: 200,
    },
    {
      title: '消息内容',
      key: 'content',
      width: 400,
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
    width: 120,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
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
      const response = await getMailList(params);
      if (response.code === 1) {
        return {
          list: response.data.list || [],
          page: response.data.page,
          pageSize: response.data.page_size,
          pageCount: response.data.total_page,
          itemCount: response.data.total,
        };
      } else {
        message.error(response.msg || '获取站内信列表失败');
        return {
          list: [],
          page: 1,
          pageSize: 10,
          pageCount: 0,
          itemCount: 0,
        };
      }
    } catch (error) {
      message.error('获取站内信列表失败: ' + error.message);
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

  // 新增站内信
  function handleAdd() {
    isEdit.value = false;
    modalTitle.value = '新增站内信';
    
    // 重置表单
    formValue.id = null;
    formValue.name = '';
    formValue.content = '';
    formValue.uid = null;
    
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
          uid: formValue.uid
        };

        let response;

        if (isEdit.value) {
          // 编辑模式
          params.id = formValue.id;
          response = await editMail(params);
        } else {
          // 新增模式
          response = await addMail(params);
        }

        if (response.code === 1) {
          message.success(`${isEdit.value ? '编辑' : '添加'}站内信成功`);
          closeModal();
          reloadTable();
        } else {
          message.error(response.msg || `${isEdit.value ? '编辑' : '添加'}站内信失败`);
        }
      } catch (error) {
        message.error(`${isEdit.value ? '编辑' : '添加'}站内信失败: ` + error.message);
      } finally {
        submitLoading.value = false;
      }
    });
  }

  // 删除站内信
  function handleDelete(record) {
    const { id } = record;
    
    // 显示确认对话框
    window.$dialog.warning({
      title: '删除站内信',
      content: '确定要删除此站内信吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteMail(id);
          if (response.code === 1) {
            message.success('删除站内信成功');
            reloadTable();
          } else {
            message.error(response.msg || '删除站内信失败');
          }
        } catch (error) {
          message.error('删除站内信失败: ' + error.message);
        }
      }
    });
  }
</script>

<style scoped></style>
