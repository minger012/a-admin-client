<template>
    <div class="dashboard">
      <!-- 欢迎信息 -->
      <n-card :bordered="false" class="mb-4 welcome-card" v-if="!hasFullPermission">
        <div class="welcome-container">
            <div class="size-[64px] rounded-lg mr-3 bg-[#f3f3f3] flex items-center justify-center">
                <n-icon class="text-3xl">
                    <UserOutlined />
                </n-icon>
            </div>
          <div class="welcome-info">
            <h2 class="welcome-title">您好, {{ userStore.info?.username || '尊敬的管理员' }}!</h2>
            <p class="welcome-subtitle">欢迎登录管理平台，祝您工作顺利、使用愉快</p>
          </div>
        </div>
      </n-card>
      <!-- 时间范围查询 -->
      <n-card :bordered="false" class="mb-4" v-if="hasFullPermission">
        <n-form inline :label-width="80" label-placement="left">
          <n-form-item label="时间范围">
            <n-date-picker
              v-model:value="timeRange"
              type="datetimerange"
              clearable
              :shortcuts="shortcuts"
            />
          </n-form-item>
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch" :loading="loading">
                <template #icon>
                  <n-icon><SearchOutlined /></n-icon>
                </template>
                查询
              </n-button>
              <n-button @click="handleReset" :disabled="loading">
                <template #icon>
                  <n-icon><ReloadOutlined /></n-icon>
                </template>
                重置
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </n-card>
  
      <!-- 今日数据统计 -->
      <n-card :bordered="false" class="mb-4" title="今日数据" header-style="font-size: 18px; font-weight: bold;" v-if="hasFullPermission">
        <n-grid cols="1 s:2 m:3 l:4 xl:4 2xl:4" responsive="screen" :x-gap="12" :y-gap="12">
          <!-- 第一行 -->
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">充值金额</div>
              <div class="card-value">{{ formatNumber(data?.todayOrder?.money || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">充值人数</div>
              <div class="card-value">{{ data?.todayOrder?.uidCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">首充金额</div>
              <div class="card-value">{{ formatNumber(data?.todayOrder?.firstMoney || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">首充人数</div>
              <div class="card-value">{{ data?.todayOrder?.firstCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          
          <!-- 第二行 -->
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">充值笔数</div>
              <div class="card-value">{{ data?.todayOrder?.count || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">提现金额</div>
              <div class="card-value">{{ formatNumber(data?.todayWithdraw?.money || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">提现人数</div>
              <div class="card-value">{{ data?.todayWithdraw?.uidCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">提现笔数</div>
              <div class="card-value">{{ data?.todayWithdraw?.count || 0 }}</div>
            </n-card>
          </n-grid-item>
  
          <!-- 第三行 -->
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">投注人数</div>
              <div class="card-value">{{ data?.todayLotteryOrder?.uidCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">投注笔数</div>
              <div class="card-value">{{ data?.todayLotteryOrder?.count || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">投注金额</div>
              <div class="card-value">{{ formatNumber(data?.todayLotteryOrder?.money || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">中奖金额</div>
              <div class="card-value">{{ formatNumber(data?.todayLotteryOrder?.openMoney || 0) }}</div>
            </n-card>
          </n-grid-item>
  
          <!-- 第四行 -->
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">投注输赢</div>
              <div class="card-value" :class="getWinLoseClass(data?.todayLotteryOrder?.money, data?.todayLotteryOrder?.openMoney)">
                {{ formatNumber(calculateWinLose(data?.todayLotteryOrder?.money, data?.todayLotteryOrder?.openMoney)) }}
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">注册人数</div>
              <div class="card-value">{{ data?.todayUser?.CreateCount || 0 }}</div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>
  
      <!-- 总数据统计 -->
      <n-card :bordered="false" title="总数据" header-style="font-size: 18px; font-weight: bold;" v-if="hasFullPermission">
        <n-grid cols="1 s:2 m:3 l:4 xl:4 2xl:4" responsive="screen" :x-gap="12" :y-gap="12">
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">会员总注册</div>
              <div class="card-value">{{ data?.totalData?.uidCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">充值金额</div>
              <div class="card-value">{{ formatNumber(data?.totalData?.money || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">提现总金额</div>
              <div class="card-value">{{ formatNumber(data?.totalData?.withdraw || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">订单金额</div>
              <div class="card-value">{{ formatNumber(data?.totalData?.orderMoney || 0) }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">订单数量</div>
              <div class="card-value">{{ data?.totalData?.orderCount || 0 }}</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">订单输赢</div>
              <div class="card-value" :class="getWinLoseClass(data?.totalData?.orderMoney, data?.totalData?.orderOpenMoney)">
                {{ formatNumber(calculateWinLose(data?.totalData?.orderMoney, data?.totalData?.orderOpenMoney)) }}
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card :bordered="false" size="small" class="stat-card">
              <div class="card-title">中奖金额</div>
              <div class="card-value">{{ formatNumber(data?.totalData?.orderOpenMoney || 0) }}</div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { getConsoleInfo, type DashboardData, type ConsoleParams } from '@/api/dashboard/console';
  import { SearchOutlined, ReloadOutlined, UserOutlined } from '@vicons/antd';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from 'naive-ui';
  
  const message = useMessage();
  const userStore = useUserStore();
  const loading = ref(false);
  const timeRange = ref(null);
  const data = ref<DashboardData | null>(null);

  // 判断是否有完全权限
  const hasFullPermission = computed(() => {
    return true
  });
  
  // 时间快捷选项
  const shortcuts = {
    今天: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();
      return [today, now];
    },
    昨天: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return [yesterday, yesterdayEnd];
    },
    本周: () => {
      const now = new Date();
      const weekday = now.getDay() || 7;
      const monday = new Date();
      monday.setDate(now.getDate() - weekday + 1);
      monday.setHours(0, 0, 0, 0);
      return [monday, now];
    },
    本月: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return [firstDay, now];
    }
  }
  
  // 格式化数字显示
  function formatNumber(value) {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('zh-CN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  // 计算输赢
  function calculateWinLose(money, openMoney) {
    money = Number(money || 0);
    openMoney = Number(openMoney || 0);
    return money - openMoney;
  }
  
  // 获取输赢样式
  function getWinLoseClass(money, openMoney) {
    const diff = calculateWinLose(money, openMoney);
    return {
      'win': diff > 0,
      'lose': diff < 0
    };
  }
  
  // 查询数据
  async function fetchData(params?: ConsoleParams) {
    loading.value = true;
    try {
      const res = await getConsoleInfo(params);
      data.value = res.data;
    } catch (error) {
      message.error('获取控制台数据失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  }
  
  // 处理查询
  function handleSearch() {
    if (!timeRange.value) {
      fetchData();
      return;
    }
    
    // 直接使用时间戳，Naive UI 的 n-date-picker 已经返回毫秒级时间戳
    const [start, end] = timeRange.value;
    fetchData({
      sTime: Math.floor(start / 1000),
      eTime: Math.floor(end / 1000)
    });
  }
  
  // 处理重置
  function handleReset() {
    timeRange.value = null;
    fetchData();
  }
  
  // 初始化加载数据
  onMounted(() => {
    if (hasFullPermission.value) {
      fetchData();
    }
  });
  </script>
  
  <style lang="less" scoped>
  .dashboard {
    .welcome-card {
      .welcome-container {
        display: flex;
        align-items: center;
        padding: 16px 0;
        
        .welcome-info {
          .welcome-title {
            font-size: 24px;
            margin: 0 0 8px 0;
          }
          
          .welcome-subtitle {
            font-size: 16px;
            color: #666;
            margin: 0;
          }
        }
      }
    }
  
    .mr-4 {
      margin-right: 16px;
    }
    .mb-4 {
      margin-bottom: 16px;
    }
    
    .stat-card {
      text-align: center;
      
      .card-title {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: bold;
        
        &.win {
          color: #52c41a;
        }
        
        &.lose {
          color: #f5222d;
        }
      }
    }
  }
  </style>