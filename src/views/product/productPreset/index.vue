<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #betLimitedSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          :options="[
            { label: '全部', value: '' },
            { label: '已限制', value: true },
            { label: '未限制', value: false },
          ]"
        />
      </template>
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <div class="mb-4">
      <n-button 
        type="primary" 
        :disabled="!checkedRowKeys.length" 
        @click="handleBatchEdit"
      >
        <template #icon>
          <n-icon><EditOutlined /></n-icon>
        </template>
        批量编辑预设值
      </n-button>
    </div>
    
    <n-data-table
      ref="tableRef"
      :columns="tableColumns"
      :data="tableData"
      :loading="tableLoading"
      :pagination="false"
      :row-key="row => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="handleCheckedRowKeysChange"
      :scroll-x="1200"
      :striped="true"
    />
    
    <div class="flex justify-end mt-4">
      <n-pagination
        v-model:page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-count="pagination.pageCount"
        :item-count="pagination.itemCount"
        :page-sizes="pagination.pageSizes"
        :show-size-picker="true"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #suffix="{ itemCount }">
          共 {{ pagination.itemCount }} 条
        </template>
      </n-pagination>
    </div>

    <!-- 编辑预设值弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑预设值">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="期号" path="period_no">
          <n-input placeholder="多个期号用逗号隔开" disabled v-model:value="formParams.period_no" readonly />
        </n-form-item>
        <n-form-item :label="COLUMN_TITLES.BIG_SMALL" path="big_small">
          <n-radio-group v-model:value="formParams.big_small">
            <n-space>
              <n-radio value="">未预设</n-radio>
              <n-radio value="big">{{ bigSmallMap['big'] }}</n-radio>
              <n-radio value="small">{{ bigSmallMap['small'] }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="COLUMN_TITLES.SINGLE_DOUBLE" path="single_double">
          <n-radio-group v-model:value="formParams.single_double">
            <n-space>
              <n-radio value="">未预设</n-radio>
              <n-radio value="single">{{ singleDoubleMap['single'] }}</n-radio>
              <n-radio value="double">{{ singleDoubleMap['double'] }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="限制所有投" path="impose">
          <n-radio-group v-model:value="formParams.impose">
            <n-space>
              <n-radio value="1">是</n-radio>
              <n-radio value="0">否</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="限制用户列表" path="impose_user">
          <n-input
            type="textarea"
            placeholder="请输入限制用户名，用逗号隔开"
            v-model:value="formParams.impose_user"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmEditForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 限制投注弹窗 -->
    <n-modal v-model:show="showLimitModal" :show-icon="false" preset="dialog" title="限制投注">
      <n-form
        :model="limitParams"
        :rules="limitRules"
        ref="limitFormRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="产品">
          <n-input v-model:value="limitParams.product" disabled />
        </n-form-item>
        <n-form-item label="期号">
          <n-input v-model:value="limitParams.period_no" disabled />
        </n-form-item>
        <n-form-item label="限制状态" path="betLimited">
          <n-switch v-model:value="limitParams.betLimited" />
        </n-form-item>
        <n-form-item label="限制原因" path="limitReason" :show="limitParams.betLimited">
          <n-input
            type="textarea"
            placeholder="请输入限制原因"
            v-model:value="limitParams.limitReason"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showLimitModal = false)">取消</n-button>
          <n-button type="info" :loading="limitBtnLoading" @click="confirmLimit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
import { COLUMN_TITLES, bigSmallMap, singleDoubleMap } from '@/constants/common';
  import { h, reactive, ref, computed, onMounted } from 'vue';
  import { TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns as baseColumns, ProductPresetData } from './columns';
  import { NTag, NDataTable, NPagination } from 'naive-ui';
  import { EditOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules, NButton, NSelect, NIcon } from 'naive-ui';
  import { goodsList } from '@/api/goods';
  import { getLotteryPeriodList, lotteryPeriodEdit } from '@/api/lottery';

  const message = useMessage();
  const tableRef = ref();
  const formRef = ref();
  const limitFormRef = ref();
  const productLoading = ref(false);
  const productOptions = ref([]);
  const checkedRowKeys = ref([]);
  const selectedRows = ref<ProductPresetData[]>([]);
  const tableData = ref<ProductPresetData[]>([]);
  const tableLoading = ref(false);
  
  // 分页配置
  const pagination = reactive({
    page: 1,
    pageSize: 100,
    itemCount: 0,
    pageCount: 1,
    pageSizes: [50, 100, 200,300, 500,1000],
    showSizePicker: true
  });
  
  // 搜索参数
  const searchParams = reactive({
    goods_id: '',
    period_no: '',
    sTime: '',
    eTime: '',
    page: 1,
    pageSize: pagination.pageSize,
  });

  // 加载表格数据
  async function loadTableData() {
    tableLoading.value = true;
    // 清除选中状态
    checkedRowKeys.value = [];
    selectedRows.value = [];
    try {
      const { page, pageSize, ...rest } = searchParams;
      const params = { ...rest, page, pageSize };

      const res = await getLotteryPeriodList(params);

      if (res.code === 1) {
        tableData.value = res.data.list || [];
        
        // 设置分页信息
        pagination.itemCount = res.data.total;
        pagination.page = res.data.page;
        pagination.pageSize = res.data.page_size;
        pagination.pageCount = res.data.total_page;
        
        console.log('分页数据:', {
          total: pagination.itemCount,
          page: pagination.page,
          pageSize: pagination.pageSize,
          pageCount: pagination.pageCount
        });
      }
    } catch (error) {
      console.error('Failed to load table data', error);
      message.error('加载数据失败');
    } finally {
      tableLoading.value = false;
    }
  }

  // 表格列配置
  const tableColumns = computed(() => {
    const actionColumn = {
      title: '操作',
      key: 'actions',
      width: 160,
      align: 'center',
      fixed: 'right',
      render: (row) => {
        return h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }
          },
          [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handleEdit(row),
              },
              { default: () => '编辑' }
            )
          ],
        );
      },
    };
    
    // 状态渲染
    const renderStatus = (row) => {
      const statusMap = {
        0: { text: '未开奖', type: 'warning' },
        1: { text: '已开奖', type: 'success' },
      };
      const status = statusMap[row.status] || { text: '未知', type: 'default' };
      
      return h(
        NTag,
        {
          type: status.type as any,
          size: 'small',
        },
        { default: () => status.text }
      );
    };
    
    // 编辑大小单双列
    const columns = baseColumns.map(col => {
      if (col.key === 'status') {
        return {
          ...col,
          render: renderStatus
        };
      }
      return col;
    });
    
    // 添加复选框列
    return [
      {
        type: 'selection',
        fixed: 'left',
      },
      ...columns,
      actionColumn
    ];
  });
  

  // 编辑表单
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const formParams = reactive({
    id: 0,
    period_no: '',
    big_small: 'big',
    single_double: 'single',
    impose: '0',
    impose_user: '',
  });

  // 限制投注表单
  const showLimitModal = ref(false);
  const limitBtnLoading = ref(false);
  const limitParams = reactive({
    id: 0,
    product: '',
    period_no: '',
    betLimited: false,
    limitReason: '',
  });

  // 表单验证规则
  const rules: FormRules = {
    period_no: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入期号',
    },
    impose: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择是否限制所有投',
    },
  };

  // 限制投注表单验证规则
  const limitRules: FormRules = {
    limitReason: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入限制原因',
      validator: (rule, value) => {
        if (limitParams.betLimited && !value) {
          return new Error('请输入限制原因');
        }
        return true;
      },
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'goods_id',
      component: 'NSelect',
      label: '产品',
      componentProps: {
        placeholder: '请选择产品',
        options: productOptions,
        filterable: true,
        clearable: true,
        loading: productLoading,
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
    {
      field: 'time_range',
      component: 'NDatePicker',
      label: '时间范围',
      componentProps: {
        type: 'datetimerange',
        clearable: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        shortcuts: {
          今天: (() => {
            const today = new Date();
            const start = new Date(today);
            start.setHours(0, 0, 0, 0);
            const end = new Date(today);
            end.setHours(23, 59, 59, 999);
            return [start, end];
          })(),
          昨天: (() => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const start = new Date(yesterday);
            start.setHours(0, 0, 0, 0);
            const end = new Date(yesterday);
            end.setHours(23, 59, 59, 999);
            return [start, end];
          })(),
          最近7天: (() => {
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const start = new Date();
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return [start, end];
          })(),
          最近30天: (() => {
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const start = new Date();
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            return [start, end];
          })()
        },
        onUpdateValue: (value) => {
          if (value) {
            searchParams.sTime = value[0] ? Math.floor(new Date(value[0]).getTime() / 1000) : '';
            searchParams.eTime = value[1] ? Math.floor(new Date(value[1]).getTime() / 1000) : '';
          } else {
            searchParams.sTime = '';
            searchParams.eTime = '';
          }
        }
      },
    }
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 100,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
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

  // 新增预设值
  function addPreset() {
    formParams.id = 0;
    formParams.product = '';
    formParams.period_no = '';
    formParams.big_small = 'big';
    formParams.single_double = 'odd';
    showEditModal.value = true;
  }

  // 加载所有产品数据
  const loadAllProducts = async () => {
    productLoading.value = true;
    try {
      const res:any = await goodsList({
        page: 1,
        pageSize: 100, // 加载更多产品，以便前端筛选
      });
      if (res.data && res.data.list && Array.isArray(res.data.list)) {
        productOptions.value = res.data.list.map(item => ({
          label: item.name,
          value: item.id,
        }));
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
    } finally {
      productLoading.value = false;
    }
  };

  // 组件挂载时初始化数据
  onMounted(() => {
    loadAllProducts();
    loadTableData();
  });
  
  // 处理表格行选择变化
  function handleCheckedRowKeysChange(keys, rows) {
    checkedRowKeys.value = keys;
    // 确保 rows 中的数据与当前表格数据一致
    // 增加安全性检查，过滤掉空值和未定义的行
    selectedRows.value = rows.filter(row => row && row.id && tableData.value.some(item => item && item.id === row.id));
  }
  
  // 处理页码变化
  function handlePageChange(currentPage) {
    console.log('页码变化为:', currentPage);
    pagination.page = currentPage;
    searchParams.page = currentPage;
    loadTableData();
  }
  
  // 处理每页条数变化
  function handlePageSizeChange(size) {
    console.log('每页条数变化为:', size);
    pagination.pageSize = size;
    searchParams.pageSize = size;
    pagination.page = 1; // 重置到第一页
    searchParams.page = 1;
    loadTableData();
  }
  
  // 批量编辑预设值
  function handleBatchEdit() {
    if (!checkedRowKeys.value.length) {
      message.warning('请至少选择一条记录');
      return;
    }
    
    // 确保 selectedRows 与当前选中状态一致
    const validRows = tableData.value.filter(row => checkedRowKeys.value.includes(row.id));
    selectedRows.value = validRows;
    
    // 提取所有选中行的期号，格式：goods_id_period_no
    const periodNos = validRows.map(row => {
      return `${row.goods_id}_${row.period_no}`
    }).join(',');
    formParams.period_no = validRows.map(row => `${row.period_no}`).join(',');
    formParams.r_period_no = periodNos;
    formParams.big_small = ''; // 初始值设为空字符串，表示未预设状态
    formParams.single_double = ''; // 初始值设为空字符串，表示未预设状态
    formParams.impose = '0';
    formParams.impose_user = '';
   
    showEditModal.value = true;
  }

  function reloadTable() {
    loadTableData();
  }
  
  // 搜索表单提交
  function handleSubmit(values) {
    // 时间范围不在values中，而是已经在time_range组件的onUpdateValue中设置了
    const { goods_id, period_no } = values;
    Object.assign(searchParams, {
      goods_id,
      period_no,
      page: 1,
    });
    // 清除所有已选中的复选框
    checkedRowKeys.value = [];
    selectedRows.value = [];
    
    reloadTable();
  }

  // 重置表单
  function handleReset() {
    // 重置搜索参数
    Object.assign(searchParams, {
      goods_id: '',
      period_no: '',
      sTime: '',
      eTime: '',
      page: 1,
      pageSize: 10,
    });
    
    // 清除所有已选中的复选框
    checkedRowKeys.value = [];
    selectedRows.value = [];
    
    reloadTable();
  }

  // 确认编辑表单
  async function confirmEditForm() {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (errors) => {
      if (errors) return;
      
      formBtnLoading.value = true;
      try {
        const params = {
          period_no: formParams.r_period_no,
          single_double: formParams.single_double,
          big_small: formParams.big_small,
          impose: formParams.impose,
          impose_user: formParams.impose_user,
        };
        
        const res = await lotteryPeriodEdit(params);
        if (res.code === 1) {
          // 显示选定的期号数量
          const periodCount = formParams.period_no.split(',').filter(p => p.trim()).length;
          const successMessage = periodCount > 1 
            ? `成功修改${periodCount}个期号的预设值` 
            : '编辑成功';
          
          message.success(successMessage);
          showEditModal.value = false;
          // 编辑成功后重置选中状态
          checkedRowKeys.value = [];
          selectedRows.value = [];
          reloadTable();
        } else {
          message.error(res.msg || '编辑失败');
        }
      } catch (error) {
        console.error('编辑失败', error);
        message.error('编辑失败，请稍后重试');
      } finally {
        formBtnLoading.value = false;
      }
    });
  }

  // 确认限制投注
  function confirmLimit() {
    limitFormRef.value?.validate((errors) => {
      if (!errors) {
        limitBtnLoading.value = true;
        setTimeout(() => {
          limitBtnLoading.value = false;
          showLimitModal.value = false;
          message.success(limitParams.betLimited ? '限制投注成功' : '解除限制成功');
          reloadTable();
        }, 500);
      }
    });
  }

  // 编辑预设值
  function handleEdit(record: ProductPresetData) {
    formParams.id = record.id;
    formParams.product = record.product;
    formParams.period_no = record.period_no;
    formParams.r_period_no = record.goods_id + '_' + record.period_no;
    formParams.big_small = record.big_small;
    formParams.single_double = record.single_double;
    showEditModal.value = true;
  }



  
</script>

<style lang="less" scoped></style>
