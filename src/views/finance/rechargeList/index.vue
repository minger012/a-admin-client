<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #stateSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          :options="[
            { label: '全部', value: '' },
            { label: '未审核', value: 0 },
            { label: '已审核', value: 1 },
          ]"
        />
      </template>
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:RechargeListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1760"
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
  import { PlusOutlined } from '@vicons/antd';
  import { FormRules, useMessage, useDialog, NButton, NPopconfirm } from 'naive-ui';
  import { columns, RechargeListData } from './columns';
  import { getOrderList, deleteOrder } from '@/api/system/order';
  import { formatToDate, formatToDateTime } from '@/utils/dateUtil';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const formRef = ref();
  
  // 新增表单
  const formBtnLoading = ref(false);

  // 表单验证规则
  const rules: FormRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    cardholderName: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入持卡人姓名',
    },
    rechargeAmount: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入充值金额',
    },
    type: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择类型',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'NInput',
      label: '姓名',
      componentProps: {
        placeholder: '请输入姓名',
      },
    },
    {
      field: 'admin_name',
      component: 'NInput',
      label: '操作人',
      componentProps: {
        placeholder: '请输入操作人',
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
          { label: '后台充值', value: 1 },
          { label: '会员', value: 2 },
          { label: '彩金', value: 3 },
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
    {
      field: 'mMoney',
      component: 'NInputNumber',
      label: '最小金额',
      componentProps: {
        placeholder: '请输入最小金额',
        clearable: true,
      },
    },
    {
      field: 'bMoney',
      component: 'NInputNumber',
      label: '最大金额',
      componentProps: {
        placeholder: '请输入最大金额',
        clearable: true,
      },
    },
  ];
  
  // 搜索参数
  const searchParams = reactive({
    name: '',
    admin_name: '',
    type: '',
    state: '',
    timeRange: null,
    mMoney: null,
    bMoney: null,
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

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  const totalMoney = ref('')

  // 加载表格数据
  function loadDataTable(res) {
    // 合并搜索参数和分页信息
    searchParams.page = res.page || 1;
    searchParams.pageSize = res.pageSize || 10;
    
    // 使用searchParams构造请求参数
    const params = {};
    
    // 页码和分页大小转为字符串
    params.page = String(searchParams.page);
    params.pageSize = String(searchParams.pageSize);
    
    // 用户名和操作人
    if (searchParams.name) {
      params.name = searchParams.name;
    }
    
    if (searchParams.admin_name) {
      params.admin_name = searchParams.admin_name;
    }
    
    // 状态
    if (searchParams.state !== '') {
      params.state = searchParams.state;
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

    // 处理金额范围
    if (searchParams.mMoney !== null && searchParams.mMoney !== undefined) {
      params.mMoney = parseInt(searchParams.mMoney);
    }
    
    if (searchParams.bMoney !== null && searchParams.bMoney !== undefined) {
      params.bMoney = parseInt(searchParams.bMoney);
    }
    
    return getOrderList(params)
      .then((response) => {
        const { data } = response;
        totalMoney.value = data.money
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

  // 处理充值
  function handleProcess(record: RechargeListData) {
    message.loading('处理中...');
    setTimeout(() => {
      message.success('处理成功');
      reloadTable();
    }, 500);
  }

  // 拒绝充值
  function handleReject(record: RechargeListData) {
    message.loading('处理中...');
    setTimeout(() => {
      message.success('已拒绝');
      reloadTable();
    }, 500);
  }

  // 删除充值记录
  function handleDelete(record: RechargeListData) {
    if (record.state === 1) {
      message.warning('已审核的充值记录不可删除');
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
    
    // 如果值存在在表格中，让其保留在搜索参数中
    if (values.mMoney !== undefined) searchParams.mMoney = values.mMoney;
    if (values.bMoney !== undefined) searchParams.bMoney = values.bMoney;
    
    reloadTable();
  }

  // 重置
  function handleReset() {
    // 重置所有搜索参数
    searchParams.name = '';
    searchParams.admin_name = '';
    searchParams.type = '';
    searchParams.state = '';
    searchParams.timeRange = null;
    searchParams.mMoney = null;
    searchParams.bMoney = null;
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
