<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #codeSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          :options="[
            { label: '全部', value: '' },
            { label: '大', value: 'big' },
            { label: '小', value: 'small' },
            { label: '单', value: 'single' },
            { label: '双', value: 'double' },
          ]"
        />
      </template>
      <template #statusSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          :options="[
            { label: '全部', value: '' },
            { label: '未开奖', value: 0 },
            { label: '已中奖', value: 1 },
            { label: '未中奖', value: 2 },
            { label: '已撤单', value: 3 },
          ]"
        />
      </template>
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:OrderManagementData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1860"
      :striped="true"
    >
    </BasicTable>

    <!-- 订单详情弹窗 -->
    <n-modal v-model:show="showDetailModal" :show-icon="false" preset="dialog" title="订单详情">
      <n-descriptions bordered label-placement="left" :column="1" class="py-4">
        <n-descriptions-item label="产品ID">
          {{ detailData.goods_id }}
        </n-descriptions-item>
        <n-descriptions-item label="产品名称">
          {{ detailData.goods_name }}
        </n-descriptions-item>
        <n-descriptions-item label="期号">
          {{ detailData.period_no }}
        </n-descriptions-item>
        <n-descriptions-item label="用户名">
          {{ detailData.username }}
        </n-descriptions-item>
        <n-descriptions-item label="投注码">
          {{ formatCode(detailData.code) }}
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="statusColorMap[detailData.status]">
            {{ statusMap[detailData.status] }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="投注数量">
          {{ detailData.count }}
        </n-descriptions-item>
        <n-descriptions-item label="投注金额">
          {{ detailData.money?.toFixed(2) }}
        </n-descriptions-item>
        <n-descriptions-item label="中奖金额">
          {{ detailData.open_money?.toFixed(2) }}
        </n-descriptions-item>
        <n-descriptions-item label="盈亏">
          <span :style="`color: ${(detailData.open_money - detailData.money) >= 0 ? '#18a058' : '#d03050'}; font-weight: bold;`">
            {{ (detailData.open_money - detailData.money)?.toFixed(2) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">
          {{ detailData.create_time ? formatToDateTime(detailData.create_time * 1000) : '-' }}
        </n-descriptions-item>
      </n-descriptions>

      <template #action>
        <n-space>
          <n-button @click="() => (showDetailModal = false)">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, OrderManagementData, statusMap, statusColorMap } from './columns';
  import { bigSmallMap, singleDoubleMap } from '@/constants/common';
  import { useMessage } from 'naive-ui';
  import { NButton, NTag } from 'naive-ui';
  import { getLotteryOrderList } from '@/api/system/order';
  import { formatToDateTime } from '@/utils/dateUtil';
  import { goodsList } from '@/api/goods'; 

  const message = useMessage();
  const actionRef = ref();

  const productLoading = ref(false);
  const productOptions = ref([]);

  // 定义搜索参数对象
  const searchParams = reactive({
    goods_id: '',
    order_no: '',
    username: '',
    code: '',
    status: '',
    page: 1,
    pageSize: 10,
  });

  // 订单详情
  const showDetailModal = ref(false);
  const detailData = reactive<OrderManagementData>({
    id: 0,
    order_no: '',
    goods_id: 0,
    period_no: '',
    username: '',
    uid: 0,
    code: '',
    open_money: 0,
    count: 0,
    money: 0,
    status: 0,
    create_time: 0,
    goods_name: '',
  });

  // 格式化投注码
  function formatCode(code: string): string {
    if (!code) return '';
    const codes = code.split(',');
    return codes.map(c => {
      // 区分大小和单双码值
      if (c === 'big' || c === 'small') {
        return bigSmallMap[c] || c;
      } else if (c === 'single' || c === 'double') {
        return singleDoubleMap[c] || c;
      } else {
        return c;
      }
    }).join(',');
  }

  // 加载所有产品数据
  const loadAllProducts = async () => {
    productLoading.value = true;
    try {
      const res = await goodsList({
        page: 1,
        pageSize: 100, // 加载更多产品，以便前端筛选
      });
      if (res.data && res.data.list && Array.isArray(res.data.list)) {
        productOptions.value = res.data.list.map(item => ({
          label: item.name,
          value: item.id,
        }));
        // 添加"全部"选项
        productOptions.value.unshift({ label: '全部', value: '' });
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
    } finally {
      productLoading.value = false;
    }
  };

  // 初始化时加载产品列表
  loadAllProducts();

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'goods_id',
      component: 'NSelect',
      label: '产品',
      componentProps: {
        placeholder: '请选择产品',
        options: productOptions,
        loading: productLoading,
        clearable: true,
      },
    },
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
      field: 'code',
      component: 'NSelect',
      label: '投注码值',
      defaultValue: '',
      slot: 'codeSlot',
      componentProps: {
        placeholder: '请选择投注码值',
      },
    },
    {
      field: 'status',
      component: 'NSelect',
      label: '状态',
      defaultValue: '',
      slot: 'statusSlot',
      componentProps: {
        placeholder: '请选择状态',
      },
    },
  ];

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
            label: '详情',
            onClick: handleDetail.bind(null, record),
          },
          // {
          //   label: '撤单',
          //   onClick: handleCancel.bind(null, record),
          //   style: record.status === 0 ? '' : 'display: none',
          // },
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
    
    if (searchParams.goods_id) {
      params.goods_id = searchParams.goods_id;
    }
    
    if (searchParams.order_no) {
      params.order_no = searchParams.order_no;
    }
    
    if (searchParams.username) {
      params.username = searchParams.username;
    }
    
    if (searchParams.code !== undefined && searchParams.code !== '') {
      params.code = searchParams.code;
    }
    
    if (searchParams.status !== undefined && searchParams.status !== '') {
      params.status = parseInt(searchParams.status);
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
        console.error('获取注单数据失败:', error);
        return {
          page: 1,
          pageSize: 10,
          pageCount: 0,
          itemCount: 0,
          list: [],
        };
      })
  }

  function onCheckedRow(rowKeys) {
    console.log('选中的行:', rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 查看订单详情
  function handleDetail(record: OrderManagementData) {
    Object.assign(detailData, record);
    showDetailModal.value = true;
  }

  // 撤单操作
  function handleCancel(record: OrderManagementData) {
    if (record.status !== 0) {
      message.error('只能撤销未开奖的订单！');
      return;
    }

    message.info(`准备撤销订单 ID: ${record.id}`);
    // TODO: 实际应用中需要调用后端撤单接口
    // 当前仅作为演示
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
    searchParams.goods_id = '';
    searchParams.order_no = '';
    searchParams.username = '';
    searchParams.code = '';
    searchParams.status = '';
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
