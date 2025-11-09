<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 筛选 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总提现笔数</div>
          <div class="summary-value">{{ statsData.total_withdraw_count }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总提现金额</div>
          <div class="summary-value">￥{{ formatMoney(statsData.total_withdraw_amount) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">日均提现金额</div>
          <div class="summary-value">￥{{ formatMoney(statsData.day_average_amount) }}</div>
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
          :data="statsData.status_stats"
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
  import { NButton, NTag, useMessage } from 'naive-ui';
  import FilterBar from '../shared/FilterBar.vue';
  import ViewSwitch from '../shared/ViewSwitch.vue';
  import { getWithdrawStats, getWithdrawDetails } from '@/api/dashboard/statistics';

  const message = useMessage();
  const viewType = ref<'summary' | 'detail'>('summary');
  const loading = ref(false);

  // 筛选参数
  const filterParams = ref<any>({
    start_date: undefined,
    end_date: undefined,
    admin_username: undefined,
  });

  // 提现状态枚举
  const withdrawStateMap = {
    0: { label: '待审核', type: 'info' },
    1: { label: '审核通过', type: 'success' },
    2: { label: '审核拒绝', type: 'error' },
  };

  // 数据状态
  const statsData = ref({
    total_withdraw_count: 0,
    total_withdraw_amount: 0,
    day_average_amount: 0,
    status_stats: [],
    day_stats: [],
    day_details: [],
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
        return `${formatMoney(row.withdraw_amount)}`;
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
        return `${formatMoney(row.withdraw_amount)}`;
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
        return `${formatMoney(row.withdraw_amount)}`;
      },
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

  // 格式化金额
  function formatMoney(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

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

      const res: any = await getWithdrawStats(params);
      
      if (res.code === 1 && res.data) {
        statsData.value.total_withdraw_count = res.data.total_withdraw_count || 0;
        statsData.value.total_withdraw_amount = res.data.total_withdraw_amount || 0;
        statsData.value.day_average_amount = res.data.day_average_amount || 0;
        statsData.value.status_stats = res.data.status_stats || [];
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

      const res: any = await getWithdrawDetails(params);
      
      if (res.code === 1 && res.data) {
        statsData.value.day_details = res.data.day_details || [];
        
        // 更新分页信息
        if (res.data.pagination) {
          detailPagination.value.page = res.data.pagination.page;
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
