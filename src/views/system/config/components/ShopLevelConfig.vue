<template>
  <div class="-mt-11">
    <div class="mb-3 flex justify-end">
      <n-button size="small" @click="handleAdd">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        添加
      </n-button>
    </div>
    <n-data-table
      :columns="columns"
      :data="modelValue"
      :pagination="false"
      :bordered="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { h } from 'vue';
import { NButton, NInput, NInputNumber, NIcon, NSpace } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';

interface ShopLevel {
  level: string;
  value: number;
  recharge_amount: number;
  fee_rate_min: number; // 最小手续费率 2-15%
  fee_rate_max: number; // 最大手续费率 2-15%
  subordinate_limit: number; // 下线限制，0表示无限制
  daily_ad_count_min: number; // 每日最少广告投放次数 2-4次
  daily_ad_count_max: number; // 每日最多广告投放次数 2-4次
}

interface Props {
  modelValue: ShopLevel[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ShopLevel[]];
}>();

// 表格列定义
const columns = [
  { 
    title: '星级名称', 
    key: 'level', 
    width: 150,
    render: (row: ShopLevel) => {
      return h(NInput, {
        value: row.level,
        onUpdateValue: (v) => {
          row.level = v;
          emit('update:modelValue', props.modelValue);
        },
        placeholder: '星级1'
      });
    }
  },
  { 
    title: '星级值', 
    key: 'value', 
    width: 100,
    render: (row: ShopLevel) => {
      return h(NInputNumber, {
        value: row.value,
        showButton: false,
        onUpdateValue: (v) => {
          row.value = v ?? 0;
          emit('update:modelValue', props.modelValue);
        },
        min: 0,
        style: { width: '100%' }
      });
    }
  },
  { 
    title: '充值升级金额', 
    key: 'recharge_amount', 
    width: 150,
    render: (row: ShopLevel) => {
      return h(NInputNumber, {
        value: row.recharge_amount,
        showButton: false,
        onUpdateValue: (v) => {
          row.recharge_amount = v ?? 0;
          emit('update:modelValue', props.modelValue);
        },
        min: 0,
        style: { width: '100%' }
      });
    }
  },
  { 
    title: '手续费率(%)', 
    key: 'fee_rate', 
    width: 240,
    render: (row: ShopLevel) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NInputNumber, {
            value: row.fee_rate_min,
            showButton: false,
            onUpdateValue: (v) => {
              row.fee_rate_min = v ?? 2;
              emit('update:modelValue', props.modelValue);
            },
            step: 0.1,
            placeholder: '最小',
            style: { width: '90px' }
          }),
          h('span', '~'),
          h(NInputNumber, {
            value: row.fee_rate_max,
            showButton: false,
            onUpdateValue: (v) => {
              row.fee_rate_max = v ?? 15;
              emit('update:modelValue', props.modelValue);
            },
            step: 0.1,
            placeholder: '最大',
            style: { width: '90px' }
          })
        ]
      });
    }
  },
  { 
    title: '下线限制', 
    key: 'subordinate_limit', 
    width: 150,
    render: (row: ShopLevel) => {
      return h(NInputNumber, {
        value: row.subordinate_limit,
        showButton: false,
        onUpdateValue: (v) => {
          row.subordinate_limit = v ?? 0;
          emit('update:modelValue', props.modelValue);
        },
        min: 0,
        placeholder: '0表示无限制',
        style: { width: '100%' }
      });
    }
  },
  { 
    title: '每日广告投放次数', 
    key: 'daily_ad_count', 
    width: 240,
    render: (row: ShopLevel) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NInputNumber, {
            value: row.daily_ad_count_min,
            showButton: false,
            onUpdateValue: (v) => {
              row.daily_ad_count_min = v ?? 2;
              emit('update:modelValue', props.modelValue);
            },
            placeholder: '最少',
            style: { width: '90px' }
          }),
          h('span', '~'),
          h(NInputNumber, {
            showButton: false,
            value: row.daily_ad_count_max,
            onUpdateValue: (v) => {
              row.daily_ad_count_max = v ?? 4;
              emit('update:modelValue', props.modelValue);
            },
            placeholder: '最多',
            style: { width: '90px' }
          })
        ]
      });
    }
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 100, 
    fixed: 'right' as const,
    render: (row: ShopLevel, index: number) => {
      return h(NButton, {
        text: true,
        type: 'error',
        onClick: () => handleRemove(index)
      }, { default: () => '删除' });
    }
  }
];

// 添加星级
function handleAdd() {
  const baseData = Array.isArray(props.modelValue) ? props.modelValue : [];
  const newData = [...baseData, {
    level: `星级${baseData.length + 1}`,
    value: baseData.length + 1,
    recharge_amount: 0,
    fee_rate_min: 2, // 默认最小2%
    fee_rate_max: 15, // 默认最大5%
    subordinate_limit: 0, // 默认无限制
    daily_ad_count_min: 2, // 默认最少2次
    daily_ad_count_max: 4 // 默认最大4次
  }];
  emit('update:modelValue', newData);
}

// 删除星级
function handleRemove(index: number) {
  const baseData = Array.isArray(props.modelValue) ? props.modelValue : [];
  const newData = baseData.filter((_, i) => i !== index);
  emit('update:modelValue', newData);
}
</script>

<style lang="less" scoped>
.mb-3 {
  margin-bottom: 12px;
}
</style>
