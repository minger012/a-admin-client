<template>
  <div class="ranking-list">
    <div class="ranking-title">{{ title }}</div>
    <div class="ranking-items">
      <div v-for="(item, index) in items" :key="item.user_id" class="ranking-item">
        <div class="ranking-avatar" :class="`rank-${index + 1}`">
          {{ index == 0 ? '🥇' : index == 1 ? '🥈' : index == 2 ? '🥉' : index + 1 }}
        </div>
        <div class="ranking-info">
          <div class="user-id">{{ item.user_id }} (FB: {{ item.fb_id }})</div>
          <div class="user-stats">
            {{ getActionText() }} {{ item.order_count || item.withdraw_count }} 次，总金额 ¥{{ formatNumber(item.total_amount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  interface RankingItem {
    user_id: number;
    fb_id: string;
    order_count?: number;
    withdraw_count?: number;
    total_amount: number;
  }

  interface Props {
    title: string;
    items: RankingItem[];
    actionType?: 'recharge' | 'withdraw';
  }

  const props = withDefaults(defineProps<Props>(), {
    actionType: 'recharge',
  });

  function getActionText() {
    return props.actionType === 'withdraw' ? '共提现' : '共充值';
  }

  function formatNumber(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
</script>

<style lang="less" scoped>
  .ranking-list {
    .ranking-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .ranking-items {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .ranking-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          margin-right: 12px;
          flex-shrink: 0;

          &.rank-1 {
            background-color: #ff9800;
          }

          &.rank-2 {
            background-color: #9c27b0;
          }

          &.rank-3 {
            background-color: #ffc107;
          }
        }

        .ranking-info {
          flex: 1;
          min-width: 0;

          .user-id {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .user-stats {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }
</style>
