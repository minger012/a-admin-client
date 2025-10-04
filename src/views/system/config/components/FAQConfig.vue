<template>
  <div>
    <n-tabs v-model:value="currentLang" type="segment" class="mb-4">
      <n-tab-pane 
        v-for="lang in languageOptions" 
        :key="lang.value" 
        :name="lang.value" 
        :tab="lang.label" 
      />
    </n-tabs>
    
    <div class="mb-3 flex justify-end">
      <n-button size="small" @click="handleAdd">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        添加问题
      </n-button>
    </div>
    
    <n-data-table
      :columns="columns"
      :data="getCurrentLangData()"
      :pagination="false"
      :bordered="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue';
import { NButton, NInput, NIcon } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQData {
  [lang: string]: FAQItem[];
}

interface Props {
  modelValue: FAQData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: FAQData];
}>();

// 语言选项
const languageOptions = [
  { label: '日本語', value: 'ja-ja' },
  { label: 'english', value: 'en-us' },
  { label: '中文', value: 'zh-cn' },
  { label: '繁體', value: 'zh-tw' },
  { label: '한국어', value: 'ko-ko' },
  { label: 'Việt nam', value: 'vi-vi' },
];

const currentLang = ref('ja-ja');

// 表格列定义
const columns = [
  { 
    title: '问题', 
    key: 'question', 
    width: 300,
    render: (row: FAQItem) => {
      return h(NInput, {
        value: row.question,
        type: 'textarea',
        rows: 2,
        onUpdateValue: (v) => {
          row.question = v;
          updateData();
        },
        placeholder: '请输入问题'
      });
    }
  },
  { 
    title: '答案', 
    key: 'answer',
    render: (row: FAQItem) => {
      return h(NInput, {
        value: row.answer,
        type: 'textarea',
        rows: 3,
        onUpdateValue: (v) => {
          row.answer = v;
          updateData();
        },
        placeholder: '请输入答案'
      });
    }
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 100, 
    fixed: 'right' as const,
    render: (row: FAQItem, index: number) => {
      return h(NButton, {
        text: true,
        type: 'error',
        onClick: () => handleRemove(index)
      }, { default: () => '删除' });
    }
  }
];

// 获取当前语言的数据
function getCurrentLangData() {
  // 确保modelValue存在且是对象
  if (!props.modelValue || typeof props.modelValue !== 'object') {
    emit('update:modelValue', {});
    return [];
  }
  
  if (!props.modelValue[currentLang.value]) {
    const newData = { ...props.modelValue, [currentLang.value]: [] };
    emit('update:modelValue', newData);
    return [];
  }
  return props.modelValue[currentLang.value] || [];
}

// 更新数据
function updateData() {
  emit('update:modelValue', { ...props.modelValue });
}

// 添加问题
function handleAdd() {
  const currentData = getCurrentLangData();
  const newItem: FAQItem = {
    question: '',
    answer: ''
  };
  
  const newData = {
    ...props.modelValue,
    [currentLang.value]: [...currentData, newItem]
  };
  emit('update:modelValue', newData);
}

// 删除问题
function handleRemove(index: number) {
  const currentData = getCurrentLangData();
  const newData = {
    ...props.modelValue,
    [currentLang.value]: currentData.filter((_, i) => i !== index)
  };
  emit('update:modelValue', newData);
}
</script>

<style lang="less" scoped>
.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
