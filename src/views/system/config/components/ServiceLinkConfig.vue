<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold">{{ title }}</span>
      <n-button size="small" @click="handleAdd">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        {{ addButtonText }}
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
import { NButton, NInput, NSelect, NIcon } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';

interface ServiceLink {
  label: string;
  link: string;
  type: number;
}

interface Props {
  modelValue: ServiceLink[];
  title?: string;
  addButtonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '链接配置',
  addButtonText: '添加链接'
});

const emit = defineEmits<{
  'update:modelValue': [value: ServiceLink[]];
}>();

// 表格列定义
const columns = [
  { 
    title: '链接标签', 
    key: 'label', 
    width: 150,
    render: (row: ServiceLink) => {
      return h(NInput, {
        value: row.label,
        onUpdateValue: (v) => {
          row.label = v;
          emit('update:modelValue', props.modelValue);
        },
        placeholder: '请输入标签'
      });
    }
  },
  { 
    title: '客服链接', 
    key: 'link', 
    width: 300,
    render: (row: ServiceLink) => {
      return h(NInput, {
        value: row.link,
        onUpdateValue: (v) => {
          row.link = v;
          emit('update:modelValue', props.modelValue);
        },
        placeholder: '请输入链接'
      });
    }
  },
  { 
    title: '链接类型', 
    key: 'type', 
    width: 150,
    render: (row: ServiceLink) => {
      return h(NSelect, {
        value: row.type,
        onUpdateValue: (v) => {
          row.type = v;
          emit('update:modelValue', props.modelValue);
        },
        options: [
          { label: '内嵌', value: 1 },
          { label: '跳转app', value: 2 }
        ],
        placeholder: '请选择类型'
      });
    }
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 100, 
    fixed: 'right' as const,
    render: (row: ServiceLink, index: number) => {
      return h(NButton, {
        text: true,
        type: 'error',
        onClick: () => handleRemove(index)
      }, { default: () => '删除' });
    }
  }
];

// 添加链接
function handleAdd() {
  const baseData = Array.isArray(props.modelValue) ? props.modelValue : [];
  const newData = [...baseData, {
    label: '',
    link: '',
    type: 2 // 默认为跳转app
  }];
  emit('update:modelValue', newData);
}

// 删除链接
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
