<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #statusSlot="{ model, field }">
        <n-select v-model:value="model[field]" :options="typeOptions" />
      </template>
      <template #chaSlot="{ model, field }">
        <n-select v-model:value="model[field]" :options="chaOptions" />
      </template>
    </BasicForm>

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:FlowListData) => row.id"
      ref="actionRef"
      :scroll-x="1800"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="exportData" v-if="false">
            <template #icon>
              <n-icon>
                <DownloadOutlined />
              </n-icon>
            </template>
            导出数据
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 编辑备注弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑备注" style="width: 500px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="备注" path="remarks">
          <n-input
            type="textarea"
            placeholder="请输入备注"
            v-model:value="formParams.remarks"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button 
            type="info" 
            :loading="formBtnLoading" 
            @click="confirmEditForm"
          >
            确定
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
  import { columns, FlowListData, typeOptions, chaOptions } from './columns';
  import { flowList, flowEdit } from '@/api/member/flow';
  import { DownloadOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);

  interface SearchFormType {
    uid?: string | number;
    username?: string;
    admin_username?: string;
    fb_id?: string | number;
    cha?: number | string;
    order_no?: string | number;
    type?: number | string;
    timeRange?: [number, number];
  }
  
  const searchForm = ref<SearchFormType>({});

  // 表单参数
  const formParams = reactive({
    id: 0,
    remarks: '',
  });

  // 表单验证规则
  const rules: FormRules = {
    remarks: {
      required: true,
      message: '请输入备注',
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
      field: 'username',
      component: 'NInput',
      label: '用户简称',
      componentProps: {
        placeholder: '请输入用户简称',
      },
    },
    {
      field: 'fb_id',
      component: 'NInput',
      label: 'FB_ID',
      componentProps: {
        placeholder: '请输入FB_ID',
      },
    },
    {
      field: 'admin_username',
      component: 'NInput',
      label: '所属管理者',
      componentProps: {
        placeholder: '请输入所属管理者',
      },
    },
    {
      field: 'type',
      component: 'NSelect',
      label: '交易类型',
      componentProps: {
        placeholder: '请选择交易类型',
        options: typeOptions,
        clearable: true,
      },
      slot: 'statusSlot',
    },
    {
      field: 'cha',
      component: 'NSelect',
      label: '资金方向',
      componentProps: {
        placeholder: '请选择资金方向',
        options: chaOptions,
        clearable: true,
      },
      slot: 'chaSlot',
    },
    {
      field: 'order_no',
      component: 'NInput',
      label: '计划订单编号',
      componentProps: {
        placeholder: '请输入计划订单编号',
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
    labelWidth: 120,
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
      const res:any = await flowList(params)
      const responseData = res.data;
      
      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      }
    } catch (error) {
      message.error('获取资金明细列表失败');
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

  // 编辑备注
  function handleEdit(record: FlowListData) {
    formParams.id = record.id;
    formParams.remarks = record.remarks || '';
    showEditModal.value = true;
  }

  // 确认编辑备注
  async function confirmEditForm() {
    formBtnLoading.value = true;
    
    try {
      // 表单验证
      await formRef.value?.validate();
      
      // 发送请求
      const res:any = await flowEdit({
        id: formParams.id,
        remarks: formParams.remarks,
      });
      
      if (res.code === 1) {
        message.success('修改成功');
        showEditModal.value = false;
        reloadTable();
      } else {
        message.error(res.msg || '修改失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error('表单验证失败，请检查输入');
    } finally {
      formBtnLoading.value = false;
    }
  }

  // 导出数据
  function exportData() {
    message.info('导出功能开发中...');
  }

  // 搜索
  function handleSubmit(values) {
    searchForm.value = values;
    reloadTable();
  }

  // 重置
  function handleReset() {
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
