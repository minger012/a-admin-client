<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:UserCouponListData) => row.id"
      ref="actionRef"
      :scroll-x="1400"
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
        </n-space>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, UserCouponListData, stateOptions } from './columns';
  import { userCouponList } from '@/api/coupon';
  import { useMessage, NIcon } from 'naive-ui';
  import { DownloadOutlined } from '@vicons/antd';
  import * as XLSX from 'xlsx';
  
  const message = useMessage();
  
  const actionRef = ref();
  
  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'fb_id',
      component: 'NInput',
      label: 'FB ID',
      componentProps: {
        placeholder: '请输入FB ID',
      },
    },
    {
      field: 'uid',
      component: 'NInput',
      label: '用户ID',
      componentProps: {
        placeholder: '请输入用户ID',
      },
    },
    {
      field: 'cid',
      component: 'NInput',
      label: '优惠券ID',
      componentProps: {
        placeholder: '请输入优惠券ID',
      },
    },
    {
      field: 'state',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '请选择',
        options: stateOptions,
      },
    },
    {
      field: 'dateRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'datetimerange',
        clearable: true,
        style: { width: '100%' },
      },
    },
  ];

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 搜索表单数据
  const searchForm = ref({});

  // 加载表格数据
  const loadDataTable = async ({ page, pageSize }) => {
    const params: any = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };
    
    // 处理日期范围
    if (params.dateRange && params.dateRange.length === 2) {
      params.sTime = Math.floor(params.dateRange[0] / 1000);
      params.eTime = Math.floor(params.dateRange[1] / 1000);
      delete params.dateRange;
    }
    
    try {
      const res: any = await userCouponList(params);
      const responseData = res.data;
      
      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      };
    } catch (error) {
      message.error('获取用户优惠券列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
  };

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

  function reloadTable() {
    actionRef.value.reload();
  }

  // 导出到Excel
  async function handleExport() {
    let exportData: UserCouponListData[] = [];
    
    try {
      // 导出全部数据，请求接口获取
      const params: any = {
        page: '1',
        pageSize: '999999',
        ...searchForm.value,
      };
      
      // 处理日期范围
      if (params.dateRange && params.dateRange.length === 2) {
        params.sTime = Math.floor(params.dateRange[0] / 1000);
        params.eTime = Math.floor(params.dateRange[1] / 1000);
        delete params.dateRange;
      }
      
      const res: any = await userCouponList(params);
      exportData = res.data.list || [];
    } catch (error) {
      message.error('获取数据失败');
      return;
    }
    
    if (exportData.length === 0) {
      message.warning('没有数据可导出');
      return;
    }
    
    exportToExcel(exportData);
  }

  // 导出Excel文件
  function exportToExcel(data: UserCouponListData[]) {
    const stateMap = { 1: '未使用', 2: '已使用' };
    
    const excelData = data.map(item => ({
      'ID': item.id,
      '用户ID': item.uid,
      '用户简称': item.user_name || '-',
      '优惠券ID': item.cid,
      'FB_ID': item.fb_id,
      '优惠券名称': item.name,
      '状态': stateMap[item.state] || '-',
      '过期时间': item.end_time ? new Date(item.end_time * 1000).toLocaleString() : '-',
      '更新时间': item.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-',
      '创建时间': item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '用户优惠券列表');
    
    const fileName = `用户优惠券列表_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    message.success(`导出成功，共 ${data.length} 条数据`);
  }
</script>

<style lang="less" scoped></style>
