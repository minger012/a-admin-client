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
    
    <QuillEditor
      v-model:content="currentContent"
      contentType="html"
      theme="snow"
      placeholder="请输入服务条款内容"
      :toolbar="toolbarOptions"
      @update:content="handleUpdate"
      style="min-height: 400px;"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface TermsData {
  [lang: string]: string;
}

interface Props {
  modelValue: TermsData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: TermsData];
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
const currentContent = ref('');

// 富文本编辑器工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link'],
  ['clean']
];

// 监听语言切换，更新当前内容
watch(currentLang, (newLang) => {
  if (props.modelValue && typeof props.modelValue === 'object') {
    currentContent.value = props.modelValue[newLang] || '';
  } else {
    currentContent.value = '';
  }
}, { immediate: true });

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    currentContent.value = newVal[currentLang.value] || '';
  } else {
    currentContent.value = '';
  }
}, { deep: true });

// 更新数据
function handleUpdate(value: string) {
  const baseData = (props.modelValue && typeof props.modelValue === 'object') ? props.modelValue : {};
  const newData = {
    ...baseData,
    [currentLang.value]: value
  };
  emit('update:modelValue', newData);
}
</script>

<style lang="less" scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
