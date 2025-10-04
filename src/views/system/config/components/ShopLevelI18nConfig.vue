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
        添加阶梯
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
import { NButton, NInput, NInputNumber, NIcon } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';

interface ShopLevelI18nItem {
  level: string;
  name: string;
  desc: string;
  icon: string;
  sort: number;
}

interface ShopLevelI18nData {
  [lang: string]: ShopLevelI18nItem[];
}

interface Props {
  modelValue: ShopLevelI18nData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ShopLevelI18nData];
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
    title: '星级', 
    key: 'level', 
    width: 100,
    render: (row: ShopLevelI18nItem) => {
      return h(NInput, {
        value: row.level,
        onUpdateValue: (v) => {
          row.level = v;
          updateData();
        },
        placeholder: '星级1'
      });
    }
  },
  { 
    title: '名称', 
    key: 'name', 
    width: 150,
    render: (row: ShopLevelI18nItem) => {
      return h(NInput, {
        value: row.name,
        onUpdateValue: (v) => {
          row.name = v;
          updateData();
        },
        placeholder: '请输入名称'
      });
    }
  },
  { 
    title: '描述', 
    key: 'desc', 
    width: 200,
    render: (row: ShopLevelI18nItem) => {
      return h(NInput, {
        value: row.desc,
        onUpdateValue: (v) => {
          row.desc = v;
          updateData();
        },
        placeholder: '请输入描述'
      });
    }
  },
  { 
    title: '图标', 
    key: 'icon', 
    width: 150,
    render: (row: ShopLevelI18nItem) => {
      return h(NInput, {
        value: row.icon,
        onUpdateValue: (v) => {
          row.icon = v;
          updateData();
        },
        placeholder: '图标URL'
      });
    }
  },
  { 
    title: '排序', 
    key: 'sort', 
    width: 100,
    render: (row: ShopLevelI18nItem) => {
      return h(NInputNumber, {
        value: row.sort,
        onUpdateValue: (v) => {
          row.sort = v ?? 0;
          updateData();
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
    render: (row: ShopLevelI18nItem, index: number) => {
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

// 添加阶梯
function handleAdd() {
  const currentData = getCurrentLangData();
  const newItem: ShopLevelI18nItem = {
    level: `星级${currentData.length + 1}`,
    name: '',
    desc: '',
    icon: '',
    sort: currentData.length + 1
  };
  
  const newData = {
    ...props.modelValue,
    [currentLang.value]: [...currentData, newItem]
  };
  emit('update:modelValue', newData);
}

// 删除阶梯
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
