<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 筛选 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总邀请用户数</div>
          <div class="summary-value">{{ mockData.total_register_count }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">日均邀请用户数</div>
          <div class="summary-value">{{ mockData.day_average_count.toFixed(2) }}</div>
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
      <!-- 按月统计 -->
      <n-card :bordered="false" title="按月统计" class="mb-4">
        <n-data-table
          :columns="monthColumns"
          :data="mockData.month_stats"
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
  import { NButton } from 'naive-ui';
  import FilterBar from '../shared/FilterBar.vue';
  import ViewSwitch from '../shared/ViewSwitch.vue';

  const viewType = ref<'summary' | 'detail'>('summary');

  // 模拟数据
  const mockData = ref({
    total_register_count: 37,
    day_average_count: 4.11,
    // 按月统计
    month_stats: [
      {
        month: '2025年9月',
        register_count: 37,
        percentage: 100.00,
      },
    ],
    // 按日统计（汇总视图）
    day_stats: [
      {
        date: '2025-09-09',
        register_count: 3,
        percentage: 8.11,
      },
      {
        date: '2025-09-10',
        register_count: 12,
        percentage: 32.43,
      },
      {
        date: '2025-09-11',
        register_count: 11,
        percentage: 29.73,
      },
      {
        date: '2025-09-12',
        register_count: 3,
        percentage: 8.11,
      },
      {
        date: '2025-09-14',
        register_count: 4,
        percentage: 10.81,
      },
      {
        date: '2025-09-15',
        register_count: 1,
        percentage: 2.70,
      },
      {
        date: '2025-09-16',
        register_count: 1,
        percentage: 2.70,
      },
      {
        date: '2025-09-18',
        register_count: 1,
        percentage: 2.70,
      },
    ],
    // 明细统计
    day_details: [
      {
        id: 14,
        date: '2025-09-24',
        year: 2025,
        month: 9,
        day: 24,
        week: 39,
        register_count: 1,
      },
    ],
  });

  // 按月统计列
  const monthColumns = [
    {
      title: '月份',
      key: 'month',
      width: 200,
    },
    {
      title: '邀请人数',
      key: 'register_count',
      width: 150,
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

  // 按日统计列（汇总视图）
  const dayStatsColumns = [
    {
      title: '日期',
      key: 'date',
      width: 150,
    },
    {
      title: '邀请人数',
      key: 'register_count',
      width: 150,
    },
    {
      title: '占总邀请比例',
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
      title: '年份',
      key: 'year',
      width: 100,
    },
    {
      title: '月份',
      key: 'month',
      width: 100,
    },
    {
      title: '日',
      key: 'day',
      width: 100,
    },
    {
      title: '周',
      key: 'week',
      width: 100,
    },
    {
      title: '邀请人数',
      key: 'register_count',
      width: 120,
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

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
