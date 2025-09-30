<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #typeSlot="{ model, field }">
        <n-select v-model:value="model[field]" :options="typeOptions" />
      </template>
    </BasicForm>

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:MailListData) => row.id"
      ref="actionRef"
      :scroll-x="1400"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="handleAdd">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            发送通知
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 发送通知弹窗 -->
    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="发送通知" style="width: 700px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-form-item label="发送类型" path="sendType">
          <n-radio-group v-model:value="formParams.sendType">
            <n-space>
              <n-radio :value="1">发送所有用户</n-radio>
              <n-radio :value="2">发送指定用户</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="选择用户" path="uids" v-if="formParams.sendType === 2">
          <n-select
            v-model:value="formParams.uids"
            :options="userOptions"
            multiple
            filterable
            placeholder="请选择用户"
            :loading="loadingUsers"
          />
        </n-form-item>

        <n-form-item label="通知类型" path="type">
          <n-radio-group v-model:value="formParams.type">
            <n-space>
              <n-radio :value="1">系统公告</n-radio>
              <n-radio :value="2">系统维护</n-radio>
              <n-radio :value="3">活动通知</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="通知标题" path="title">
          <n-input placeholder="请输入通知标题" v-model:value="formParams.title" maxlength="100" show-count />
        </n-form-item>

        <n-form-item label="通知内容" path="content">
          <n-input
            type="textarea"
            placeholder="请输入通知内容"
            v-model:value="formParams.content"
            :autosize="{ minRows: 4, maxRows: 8 }"
            maxlength="500"
            show-count
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showModal = false)">取消</n-button>
          <n-button 
            type="primary" 
            :loading="formBtnLoading" 
            @click="confirmSendNotification"
          >
            发送
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, MailListData, typeOptions } from './columns';
  import { mailList, mailSend } from '@/api/mail';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const showModal = ref(false);
  const formBtnLoading = ref(false);
  const loadingUsers = ref(false);
  const userOptions = ref<any[]>([]);

  interface SearchFormType {
    uid?: string | number;
    type?: number | string;
    timeRange?: [number, number];
  }
  
  const searchForm = ref<SearchFormType>({});

  // 表单参数
  const formParams = reactive({
    sendType: 1,
    uids: [] as number[],
    type: 1,
    title: '',
    content: '',
  });

  // 表单验证规则
  const rules: FormRules = {
    sendType: {
      required: true,
      type: 'number',
      message: '请选择发送类型',
      trigger: ['change'],
    },
    uids: {
      required: true,
      type: 'array',
      message: '请选择用户',
      trigger: ['change'],
      validator: (_rule: any, value: any[]) => {
        if (formParams.sendType === 2 && (!value || value.length === 0)) {
          return new Error('请至少选择一个用户');
        }
        return true;
      },
    },
    type: {
      required: true,
      type: 'number',
      message: '请选择通知类型',
      trigger: ['change'],
    },
    title: {
      required: true,
      message: '请输入通知标题',
      trigger: ['blur', 'input'],
    },
    content: {
      required: true,
      message: '请输入通知内容',
      trigger: ['blur', 'input'],
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'uid',
      component: 'NInput',
      label: '用户ID',
      componentProps: {
        placeholder: '请输入用户ID',
      },
    },
    {
      field: 'type',
      component: 'NSelect',
      label: '通知类型',
      componentProps: {
        placeholder: '请选择通知类型',
        options: typeOptions,
      },
      slot: 'typeSlot',
    },
    {
      field: 'timeRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'daterange',
        clearable: true,
        shortcuts: {
          '一周内': [Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()],
          '一个月内': [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
          '三个月内': [Date.now() - 90 * 24 * 60 * 60 * 1000, Date.now()],
        },
      },
    },
  ];

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 100,
    schemas,
  });

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params:any = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };
    
    // 处理时间范围
    if (params.timeRange && params.timeRange.length === 2) {
      params.sTime = Math.floor(params.timeRange[0] / 1000);
      params.eTime = Math.floor(params.timeRange[1] / 1000);
      delete params.timeRange;
    }
    
    try {
      const res:any = await mailList(params);
      const responseData = res.data;

      // 保存用户列表用于发送通知
      if (responseData.userList && responseData.userList.length > 0) {
        userOptions.value = responseData.userList.map((user: any) => ({
          label: `${user.username} (ID: ${user.id})`,
          value: user.id,
        }));
      }
      
      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      };
    } catch (error) {
      message.error('获取通知列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 发送通知
  function handleAdd() {
    // 重置表单
    Object.assign(formParams, {
      sendType: 1,
      uids: [],
      type: 1,
      title: '',
      content: '',
    });
    showModal.value = true;
  }

  // 确认发送通知
  async function confirmSendNotification() {
    try {
      await formRef.value?.validate();
      formBtnLoading.value = true;

      const submitData:any = {
        sendType: formParams.sendType,
        type: formParams.type,
        title: formParams.title,
        content: formParams.content,
      };

      // 如果是发送指定用户，添加uids
      if (formParams.sendType === 2) {
        submitData.uids = formParams.uids;
      }

      const res:any = await mailSend(submitData);

      if (res.code === 1) {
        message.success('通知发送成功');
        showModal.value = false;
        reloadTable();
      } else {
        message.error(res.msg || '通知发送失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      formBtnLoading.value = false;
    }
  }

  // 搜索
  function handleSubmit(values) {
    searchForm.value = values;
    reloadTable();
  }

  // 重置
  function handleReset() {
    searchForm.value = {};
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
