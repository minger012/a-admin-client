<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 排行榜 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总提现次数</div>
          <div class="summary-value">{{ statsData.total_withdraw_count }}次</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总提现金额</div>
          <div class="summary-value">￥{{ formatMoney(statsData.total_withdraw_amount) }}</div>
        </div>
      </n-space>

      <!-- 右侧：排行榜 -->
      <div class="ranking-box">
        <RankingList title="提现排行榜" :items="statsData.top_users" action-type="withdraw" />
      </div>
    </n-space>

    <!-- 快捷时间按钮 -->
    <n-space>
      <n-button-group>
        <n-button
          v-for="option in quickTimeOptions"
          :key="option.value"
          :type="activeQuickTime === option.value ? 'primary' : 'default'"
          @click="handleQuickTimeChange(option.value)"
        >
          {{ option.label }}
        </n-button>
      </n-button-group>
      
      <n-date-picker
        v-if="activeQuickTime === '自定义'"
        v-model:value="dateRange"
        type="daterange"
        clearable
        @update:value="handleDateRangeChange"
      />
    </n-space>

    <!-- 详细筛选 -->
    <n-card :bordered="false">
      <n-form inline label-placement="left">
        <n-form-item label="用户ID">
          <n-input v-model:value="filters.user_id" placeholder="请输入" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item label="用户昵称">
          <n-input v-model:value="filters.nickname" placeholder="请输入" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="filters.status" :options="statusOptions" placeholder="请选择" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSearch">
              <template #icon>
                <n-icon><SearchOutlined /></n-icon>
              </template>
              查询
            </n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 明细表格 -->
    <n-card :bordered="false">
      <n-data-table
        :columns="detailColumns"
        :data="statsData.detail_list"
        :pagination="pagination"
        :bordered="false"
        :scroll-x="1500"
        :loading="loading"
      />
    </n-card>
  </n-space>
</template>

<script lang="ts" setup>
  import { ref, h, onMounted } from 'vue';
  import { NTag, useMessage } from 'naive-ui';
  import { SearchOutlined } from '@vicons/antd';
  import RankingList from '../shared/RankingList.vue';
  import { getWithdrawDetailStats } from '@/api/dashboard/statistics';

  const message = useMessage();
  const loading = ref(false);
  const activeQuickTime = ref('本年');
  const dateRange = ref<[number, number] | null>(null);

  // 快捷时间选项
  const quickTimeOptions = [
    { label: '今日', value: '今日' },
    { label: '本周', value: '本周' },
    { label: '本月', value: '本月' },
    { label: '本年', value: '本年' },
    { label: '自定义', value: '自定义' },
  ];

  // 提现状态枚举
  const statusMap = {
    0: { label: '待审核', type: 'info' },
    1: { label: '成功', type: 'success' },
    2: { label: '驳回', type: 'error' },
  };

  // 筛选器选项
  const statusOptions = [
    { label: '待审核', value: 0 },
    { label: '成功', value: 1 },
    { label: '驳回', value: 2 },
  ];

  // 筛选条件
  const filters = ref({
    user_id: '',
    nickname: '',
    status: null,
  });

  // 数据状态
  const statsData = ref({
    total_withdraw_count: 0,
    total_withdraw_amount: 0,
    top_users: [],
    detail_list: [],
  });

  // 表格列定义
  const detailColumns = [
    {
      title: 'ID',
      key: 'id',
      width: 60,
      fixed: 'left',
    },
    {
      title: '用户ID',
      key: 'user_id',
      width: 80,
    },
    {
      title: '用户昵称',
      key: 'nickname',
      width: 100,
    },
    {
      title: 'FB ID',
      key: 'fb_id',
      width: 180,
    },
    {
      title: '提现金额',
      key: 'withdraw_amount',
      width: 120,
      render(row: any) {
        return `¥${formatMoney(row.withdraw_amount)}`;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render(row: any) {
        const statusInfo = statusMap[row.status] || {};
        return h(NTag, { type: statusInfo.type, bordered: false, size: 'small' }, { default: () => statusInfo.label });
      },
    },
    {
      title: '用户端备注',
      key: 'user_remark',
      width: 150,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '后台备注',
      key: 'admin_remark',
      width: 150,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '创建时间',
      key: 'create_time',
      width: 180,
    },
  ];

  // 分页配置
  const pagination = ref<any>({
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

  // 计算时间范围
  function calculateTimeRange() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.value[1]);
      endDate.setHours(23, 59, 59, 999);
      return {
        start_date: Math.floor(startDate.getTime() / 1000),
        end_date: Math.floor(endDate.getTime() / 1000),
      };
    }
    
    switch (activeQuickTime.value) {
      case '今日':
        return {
          start_date: Math.floor(today.getTime() / 1000),
          end_date: Math.floor(todayEnd.getTime() / 1000),
        };
      case '本周':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start_date: Math.floor(weekStart.getTime() / 1000),
          end_date: Math.floor(todayEnd.getTime() / 1000),
        };
      case '本月':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start_date: Math.floor(monthStart.getTime() / 1000),
          end_date: Math.floor(todayEnd.getTime() / 1000),
        };
      case '本年':
      default:
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return {
          start_date: Math.floor(yearStart.getTime() / 1000),
          end_date: Math.floor(todayEnd.getTime() / 1000),
        };
    }
  }

  // 加载数据
  async function loadData() {
    try {
      loading.value = true;
      const timeRange = calculateTimeRange();
      const params: any = {
        limit: String(pagination.value.pageSize),
        page: String(pagination.value.page),
        ...timeRange,
      };

      // 添加筛选条件
      if (filters.value.user_id) params.user_id = parseInt(filters.value.user_id);
      if (filters.value.nickname) params.nickname = filters.value.nickname;
      if (filters.value.status !== null) params.status = filters.value.status;

      const res: any = await getWithdrawDetailStats(params);
      
      if (res.code === 1 && res.data) {
        statsData.value.total_withdraw_count = res.data.total_recharge_count || 0;
        statsData.value.total_withdraw_amount = res.data.total_recharge_amount || 0;
        statsData.value.top_users = res.data.top_users || [];
        statsData.value.detail_list = res.data.detail_list || [];
        
        // 更新分页信息
        if (res.data.pagination) {
          pagination.value.page = res.data.pagination.page;
          pagination.value.pageCount = res.data.pagination.pageCount;
          pagination.value.itemCount = res.data.pagination.itemCount;
          // 设置分页回调
          pagination.value.onChange = (page: number) => {
            pagination.value.page = page;
            loadData();
          };
          pagination.value.onUpdatePageSize = (pageSize: number) => {
            pagination.value.pageSize = pageSize;
            pagination.value.page = 1;
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

  // 快捷时间变化
  function handleQuickTimeChange(value: string) {
    activeQuickTime.value = value;
    if (value !== '自定义') {
      dateRange.value = null;
    }
    loadData();
  }

  // 日期范围变化
  function handleDateRangeChange(value: [number, number] | null) {
    if (value) {
      loadData();
    }
  }

  // 查询
  function handleSearch() {
    pagination.value.page = 1;
    loadData();
  }

  // 重置
  function handleReset() {
    filters.value = {
      user_id: '',
      nickname: '',
      status: null,
    };
    pagination.value.page = 1;
    loadData();
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

  .ranking-box {
    min-width: 350px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
  }
</style>
