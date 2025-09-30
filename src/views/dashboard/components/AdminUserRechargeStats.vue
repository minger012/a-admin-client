<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 筛选 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总充值笔数</div>
          <div class="summary-value">{{ mockData.total_recharge_count }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总充值金额</div>
          <div class="summary-value">¥{{ formatMoney(mockData.total_recharge_amount) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">日均充值金额</div>
          <div class="summary-value">¥{{ formatMoney(mockData.day_average_amount) }}</div>
        </div>
      </n-space>

      <!-- 右侧：筛选条件 -->
      <FilterBar @change="handleFilterChange" />
    </n-space>

    <!-- 视图切换 -->
    <n-space>
      <ViewSwitch v-model="viewType" />
    </n-space>

    <!-- 汇总视图 -->
    <div v-if="viewType === 'summary'">
      <!-- 充值类型统计 -->
      <n-card :bordered="false" title="充值类型统计" class="mb-4">
        <n-grid cols="2" :x-gap="16">
          <n-grid-item>
            <n-data-table
              :columns="typeStatsColumns"
              :data="mockData.type_stats"
              :pagination="false"
              :bordered="false"
            />
          </n-grid-item>
          <n-grid-item>
            <!-- 充值状态统计 -->
            <div>
              <div class="stats-title">充值状态统计</div>
              <n-data-table
                :columns="statusStatsColumns"
                :data="mockData.status_stats"
                :pagination="false"
                :bordered="false"
              />
            </div>
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- 按日统计 -->
      <n-card :bordered="false" title="按日统计">
        <n-data-table
          :columns="dayStatsColumns"
          :data="mockData.day_stats"
          :pagination="dayStatsPagination"
          :bordered="false"
        />
      </n-card>
    </div>

    <!-- 明细视图 -->
    <div v-else>
      <n-card :bordered="false" title="明细统计">
        <n-data-table
          :columns="detailColumns"
          :data="mockData.day_details"
          :pagination="detailPagination"
          :bordered="false"
        />
      </n-card>
    </div>
  </n-space>
</template>

<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { NButton, NTag } from 'naive-ui';
  import FilterBar from '../shared/FilterBar.vue';
  import ViewSwitch from '../shared/ViewSwitch.vue';

  const viewType = ref<'summary' | 'detail'>('summary');

  // 充值类型枚举
  const rechargeTypeMap = {
    1: { label: '真实充值', type: 'info' },
    2: { label: '虚拟充值', type: 'warning' },
    3: { label: '系统赠送', type: 'success' },
  };

  // 充值状态枚举
  const rechargeStateMap = {
    0: { label: '失败', type: 'error' },
    1: { label: '成功', type: 'success' },
  };

  // 模拟数据
  const mockData = ref({
    total_recharge_count: 25,
    total_recharge_amount: 11870.00,
    day_average_amount: 1978.33,
    
    // 充值类型统计
    type_stats: [
      {
        type_name: '真实充值',
        type: 1,
        recharge_count: 24,
        recharge_amount: 11770.00,
        percentage: 99.16,
      },
      {
        type_name: '虚拟充值',
        type: 2,
        recharge_count: 1,
        recharge_amount: 100.00,
        percentage: 0.84,
      },
    ],
    
    // 充值状态统计
    status_stats: [
      {
        status_name: '成功',
        status: 1,
        recharge_count: 25,
        recharge_amount: 11870.00,
        percentage: 100.00,
      },
    ],
    
    // 按日统计
    day_stats: [
      {
        date: '2025-09-10',
        recharge_count: 1,
        recharge_amount: 1000.00,
      },
      {
        date: '2025-09-11',
        recharge_count: 2,
        recharge_amount: 6000.00,
      },
      {
        date: '2025-09-12',
        recharge_count: 8,
        recharge_amount: 1420.00,
      },
      {
        date: '2025-09-13',
        recharge_count: 2,
        recharge_amount: 130.00,
      },
      {
        date: '2025-09-14',
        recharge_count: 11,
        recharge_amount: 3220.00,
      },
      {
        date: '2025-09-16',
        recharge_count: 1,
        recharge_amount: 100.00,
      },
    ],
    
    // 明细统计
    day_details: [
      {
        id: 1,
        date: '2025-09-10',
        type: 1,
        status: 1,
        recharge_count: 1,
        recharge_amount: 1000.00,
      },
      {
        id: 2,
        date: '2025-09-11',
        type: 1,
        status: 1,
        recharge_count: 2,
        recharge_amount: 6000.00,
      },
      {
        id: 3,
        date: '2025-09-12',
        type: 1,
        status: 1,
        recharge_count: 6,
        recharge_amount: 320.00,
      },
      {
        id: 4,
        date: '2025-09-12',
        type: 2,
        status: 1,
        recharge_count: 1,
        recharge_amount: 100.00,
      },
      {
        id: 5,
        date: '2025-09-12',
        type: 1,
        status: 1,
        recharge_count: 1,
        recharge_amount: 1000.00,
      },
      {
        id: 6,
        date: '2025-09-13',
        type: 1,
        status: 1,
        recharge_count: 2,
        recharge_amount: 130.00,
      },
      {
        id: 7,
        date: '2025-09-14',
        type: 1,
        status: 1,
        recharge_count: 4,
        recharge_amount: 760.00,
      },
      {
        id: 8,
        date: '2025-09-14',
        type: 1,
        status: 1,
        recharge_count: 2,
        recharge_amount: 60.00,
      },
      {
        id: 9,
        date: '2025-09-14',
        type: 1,
        status: 1,
        recharge_count: 3,
        recharge_amount: 1200.00,
      },
      {
        id: 10,
        date: '2025-09-14',
        type: 1,
        status: 1,
        recharge_count: 1,
        recharge_amount: 200.00,
      },
    ],
  });

  // 充值类型统计列
  const typeStatsColumns = [
    {
      title: '充值类型',
      key: 'type',
      width: 120,
      render(row: any) {
        const typeInfo = rechargeTypeMap[row.type];
        return h(NTag, { type: typeInfo.type, bordered: false }, { default: () => typeInfo.label });
      },
    },
    {
      title: '充值笔数',
      key: 'recharge_count',
      width: 120,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 150,
      render(row: any) {
        return `¥${formatMoney(row.recharge_amount)}`;
      },
    },
    {
      title: '占比',
      key: 'percentage',
      width: 100,
      render(row: any) {
        return `${row.percentage.toFixed(2)}%`;
      },
    },
  ];

  // 充值状态统计列
  const statusStatsColumns = [
    {
      title: '充值状态',
      key: 'status',
      width: 120,
      render(row: any) {
        const statusInfo = rechargeStateMap[row.status];
        return h(NTag, { type: statusInfo.type, bordered: false }, { default: () => statusInfo.label });
      },
    },
    {
      title: '充值笔数',
      key: 'recharge_count',
      width: 120,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 150,
      render(row: any) {
        return `¥${formatMoney(row.recharge_amount)}`;
      },
    },
    {
      title: '占比',
      key: 'percentage',
      width: 100,
      render(row: any) {
        return `${row.percentage.toFixed(2)}%`;
      },
    },
  ];

  // 按日统计列
  const dayStatsColumns = [
    {
      title: '日期',
      key: 'date',
      width: 150,
    },
    {
      title: '充值笔数',
      key: 'recharge_count',
      width: 120,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 150,
      render(row: any) {
        return `¥${formatMoney(row.recharge_amount)}`;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render(row: any) {
        return h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleViewDetail(row),
          },
          { default: () => '查看明细' }
        );
      },
    },
  ];

  // 明细统计列
  const detailColumns = [
    {
      title: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '日期',
      key: 'date',
      width: 120,
    },
    {
      title: '充值类型',
      key: 'type',
      width: 120,
      render(row: any) {
        const typeInfo = rechargeTypeMap[row.type];
        return h(NTag, { type: typeInfo.type, bordered: false }, { default: () => typeInfo.label });
      },
    },
    {
      title: '充值状态',
      key: 'status',
      width: 100,
      render(row: any) {
        const statusInfo = rechargeStateMap[row.status];
        return h(NTag, { type: statusInfo.type, bordered: false }, { default: () => statusInfo.label });
      },
    },
    {
      title: '充值笔数',
      key: 'recharge_count',
      width: 100,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 150,
      render(row: any) {
        return `¥${formatMoney(row.recharge_amount)}`;
      },
    },
  ];

  // 按日统计分页
  const dayStatsPagination = {
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: mockData.value.day_stats.length,
    showSizePicker: false,
  };

  // 明细分页
  const detailPagination = {
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: mockData.value.day_details.length,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
  };

  // 格式化金额
  function formatMoney(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // 处理筛选变化
  function handleFilterChange(filters: any) {
    console.log('筛选条件:', filters);
    // 这里后续会调用API获取真实数据
  }

  // 查看明细
  function handleViewDetail(row: any) {
    console.log('查看明细:', row);
    // 切换到明细视图
    viewType.value = 'detail';
  }
</script>

<style lang="less" scoped>
  .summary-item {
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .summary-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
