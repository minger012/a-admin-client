<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:InstantOrderData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1900"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="refreshData">
            <template #icon>
              <n-icon>
                <ReloadOutlined />
              </n-icon>
            </template>
            刷新数据
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    
    <!-- 编辑订单弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑订单">
      <n-form
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="大小" path="big_small">
          <n-radio-group v-model:value="editForm.big_small">
            <n-radio v-for="(value, key) in bigSmallMap" :key="key" :value="key">{{ value }}</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="单双" path="single_double">
          <n-radio-group v-model:value="editForm.single_double">
            <n-radio v-for="(value, key) in singleDoubleMap" :key="key" :value="key">{{ value }}</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="赔率" path="multiple">
          <n-input-number v-model:value="editForm.multiple" disabled />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="primary" :loading="editBtnLoading" @click="confirmEdit">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, InstantOrderData, statusMap, statusColorMap, codeMap } from './columns';
  import { formatToDateTime } from '@/utils/dateUtil';
  import { ReloadOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { NButton, NTag, FormRules, NRadio, NRadioGroup } from 'naive-ui';
  import { getLotteryOrderList, cancelLotteryOrder, editLotteryOrder } from '@/api/system/order';
  import { bigSmallMap, singleDoubleMap } from '@/constants/common';

  const message = useMessage();
  const actionRef = ref();

  // 定义搜索参数对象
  const searchParams = reactive({
    order_no: '',
    username: '',
    goods_id: '',
    period_no: '',
    status: '',
    code: '',
    page: 1,
    pageSize: 10,
  });
  
  // 编辑订单
  const formRef = ref();
  const showEditModal = ref(false);
  const editBtnLoading = ref(false);
  const editForm = reactive({
    id: 0,
    order_no: '',
    username: '',
    big_small: '',
    single_double: '',
    multiple: 0,
  });
  
  // 表单验证规则
  const rules: FormRules = {
    big_small: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择大小',
    },
    single_double: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择单双',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'order_no',
      component: 'NInput',
      label: '订单号',
      componentProps: {
        placeholder: '请输入订单号',
      },
    },
    {
      field: 'username',
      component: 'NInput',
      label: '用户名',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      field: 'goods_id',
      component: 'NInput',
      label: '产品ID',
      componentProps: {
        placeholder: '请输入产品ID',
      },
    },
    {
      field: 'period_no',
      component: 'NInput',
      label: '期号',
      componentProps: {
        placeholder: '请输入期号',
      },
    },
    // {
    //   field: 'code',
    //   component: 'NInput',
    //   label: '结果码',
    //   componentProps: {
    //     placeholder: '请输入结果码',
    //   },
    // },
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 160,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick: handleEdit.bind(null, record),
          },
          {
            label: '超时取消',
            type: 'error',
            onClick: handleTimeoutCancel.bind(null, record),
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

  // 加载表格数据
  function loadDataTable(res) {
    // 合并搜索参数和分页信息
    searchParams.page = res.page || 1;
    searchParams.pageSize = res.pageSize || 10;
    
    // 使用searchParams构造请求参数
    const params = {};
    
    // 添加所有有效的查询参数
    params.page = String(searchParams.page);
    params.pageSize = String(searchParams.pageSize);
    params.isj = '1'; // 固定传1，表示即时注单
    
    if (searchParams.order_no) {
      params.order_no = searchParams.order_no;
    }
    
    if (searchParams.username) {
      params.username = searchParams.username;
    }
    
    if (searchParams.goods_id) {
      params.goods_id = searchParams.goods_id;
    }
    
    if (searchParams.code) {
      params.code = searchParams.code;
    }
    
    if (searchParams.period_no) {
      params.period_no = searchParams.period_no;
    }
    
    
    return getLotteryOrderList(params)
      .then((response) => {
        const responseData = response.data;
        return {
          page: responseData.page,
          pageSize: responseData.page_size,
          pageCount: responseData.total_page,
          itemCount: responseData.total,
          list: responseData.list || [],
        };
      })
      .catch((error) => {
        message.error('获取数据失败: ' + (error.message || '未知错误'));
        return {
          list: [],
          page: 1,
          pageCount: 0,
          pageSize: 10,
          itemCount: 0,
        };
      });
  }

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 编辑订单
  function handleEdit(record: InstantOrderData) {
    // 分解代码，判断是大小还是单双
    const codes = record.code ? record.code.split(',') : [];
    let bigSmall = '';
    let singleDouble = '';
    
    for (const code of codes) {
      if (code === 'big' || code === 'small') {
        bigSmall = code;
      } else if (code === 'single' || code === 'double') {
        singleDouble = code;
      }
    }
    
    editForm.id = record.id;
    editForm.order_no = record.order_no;
    editForm.username = record.username;
    editForm.big_small = bigSmall;
    editForm.single_double = singleDouble;
    editForm.multiple = record.multiple || 0;
    
    showEditModal.value = true;
  }
  
  // 确认编辑
  function confirmEdit() {
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          editBtnLoading.value = true;
          
          // 组合code参数
          const code = [];
          if (editForm.big_small) {
            code.push(editForm.big_small);
          }
          if (editForm.single_double) {
            code.push(editForm.single_double);
          }
          
          const params = {
            id: editForm.id,
            code: code.join(','),
          };
          
          const res = await editLotteryOrder(params);
          if (res.code === 1) {
            message.success('编辑成功');
            showEditModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '编辑失败');
          }
        } catch (error) {
          message.error('编辑失败: ' + error.message || '未知错误');
        } finally {
          editBtnLoading.value = false;
        }
      }
    });
  }
  
  // 超时取消
  function handleTimeoutCancel(record: InstantOrderData) {
    window.$dialog.warning({
      title: '超时退款确认',
      content: '确定要设为超时退款？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const res = await cancelLotteryOrder(record.id);
          if (res.code === 1) {
            message.success('超时取消成功');
            reloadTable();
          } else {
            message.error(res.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message || '未知错误');
        }
      },
    });
  }
  
  // 刷新数据
  function refreshData() {
    reloadTable();
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
    searchParams.order_no = '';
    searchParams.username = '';
    searchParams.goods_name = '';
    searchParams.period_no = '';
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
