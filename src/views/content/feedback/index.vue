<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:FeedbackListData) => row.id"
      ref="actionRef"
      :scroll-x="1200"
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
            新建反馈
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 新建反馈弹窗 -->
    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建意见反馈" style="width: 700px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-form-item label="用户ID" path="uid">
          <n-input-number 
            placeholder="请输入用户ID" 
            v-model:value="formParams.uid" 
            :min="1"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="反馈主题" path="subject">
          <n-input placeholder="请输入反馈主题" v-model:value="formParams.subject" maxlength="100" show-count />
        </n-form-item>

        <n-form-item label="反馈内容" path="content">
          <n-input
            type="textarea"
            placeholder="请输入反馈内容"
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
            @click="confirmCreate"
          >
            创建
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
  import { columns, FeedbackListData } from './columns';
  import { getFeedbackList, createFeedback } from '@/api/content/feedback';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const showModal = ref(false);
  const formBtnLoading = ref(false);

  interface SearchFormType {
    uid?: string | number;
    timeRange?: [number, number];
  }
  
  const searchForm = ref<SearchFormType>({});

  // 表单参数
  const formParams = reactive({
    uid: null as number | null,
    subject: '',
    content: '',
  });

  // 表单验证规则
  const rules: FormRules = {
    uid: {
      required: true,
      type: 'number',
      message: '请输入用户ID',
      trigger: ['blur', 'change'],
    },
    subject: {
      required: true,
      message: '请输入反馈主题',
      trigger: ['blur', 'input'],
    },
    content: {
      required: true,
      message: '请输入反馈内容',
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
  const loadDataTable = async ({ page, pageSize }) => {
    try {
      const params: any = {
        page,
        pageSize,
      };

      // 添加用户ID筛选
      if (searchForm.value.uid) {
        params.uid = Number(searchForm.value.uid);
      }

      // 添加时间范围筛选
      if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
        params.sTime = Math.floor(searchForm.value.timeRange[0] / 1000);
        params.eTime = Math.floor(searchForm.value.timeRange[1] / 1000);
      }

      const res = await getFeedbackList(params);
      
      if (res.code === 1 && res.data) {
        return {
          list: res.data.list || [],
          total: res.data.total || 0,
          page: res.data.page || page,
          pageSize: res.data.page_size || pageSize,
        };
      } else {
        message.error(res.msg || '获取反馈列表失败');
        return {
          list: [],
          total: 0,
          page,
          pageSize,
        };
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      message.error('获取反馈列表失败');
      return {
        list: [],
        total: 0,
        page,
        pageSize,
      };
    }
  };

  const reloadTable = () => {
    actionRef.value?.reload();
  };

  // 新建反馈
  const handleAdd = () => {
    showModal.value = true;
    formParams.uid = null;
    formParams.subject = '';
    formParams.content = '';
  };

  // 确认创建反馈
  const confirmCreate = () => {
    formRef.value?.validate(async (errors: any) => {
      if (errors) {
        return;
      }

      formBtnLoading.value = true;
      try {
        const res = await createFeedback({
          uid: formParams.uid!,
          subject: formParams.subject,
          content: formParams.content,
        });

        if (res.code === 1) {
          message.success('创建成功');
          showModal.value = false;
          reloadTable();
        } else {
          message.error(res.msg || '创建失败');
        }
      } catch (error) {
        console.error('创建反馈失败:', error);
        message.error('创建反馈失败');
      } finally {
        formBtnLoading.value = false;
      }
    });
  };

  // 搜索
  const handleSubmit = (values: any) => {
    searchForm.value = values;
    reloadTable();
  };

  // 重置
  const handleReset = () => {
    searchForm.value = {};
    reloadTable();
  };
</script>

<style lang="less" scoped></style>
