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
import { NButton, NInput, NInputNumber, NIcon, useMessage } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';
import { uploadImage } from '@/api/file';

const message = useMessage();

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
const uploadingIndex = ref<number | null>(null); // 正在上传的索引
const needReorder = ref(false); // 是否需要重新排序

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
    width: 200,
    render: (row: ShopLevelI18nItem, index: number) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        row.icon ? h('img', {
          src: row.icon,
          style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }
        }) : h('div', {
          style: {
            width: '60px',
            height: '60px',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px'
          }
        }, '无图标'),
        h(NButton, {
          size: 'small',
          disabled: uploadingIndex.value !== null,
          loading: uploadingIndex.value === index,
          onClick: () => handleUploadIcon(index)
        }, { default: () => '上传' })
      ]);
    }
  },
  { 
    title: '排序', 
    key: 'sort', 
    width: 100,
    render: (row: ShopLevelI18nItem) => {
      return h(NInputNumber, {
        value: row.sort,
        showButton: false,
        onUpdateValue: (v) => {
          row.sort = v ?? 0;
          needReorder.value = true;
          updateData();
        },
        onBlur: () => {
          if (needReorder.value) {
            needReorder.value = false;
            // 延迟执行排序，确保数据已更新
            setTimeout(() => {
              updateData();
            }, 0);
          }
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
    render: (_row: ShopLevelI18nItem, index: number) => {
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
  
  // 如果正在编辑排序，不排序；否则按排序值排序
  const data = props.modelValue[currentLang.value] || [];
  if (needReorder.value) {
    return data;
  }
  return [...data].sort((a, b) => (a.sort || 0) - (b.sort || 0));
}

// 更新数据
function updateData() {
  emit('update:modelValue', { ...props.modelValue });
}

// 上传图标
function handleUploadIcon(index: number) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/gif';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      message.error('只能上传jpg/png/gif格式的图片');
      return;
    }
    
    // 验证文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB');
      return;
    }
    
    // 上传文件
    try {
      uploadingIndex.value = index;
      message.loading('上传中...');
      
      const result: any = await uploadImage(file);
      
      if (result.code === 1) {
        const currentData = props.modelValue[currentLang.value] || [];
        currentData[index].icon = result.data.url;
        updateData();
        message.success('上传成功');
      } else {
        message.error(result.msg || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      message.error('上传失败');
    } finally {
      uploadingIndex.value = null;
    }
  };
  
  input.click();
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
