<template>
  <div>
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
import { NButton, NInput, NInputNumber, NIcon } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';

interface ShopLevel {
  level: string;
  value: number;
  recharge_amount: number;
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
    width: 120,
    render: (row: ShopLevel) => {
      return h(NInputNumber, {
        value: row.value,
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
    recharge_amount: 0
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
