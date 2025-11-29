<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:RechargeListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      v-model:checked-row-keys="checkedRowKeys"
      :scroll-x="2100"
      :striped="true"
    >
      <template #tableTitle>
        <n-space class="flex items-center justify-between" style="width: 100%;">
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
            <div>当前充值方式总额：<strong class="text-[#2d8cf0]">{{ totalMoney }}</strong></div>
          </n-space>
        </n-space>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { useMessage, useDialog } from 'naive-ui';
  import { columns, RechargeListData } from './columns';
  import { getOrderList, deleteOrder } from '@/api/system/order';
  import { DownloadOutlined } from '@vicons/antd';
  import * as XLSX from 'xlsx';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const checkedRowKeys = ref<Array<number>>([]);

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'uid',
      component: 'NInputNumber',
      label: '用户ID',
      componentProps: {
        placeholder: '请输入用户ID',
        clearable: true,
      },
    },
    {
      field: 'username',
      component: 'NInput',
      label: '用户账号',
      componentProps: {
        placeholder: '请输入用户账号',
        clearable: true,
      },
    },
    {
      field: 'admin_username',
      component: 'NInput',
      label: '所属管理者',
      componentProps: {
        placeholder: '请输入管理员账号',
        clearable: true,
      },
    },
    {
      field: 'fb_id',
      component: 'NInput',
      label: 'FB_ID',
      componentProps: {
        placeholder: '请输入订单号',
        clearable: true,
      },
    },
    {
      field: 'type',
      component: 'NSelect',
      label: '充值方式',
      defaultValue: '',
      componentProps: {
        placeholder: '请选择充值方式',
        options: [
          { label: '全部', value: '' },
          { label: '真实充值', value: 1 },
          // { label: '虚拟充值', value: 2 },
          { label: '系统赠送', value: 3 },
        ],
        clearable: true,
      },
    },
    {
      field: 'timeRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'daterange',
        clearable: true,
      },
    },
  ];
  
  // 搜索参数
  const searchParams:any = reactive({
    uid: null,
    username: '',
    admin_username: '',
    fb_id: '',
    type: '',
    timeRange: null,
    page: 1,
    pageSize: 10,
  });

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
            disabled: record.state === 1 ? true : false,
            onClick: handleDelete.bind(null, record),
            type:"error"
          },
        ],
      });
     
    },
  });

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 100,
    schemas,
  });

  const totalMoney = ref('')

  // 加载表格数据
  async function loadDataTable(res) {
    // 更新页码和分页大小
    searchParams.page = res.page || 1;
    searchParams.pageSize = res.pageSize || 10;
    
    // 使用searchParams构造请求参数
    const params: any = {};
    
    // 页码和分页大小转为字符串
    params.page = String(searchParams.page);
    params.pageSize = String(searchParams.pageSize);
    
    // 用户ID
    if (searchParams.uid !== null && searchParams.uid !== undefined) {
      params.uid = searchParams.uid;
    }
    
    // 用户简称
    if (searchParams.username) {
      params.username = searchParams.username;
    }
    
    // 所属管理者
    if (searchParams.admin_username) {
      params.admin_username = searchParams.admin_username;
    }
    
    // FB_ID
    if (searchParams.fb_id) {
      params.fb_id = searchParams.fb_id;
    }
    
    // 充值方式
    if (searchParams.type !== '') {
      params.type = parseInt(searchParams.type);
    }
    
    // 处理时间范围
    if (searchParams.timeRange && searchParams.timeRange.length === 2) {
      // 确保timeRange元素是Date对象
      const startDate = searchParams.timeRange[0] instanceof Date ? searchParams.timeRange[0] : new Date(searchParams.timeRange[0]);
      const endDate = searchParams.timeRange[1] instanceof Date ? searchParams.timeRange[1] : new Date(searchParams.timeRange[1]);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        params.sTime = Math.floor(startDate.getTime() / 1000);
        params.eTime = Math.floor(endDate.getTime() / 1000);
      }
    }

    return getOrderList(params)
      .then((response:any) => {
        const { data } = response;
        totalMoney.value = data.money || '0';
        return {
          list: data.list || [],
          page: data.page,
          pageCount: data.total_page,
          pageSize: data.page_size,
          itemCount: data.total,
        };
      })
      .catch(() => {
        message.error('获取充值列表失败');
        return { list: [], page: 1, pageCount: 0, pageSize: 10, itemCount: 0 };
      });
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 删除充值记录
  function handleDelete(record: RechargeListData) {
    if (record.state === 1) {
      message.warning('成功状态的充值记录不可删除');
      return;
    }
    
    dialog.warning({
      title: '删除确认',
      content: '确定要删除该充值记录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        message.loading('删除中...');
        deleteOrder(record.id)
          .then((res:any) => {
            if (res.code == 1) {
              message.success('删除成功');
              reloadTable();
            } else {
              message.error(res.msg || '删除失败');
            }
          })
          .catch(() => {
            message.error('删除失败');
          });
      }
    });
  }

  // 搜索
  function handleSubmit(values) {
    // 更新搜索参数
    Object.assign(searchParams, values);
    reloadTable();
  }

  // 重置
  function handleReset() {
    // 重置所有搜索参数
    searchParams.uid = null;
    searchParams.username = '';
    searchParams.admin_username = '';
    searchParams.fb_id = '';
    searchParams.type = '';
    searchParams.timeRange = null;
    reloadTable();
  }

  // 清除选中
  function handleClearSelection() {
    checkedRowKeys.value = [];
  }

  // 导出到Excel
  async function handleExport() {
    let exportData: RechargeListData[] = [];
    
    if (checkedRowKeys.value.length > 0) {
      // 导出已选中的数据
      const tableData = actionRef.value.getDataSource();
      exportData = tableData.filter((item: RechargeListData) => 
        checkedRowKeys.value.includes(item.id)
      );
    } else {
      // 导出全部数据，请求接口获取
      try {
        const params: any = {
          page: '1',
          pageSize: '999999',
          ...searchParams,
        };
        
        // 处理时间范围
        if (params.timeRange && params.timeRange.length === 2) {
          params.sTime = Math.floor(params.timeRange[0] / 1000);
          params.eTime = Math.floor(params.timeRange[1] / 1000);
          delete params.timeRange;
        }
        
        const res: any = await getOrderList(params);
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
  function exportToExcel(data: RechargeListData[]) {
    const typeMap = { 1: '真实充值', 2: '虚拟充值', 3: '系统赠送' };
    const stateMap = { 0: '失败', 1: '成功' };
    const virtualStateMap = { 0: '未退回', 1: '已退回' };
    
    const excelData = data.map(item => ({
      'ID': item.id,
      '用户ID': item.uid,
      '用户简称': item.username || '-',
      'FB_ID': item.fb_id || '-',
      '所属管理者': item.admin_id || '-',
      '充值金额': item.money.toFixed(2),
      '充值截图': item.image || '-',
      '充值方式': typeMap[item.type] || '-',
      '状态': stateMap[item.state] || '-',
      // '虚拟充值退回状态': item.type === 2 ? virtualStateMap[item.virtual_state] || '-' : '-',
      '后台备注': item.remarks || '-',
      '用户端备注': item.user_remarks || '-',
      '更新时间': item.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-',
      '创建时间': item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '充值记录');
    
    const fileName = `充值记录_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    message.success(`导出成功，共 ${data.length} 条数据`);
  }
</script>

<style lang="less" scoped></style>
