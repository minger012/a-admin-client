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
      v-model:checked-row-keys="checkedRowKeys"
      :scroll-x="1900"
      :striped="true"
    >
      <template #tableTitle>
        <n-space class="flex items-center">
          <n-button @click="handleExport">
            <template #icon>
              <n-icon>
                <DownloadOutlined />
              </n-icon>
            </template>
            导出
          </n-button>
          <span class="text-gray-500" v-if="checkedRowKeys.length > 0">
            已选 {{ checkedRowKeys.length }} 项
          </span>
          <n-button v-if="checkedRowKeys.length > 0" text type="primary" @click="handleClearSelection">
            清除
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
  import * as XLSX from 'xlsx';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const checkedRowKeys = ref<Array<number>>([]);

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

  // 清除选中
  function handleClearSelection() {
    checkedRowKeys.value = [];
  }

  // 导出到Excel
  async function handleExport() {
    let exportData: FlowListData[] = [];
    
    if (checkedRowKeys.value.length > 0) {
      // 导出已选中的数据
      const tableData = actionRef.value.getDataSource();
      exportData = tableData.filter((item: FlowListData) => 
        checkedRowKeys.value.includes(item.id)
      );
    } else {
      // 导出全部数据，请求接口获取
      try {
        const params: any = {
          page: '1',
          pageSize: '999999',
          ...searchForm,
        };
        
        // 处理时间范围
        if (params.timeRange && params.timeRange.length === 2) {
          const startDate = params.timeRange[0] instanceof Date ? params.timeRange[0] : new Date(params.timeRange[0]);
          const endDate = params.timeRange[1] instanceof Date ? params.timeRange[1] : new Date(params.timeRange[1]);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            params.sTime = Math.floor(startDate.getTime() / 1000);
            params.eTime = Math.floor(endDate.getTime() / 1000);
          }
          delete params.timeRange;
        }
        
        const res: any = await flowList(params);
        exportData = res.data.list || [];
      } catch (error) {
        message.error('获取数据失败');
        return;
      }
    }
    
    if (exportData.length === 0) {
      message.warning('没有数据可导出');
      return;
    }
    
    exportToExcel(exportData);
  }

  // 导出Excel文件
  function exportToExcel(data: FlowListData[]) {
    const typeMap = { 1: '充值', 2: '提现', 3: '购物', 4: '退款', 5: '系统调整' };
    
    const excelData = data.map(item => ({
      'ID': item.id,
      '用户ID': item.uid,
      '用户简称': item.username || '-',
      'FB_ID': item.fb_id || '-',
      '所属管理者': item.admin_username || '-',
      '订单号': item.order_no || '-',
      '交易类型': typeMap[item.type] || '-',
      '变动金额': item.cha > 0 ? `+${item.cha}` : item.cha,
      '备注': item.remarks || '-',
      '创建时间': item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '资金明细');
    
    const fileName = `资金明细_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    message.success(`导出成功，共 ${data.length} 条数据`);
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
