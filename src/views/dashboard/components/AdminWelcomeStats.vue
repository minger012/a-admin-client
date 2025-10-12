<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 筛选 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总邀请用户数</div>
          <div class="summary-value">{{ statsData.total_register_count }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">日均邀请用户数</div>
          <div class="summary-value">{{ statsData.day_average_count.toFixed(2) }}</div>
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
          :data="statsData.month_stats"
          :pagination="false"
          :bordered="false"
          :loading="loading"
        />
      </n-card>

      <!-- 按日统计 -->
      <n-card :bordered="false" title="按日统计">
        <n-data-table
          :columns="dayStatsColumns"
          :data="statsData.day_stats"
          :pagination="dayStatsPagination"
          :bordered="false"
          :loading="loading"
        />
      </n-card>
    </div>

    <!-- 明细视图 -->
    <div v-else>
      <n-card :bordered="false" title="明细统计">
        <n-data-table
          :columns="detailColumns"
          :data="statsData.day_details"
          :pagination="detailPagination"
          :bordered="false"
          :loading="loading"
        />
      </n-card>
    </div>
  </n-space>
</template>

<script lang="ts" setup>
  import { ref, h, onMounted } from 'vue';
  import { NButton, useMessage } from 'naive-ui';
  import FilterBar from '../shared/FilterBar.vue';
  import ViewSwitch from '../shared/ViewSwitch.vue';
  import { getCodeUsageStats, getCodeUsageDetails } from '@/api/dashboard/statistics';

  const message = useMessage();
  const viewType = ref<'summary' | 'detail'>('summary');
  const loading = ref(false);

  // 筛选参数
  const filterParams = ref<any>({
    start_date: undefined,
    end_date: undefined,
    admin_username: undefined,
  });

  // 数据状态
  const statsData = ref({
    total_register_count: 0,
    day_average_count: 0,
    // 按月统计
    month_stats: [],
    // 按日统计（汇总视图）
    day_stats: [
      
    ],
    // 明细统计
    day_details: [
      
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
  const dayStatsPagination = ref<any>({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: 0,
    showSizePicker: false,
    onChange: undefined,
  });

  // 明细分页
  const detailPagination = ref<any>({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    onChange: undefined,
    onUpdatePageSize: undefined,
  });

  // 加载汇总数据
  async function loadData() {
    try {
      loading.value = true;
      const params = {
        limit: String(dayStatsPagination.value.pageSize),
        page: String(dayStatsPagination.value.page),
        view_type: 'summary' as const,
        ...filterParams.value,
      };

      const res: any = await getCodeUsageStats(params);
      
      if (res.code === 1 && res.data) {
        statsData.value.total_register_count = res.data.total_register_count || 0;
        statsData.value.day_average_count = res.data.day_average_count || 0;
        statsData.value.month_stats = res.data.month_stats || [];
        statsData.value.day_stats = res.data.day_stats || [];
        statsData.value.day_details = res.data.day_details || [];
        
        // 更新分页信息
        if (res.data.pagination) {
          dayStatsPagination.value.page = res.data.pagination.page;
          dayStatsPagination.value.pageCount = res.data.pagination.pageCount;
          dayStatsPagination.value.itemCount = res.data.pagination.itemCount;
          // 设置分页回调
          dayStatsPagination.value.onChange = (page: number) => {
            dayStatsPagination.value.page = page;
            loadData();
          };
        }
      } else {
        message.error(res.message || '加载数据失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      loading.value = false;
    }
  }

  // 加载明细数据
  async function loadDetailData() {
    try {
      loading.value = true;
      const params = {
        limit: String(detailPagination.value.pageSize),
        page: String(detailPagination.value.page),
        view_type: 'detail' as const,
        ...filterParams.value,
      };

      const res: any = await getCodeUsageDetails(params);
      
      if (res.code === 1 && res.data) {
        statsData.value.day_details = res.data.day_details || [];
        
        // 更新分页信息
        if (res.data.pagination) {
          detailPagination.value.page = res.data.pagination.page;
          detailPagination.value.pageSize = res.data.pagination.pageSize;
          detailPagination.value.pageCount = res.data.pagination.pageCount;
          detailPagination.value.itemCount = res.data.pagination.itemCount;
          // 设置分页回调
          detailPagination.value.onChange = (page: number) => {
            detailPagination.value.page = page;
            loadDetailData();
          };
          detailPagination.value.onUpdatePageSize = (pageSize: number) => {
            detailPagination.value.pageSize = pageSize;
            detailPagination.value.page = 1;
            loadDetailData();
          };
        }
      } else {
        message.error(res.message || '加载明细数据失败');
      }
    } catch (error) {
      console.error('加载明细数据失败:', error);
      message.error('加载明细数据失败');
    } finally {
      loading.value = false;
    }
  }

  // 处理筛选变化
  function handleFilterChange(filters: any) {
    console.log('筛选条件:', filters);
    filterParams.value = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      admin_username: filters.adminUsername,
    };
    
    // 重置分页并重新加载数据
    if (viewType.value === 'summary') {
      dayStatsPagination.value.page = 1;
      loadData();
    } else {
      detailPagination.value.page = 1;
      loadDetailData();
    }
  }

  // 查看明细
  function handleViewDetail(row: any) {
    console.log('查看明细:', row);
    // 切换到明细视图
    viewType.value = 'detail';
    detailPagination.value.page = 1;
    loadDetailData();
  }

  // 初始化加载数据
  onMounted(() => {
    loadData();
  });
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
