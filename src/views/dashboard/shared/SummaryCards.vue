<template>
  <n-grid :cols="cols" responsive="screen" :x-gap="12" :y-gap="12">
    <n-grid-item v-for="(card, index) in cards" :key="index">
      <n-card :bordered="false" class="summary-card">
        <div class="card-label">{{ card.label }}</div>
        <div class="card-value">
          <span v-if="card.prefix">{{ card.prefix }}</span>
          {{ formatValue(card.value) }}
          <span v-if="card.suffix">{{ card.suffix }}</span>
        </div>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts" setup>
  interface SummaryCard {
    label: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
  }

  interface Props {
    cards: SummaryCard[];
    cols?: string;
  }

  withDefaults(defineProps<Props>(), {
    cols: '1 s:2 m:3 l:3 xl:3 2xl:3',
  });

  function formatValue(value: number | string): string {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
    return value;
  }
</script>

<style lang="less" scoped>
  .summary-card {
    text-align: center;
    padding: 20px 16px;

    .card-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }
</style>
