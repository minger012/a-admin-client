<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 排行榜 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总提现次数</div>
          <div class="summary-value">{{ mockData.total_withdraw_count }}次</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总提现金额</div>
          <div class="summary-value">¥{{ formatMoney(mockData.total_withdraw_amount) }}</div>
        </div>
      </n-space>

      <!-- 右侧：排行榜 -->
      <div class="ranking-box">
        <RankingList title="提现排行榜" :items="mockData.top_users" action-type="withdraw" />
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
        :data="mockData.detail_list"
        :pagination="pagination"
        :bordered="false"
        :scroll-x="1500"
      />
    </n-card>
  </n-space>
</template>

<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { NTag } from 'naive-ui';
  import { SearchOutlined } from '@vicons/antd';
  import RankingList from '../shared/RankingList.vue';

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

  // 模拟数据
  const mockData = ref({
    total_withdraw_count: 2,
    total_withdraw_amount: 20966.40,
    
    // 排行榜TOP 3
    top_users: [
      {
        userId: 30,
        fbId: '1966508563018813440',
        withdrawCount: 2,
        totalAmount: 20066.40,
      },
    ],
    
    // 明细列表
    detail_list: [
      {
        id: 2,
        user_id: 30,
        nickname: '用户30',
        fb_id: '1966508563018813440',
        withdraw_amount: 12730.40,
        status: 2,
        user_remark: '由于用户出...',
        admin_remark: '',
        create_time: '2025-09-15T01:54:08+08:00',
      },
      {
        id: 1,
        user_id: 30,
        nickname: '用户30',
        fb_id: '1966508563018813440',
        withdraw_amount: 87.36,
        status: 2,
        user_remark: '私信下架不...',
        admin_remark: '私信下架不...',
        create_time: '2025-09-11T01:14:04+08:00',
      },
    ],
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
  const pagination = {
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: mockData.value.detail_list.length,
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

  // 快捷时间变化
  function handleQuickTimeChange(value: string) {
    activeQuickTime.value = value;
    if (value !== '自定义') {
      dateRange.value = null;
      console.log('选择时间:', value);
    }
  }

  // 日期范围变化
  function handleDateRangeChange(value: [number, number] | null) {
    console.log('自定义时间范围:', value);
  }

  // 查询
  function handleSearch() {
    console.log('查询条件:', filters.value);
    // 这里后续会调用API获取真实数据
  }

  // 重置
  function handleReset() {
    filters.value = {
      user_id: '',
      nickname: '',
      status: null,
    };
    console.log('重置筛选');
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

  .ranking-box {
    min-width: 350px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
  }
</style>
