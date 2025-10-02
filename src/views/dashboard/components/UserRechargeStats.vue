<template>
  <n-space vertical size="large">
    <!-- 顶部：指标 + 排行榜 -->
    <n-space justify="space-between" align="start">
      <!-- 左侧：汇总指标 -->
      <n-space size="large">
        <div class="summary-item">
          <div class="summary-label">总充值次数</div>
          <div class="summary-value">{{ mockData.total_recharge_count }}次</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总充值金额</div>
          <div class="summary-value">¥{{ formatMoney(mockData.total_recharge_amount) }}</div>
        </div>
      </n-space>

      <!-- 右侧：排行榜 -->
      <div class="ranking-box">
        <RankingList title="充值排行榜" :items="mockData.top_users" />
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
        <n-form-item label="充值方式">
          <n-select v-model:value="filters.payment_method" :options="paymentMethodOptions" placeholder="请选择" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item label="充值类型">
          <n-select v-model:value="filters.recharge_type" :options="rechargeTypeOptions" placeholder="请选择" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="filters.status" :options="statusOptions" placeholder="请选择" style="width: 150px;" clearable />
        </n-form-item>
        <n-form-item label="虚拟充值退款状态">
          <n-select v-model:value="filters.refund_status" :options="refundStatusOptions" placeholder="请选择" style="width: 150px;" clearable />
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
        :scroll-x="2000"
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

  // 充值类型枚举
  const rechargeTypeMap = {
    1: { label: '真实充值', type: 'info' },
    2: { label: '虚拟充值', type: 'warning' },
    3: { label: '系统赠送', type: 'success' },
  };

  // 充值状态枚举
  const statusMap = {
    0: { label: '失败', type: 'error' },
    1: { label: '成功', type: 'success' },
  };

  // 虚拟充值退款状态枚举
  const refundStatusMap = {
    0: { label: '未退款', type: 'default' },
    1: { label: '退回成功', type: 'success' },
    2: { label: '退回失败', type: 'error' },
  };

  // 筛选器选项
  const paymentMethodOptions = [
    { label: '系统充值', value: 1 },
    { label: '支付宝', value: 2 },
    { label: '微信', value: 3 },
  ];

  const rechargeTypeOptions = [
    { label: '真实充值', value: 1 },
    { label: '虚拟充值', value: 2 },
    { label: '系统赠送', value: 3 },
  ];

  const statusOptions = [
    { label: '成功', value: 1 },
    { label: '失败', value: 0 },
  ];

  const refundStatusOptions = [
    { label: '未退款', value: 0 },
    { label: '退回成功', value: 1 },
    { label: '退回失败', value: 2 },
  ];

  // 筛选条件
  const filters = ref({
    user_id: '',
    nickname: '',
    payment_method: null,
    recharge_type: null,
    status: null,
    refund_status: null,
  });

  // 模拟数据
  const mockData = ref({
    total_recharge_count: 27,
    total_recharge_amount: 15870.00,
    
    // 排行榜TOP 3
    top_users: [
      {
        userId: 17,
        fbId: '1966168463025598144',
        orderCount: 1,
        totalAmount: 5000.00,
      },
      {
        userId: 30,
        fbId: '1966508563018813440',
        orderCount: 1,
        totalAmount: 100.00,
      },
      {
        userId: 35,
        fbId: '1967337265029565632',
        orderCount: 1,
        totalAmount: 100.00,
      },
    ],
    
    // 明细列表
    detail_list: [
      {
        id: 27,
        user_id: 17,
        nickname: '用户17',
        fb_id: '1966030070313871736',
        recharge_amount: 100,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-17T03:50:12+08:00',
        refund_status: 0,
      },
      {
        id: 26,
        user_id: 35,
        nickname: '用户35',
        fb_id: '1967337265029565632',
        recharge_amount: 1000,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T09:26:16+08:00',
        refund_status: 0,
      },
      {
        id: 25,
        user_id: 19,
        nickname: '用户19',
        fb_id: '1966916916452502144',
        recharge_amount: 100,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:51:22+08:00',
        refund_status: 0,
      },
      {
        id: 24,
        user_id: 19,
        nickname: '用户19',
        fb_id: '1966916916452502144',
        recharge_amount: 100,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:50:52+08:00',
        refund_status: 0,
      },
      {
        id: 23,
        user_id: 34,
        nickname: '用户34',
        fb_id: '1967283558301044736',
        recharge_amount: 30,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:50:15+08:00',
        refund_status: 0,
      },
      {
        id: 22,
        user_id: 33,
        nickname: '用户33',
        fb_id: '1967262977100533760',
        recharge_amount: 200,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:50:25+08:00',
        refund_status: 0,
      },
      {
        id: 21,
        user_id: 32,
        nickname: '用户32',
        fb_id: '1967218093045085208',
        recharge_amount: 200,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:49:24+08:00',
        refund_status: 0,
      },
      {
        id: 20,
        user_id: 24,
        nickname: '用户24',
        fb_id: '1966170416800075776',
        recharge_amount: 1000,
        payment_method: '系统充值',
        status: 1,
        recharge_type: 1,
        temp_status: '真实充值',
        user_remark: '',
        admin_remark: '',
        create_time: '2025-09-15T01:48:41+08:00',
        refund_status: 0,
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
      width: 160,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 100,
      render(row: any) {
        return `¥${row.recharge_amount}`;
      },
    },
    {
      title: '充值方式',
      key: 'payment_method',
      width: 100,
      render(row: any) {
        return h(NTag, { type: 'info', bordered: false, size: 'small' }, { default: () => row.payment_method });
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render(row: any) {
        const statusInfo = statusMap[row.status];
        return h(NTag, { type: statusInfo.type, bordered: false, size: 'small' }, { default: () => statusInfo.label });
      },
    },
    {
      title: '充值类型',
      key: 'recharge_type',
      width: 100,
      render(row: any) {
        const typeInfo = rechargeTypeMap[row.recharge_type] || {};
        return h(NTag, { type: typeInfo.type, bordered: false, size: 'small' }, { default: () => typeInfo.label });
      },
    },
    {
      title: '虚拟充值退款状态',
      key: 'refund_status',
      width: 140,
      render(row: any) {
        const refundInfo = refundStatusMap[row.refund_status] || {};
        return h(NTag, { type: refundInfo.type, bordered: false, size: 'small' }, { default: () => refundInfo.label });
      },
    },
    {
      title: '用户备注',
      key: 'user_remark',
      width: 120,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '后台备注',
      key: 'admin_remark',
      width: 120,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '创建时间',
      key: 'create_time',
      width: 160,
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
      payment_method: null,
      recharge_type: null,
      status: null,
      refund_status: null,
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
