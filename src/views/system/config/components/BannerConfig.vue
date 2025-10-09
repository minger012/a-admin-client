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

  <!-- 富文本编辑弹窗 -->
  <n-modal v-model:show="showRichEditorModal" preset="card" title="编辑富文本内容" style="width: 900px;">
    <QuillEditor
      ref="quillEditorRef"
      :options="editorOptions"
      v-model:content="richEditorContent"
      content-type="html"
      style="height: 400px"
    />
    <template #footer>
      <n-space justify="end">
        <n-button @click="showRichEditorModal = false">取消</n-button>
        <n-button type="primary" @click="handleSaveRichContent">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { h, ref, reactive } from 'vue';
import { NButton, NInput, NInputNumber, NSelect, NIcon, useMessage } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';
import { uploadImage } from '@/api/file';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const message = useMessage();

interface BannerItem {
  sort: number;
  image: string;
  title: string;
  desc: string;
  type: number;
  data: string;
  richContent?: string; // 富文本内容
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
const uploadingIndex = ref<number | null>(null); // 正在上传的索引
const needReorder = ref(false); // 是否需要重新排序

// 富文本编辑
const showRichEditorModal = ref(false);
const currentEditIndex = ref<number>(0);
const richEditorContent = ref('');
const quillEditorRef = ref();

// Quill编辑器配置
const editorOptions = reactive({
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['image', 'link'],
    ],
  },
  theme: 'snow',
  placeholder: '请输入内容...',
});

// 更新数据
function updateData() {
  emit('update:modelValue', { ...props.modelValue });
}

// 编辑富文本
function handleEditRichContent(index: number) {
  const currentData = props.modelValue[currentLang.value] || [];
  currentEditIndex.value = index;
  richEditorContent.value = currentData[index].richContent || '';
  showRichEditorModal.value = true;
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
    try {
      uploadingIndex.value = index;
      message.loading('上传中...');
      
      const result: any = await uploadImage(file);
      
      if (result.code === 1) {
        const currentData = props.modelValue[currentLang.value] || [];
        currentData[index].image = result.data.url;
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

// 表格列定义
const columns = [
  { 
    title: '排序', 
    key: 'sort', 
    width: 100,
    render: (row: BannerItem) => {
      return h(NInputNumber, {
        value: row.sort,
        showButton:false,
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
          disabled: uploadingIndex.value !== null,
          loading: uploadingIndex.value === index,
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
      return h(NSelect, {
        value: row.type,
        onUpdateValue: (v) => {
          row.type = v;
          updateData();
        },
        options: [
          { label: '路径', value: 1 },
          { label: '链接', value: 2 },
          { label: '富文本', value: 3 }
        ],
        placeholder: '请选择类型'
      });
    }
  },
  { 
    title: '数据', 
    key: 'data', 
    width: 200,
    render: (row: BannerItem, index: number) => {
      // 如果是富文本类型，显示编辑按钮
      if (row.type === 3) {
        return h(NButton, {
          size: 'small',
          onClick: () => handleEditRichContent(index)
        }, { default: () => '编辑' });
      }
      // 其他类型显示输入框
      return h(NInput, {
        value: row.data,
        onUpdateValue: (v) => {
          row.data = v;
          updateData();
        },
        placeholder: row.type === 1 ? '/path' : 'https://...'
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
  
  // 如果正在编辑排序，不排序；否则按排序值排序
  const data = props.modelValue[currentLang.value] || [];
  if (needReorder.value) {
    return data;
  }
  return [...data].sort((a, b) => (a.sort || 0) - (b.sort || 0));
}



// 添加Banner
function handleAdd() {
  const currentData = getCurrentLangData();
  const newItem: BannerItem = {
    sort: currentData.length + 1,
    image: '',
    title: '',
    desc: '',
    type: 1, // 默认为路径
    data: '',
    richContent: ''
  };
  
  const newData = {
    ...props.modelValue,
    [currentLang.value]: [...currentData, newItem]
  };
  emit('update:modelValue', newData);
}

// 保存富文本
function handleSaveRichContent() {
  const currentData = props.modelValue[currentLang.value] || [];
  currentData[currentEditIndex.value].richContent = richEditorContent.value;
  updateData();
  showRichEditorModal.value = false;
  message.success('保存成功');
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


</script>

<style lang="less" scoped>
.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
