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
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="2100"
      :striped="true"
    >
      <template #toolbar>
        <div class="text-right">充值总额：<NTag type="warning">{{ totalMoney }}</NTag></div>
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

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();

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
          { label: '虚拟充值', value: 2 },
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
  const searchParams = reactive({
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
      .then((response) => {
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
      .catch((error) => {
        message.error('获取充值列表失败');
        return { list: [], page: 1, pageCount: 0, pageSize: 10, itemCount: 0 };
      });
  }

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
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
          .then((res) => {
            const { data } = res;
            if (data.code === 1) {
              message.success('删除成功');
              reloadTable();
            } else {
              message.error(data.msg || '删除失败');
            }
          })
          .catch((error) => {
            message.error('删除失败: ' + (error.message || '未知错误'));
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
</script>

<style lang="less" scoped></style>
