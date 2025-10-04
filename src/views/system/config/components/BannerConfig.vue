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
        添加Banner
      </n-button>
    </div>
    
    <n-data-table
      :columns="columns"
      :data="getCurrentLangData()"
      :pagination="false"
      :bordered="false"
      :scroll-x="1200"
    />
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue';
import { NButton, NInput, NInputNumber, NIcon, useMessage } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';
import { getAppEnvConfig } from '@/utils/env';
import { useUser } from '@/store/modules/user';

const { VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
const userStore = useUser();
const message = useMessage();

interface BannerItem {
  sort: number;
  image: string;
  title: string;
  desc: string;
  type: string;
  data: string;
}

interface BannerData {
  [lang: string]: BannerItem[];
}

interface Props {
  modelValue: BannerData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: BannerData];
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
    title: '排序', 
    key: 'sort', 
    width: 100,
    render: (row: BannerItem) => {
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
    title: '背景图片', 
    key: 'image', 
    width: 200,
    render: (row: BannerItem, index: number) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        row.image ? h('img', {
          src: row.image,
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
        }, '无图片'),
        h(NButton, {
          size: 'small',
          onClick: () => handleUploadImage(index)
        }, { default: () => '上传' })
      ]);
    }
  },
  { 
    title: '标题', 
    key: 'title', 
    width: 200,
    render: (row: BannerItem) => {
      return h(NInput, {
        value: row.title,
        onUpdateValue: (v) => {
          row.title = v;
          updateData();
        },
        placeholder: '请输入标题'
      });
    }
  },
  { 
    title: '描述', 
    key: 'desc', 
    width: 200,
    render: (row: BannerItem) => {
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
    title: '类型', 
    key: 'type', 
    width: 150,
    render: (row: BannerItem) => {
      return h(NInput, {
        value: row.type,
        onUpdateValue: (v) => {
          row.type = v;
          updateData();
        },
        placeholder: '路径'
      });
    }
  },
  { 
    title: '数据', 
    key: 'data', 
    width: 200,
    render: (row: BannerItem) => {
      return h(NInput, {
        value: row.data,
        onUpdateValue: (v) => {
          row.data = v;
          updateData();
        },
        placeholder: '/path'
      });
    }
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 100, 
    fixed: 'right' as const,
    render: (row: BannerItem, index: number) => {
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

// 添加Banner
function handleAdd() {
  const currentData = getCurrentLangData();
  const newItem: BannerItem = {
    sort: currentData.length + 1,
    image: '',
    title: '',
    desc: '',
    type: '路径',
    data: ''
  };
  
  const newData = {
    ...props.modelValue,
    [currentLang.value]: [...currentData, newItem]
  };
  emit('update:modelValue', newData);
}

// 删除Banner
function handleRemove(index: number) {
  const currentData = getCurrentLangData();
  const newData = {
    ...props.modelValue,
    [currentLang.value]: currentData.filter((_, i) => i !== index)
  };
  emit('update:modelValue', newData);
}

// 上传图片
function handleUploadImage(index: number) {
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
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      message.loading('上传中...');
      
      const response = await fetch(VITE_GLOB_API_URL_PREFIX + '/admin/file/uploadImage', {
        method: 'POST',
        headers: {
          'Authorization': userStore.getToken
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.code === 1) {
        const currentData = getCurrentLangData();
        currentData[index].image = result.data.url;
        updateData();
        message.success('上传成功');
      } else {
        message.error(result.msg || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      message.error('上传失败');
    }
  };
  
  input.click();
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
