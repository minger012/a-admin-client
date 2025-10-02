<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 筛选 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总提现笔数</div>
          <div class="summary-value">{{ mockData.total_withdraw_count }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总提现金额</div>
          <div class="summary-value">¥{{ formatMoney(mockData.total_withdraw_amount) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">日均提现金额</div>
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
      <!-- 提现状态统计 -->
      <n-card :bordered="false" title="提现状态统计" class="mb-4">
        <n-data-table
          :columns="statusStatsColumns"
          :data="mockData.status_stats"
          :pagination="false"
          :bordered="false"
        />
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

  // 提现状态枚举
  const withdrawStateMap = {
    0: { label: '待审核', type: 'info' },
    1: { label: '审核通过', type: 'success' },
    2: { label: '审核拒绝', type: 'error' },
  };

  // 模拟数据
  const mockData = ref({
    total_withdraw_count: 4,
    total_withdraw_amount: 41932.80,
    day_average_amount: 13977.60,
    
    // 提现状态统计
    status_stats: [
      {
        status_name: '待审核',
        status: 0,
        withdraw_count: 1,
        withdraw_amount: 12230.40,
        percentage: 29.17,
      },
      {
        status_name: '驳回',
        status: 2,
        withdraw_count: 3,
        withdraw_amount: 29702.40,
        percentage: 70.83,
      },
    ],
    
    // 按日统计
    day_stats: [
      {
        date: '2025-09-12',
        withdraw_count: 1,
        withdraw_amount: 8736.00,
        percentage: 20.83,
      },
      {
        date: '2025-09-13',
        withdraw_count: 1,
        withdraw_amount: 8736.00,
        percentage: 20.83,
      },
      {
        date: '2025-09-14',
        withdraw_count: 2,
        withdraw_amount: 24460.80,
        percentage: 58.33,
      },
    ],
    
    // 明细统计
    day_details: [
      {
        id: 2,
        date: '2025-09-12',
        status: 2,
        withdraw_count: 1,
        withdraw_amount: 8736.00,
      },
      {
        id: 1,
        date: '2025-09-13',
        status: 2,
        withdraw_count: 1,
        withdraw_amount: 8736.00,
      },
      {
        id: 3,
        date: '2025-09-14',
        status: 0,
        withdraw_count: 1,
        withdraw_amount: 12230.40,
      },
      {
        id: 4,
        date: '2025-09-14',
        status: 2,
        withdraw_count: 1,
        withdraw_amount: 12230.40,
      },
    ],
  });

  // 提现状态统计列
  const statusStatsColumns = [
    {
      title: '提现状态',
      key: 'status',
      width: 150,
      render(row: any) {
        const statusInfo = withdrawStateMap[row.status];
        return h(NTag, { type: statusInfo.type, bordered: false }, { default: () => statusInfo.label });
      },
    },
    {
      title: '提现笔数',
      key: 'withdraw_count',
      width: 150,
    },
    {
      title: '提现金额',
      key: 'withdraw_amount',
      width: 200,
      render(row: any) {
        return `¥${formatMoney(row.withdraw_amount)}`;
      },
    },
    {
      title: '占比',
      key: 'percentage',
      width: 150,
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
      title: '提现笔数',
      key: 'withdraw_count',
      width: 150,
    },
    {
      title: '提现金额',
      key: 'withdraw_amount',
      width: 200,
      render(row: any) {
        return `¥${formatMoney(row.withdraw_amount)}`;
      },
    },
    {
      title: '占总提现比例',
      key: 'percentage',
      width: 150,
      render(row: any) {
        return `${row.percentage.toFixed(2)}%`;
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
      width: 150,
    },
    {
      title: '提现状态',
      key: 'status',
      width: 120,
      render(row: any) {
        const statusInfo = withdrawStateMap[row.status];
        return h(NTag, { type: statusInfo.type, bordered: false }, { default: () => statusInfo.label });
      },
    },
    {
      title: '提现笔数',
      key: 'withdraw_count',
      width: 120,
    },
    {
      title: '提现金额',
      key: 'withdraw_amount',
      width: 180,
      render(row: any) {
        return `¥${formatMoney(row.withdraw_amount)}`;
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
    margin-right:40px;
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

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
