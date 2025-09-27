<template>
  <n-card :bordered="false">
    <n-spin :show="loading">
      <n-form
        ref="formRef"
        label-placement="left"
        label-width="120"
        require-mark-placement="right-hanging"
      >
        <!-- 基础配置 -->
        <n-divider title-placement="left">基础配置</n-divider>
        <n-grid :cols="1" :x-gap="24">
          <n-grid-item>
            <n-form-item label="网站名称">
              <n-input v-model:value="getConfigValue(1).value" placeholder="请输入网站名称" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="客服链接">
              <n-input v-model:value="getConfigValue(9).value" placeholder="请输入客服链接" />
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <!-- 首页配置 -->
        <n-divider title-placement="left">首页配置</n-divider>
        
        <!-- 统一语言选择器(选项卡形式) -->
        <n-tabs v-model:value="currentLanguage" type="segment" style="margin-bottom: 16px">
          <n-tab-pane name="zh-cn" tab="中文" />
          <n-tab-pane v-for="lang in languageOptions" :key="lang.value" :name="lang.value" :tab="lang.label" />
        </n-tabs>
        
        <n-grid :cols="1" :x-gap="24">
          <n-grid-item v-for="i in 5" :key="i">
            <n-form-item :label="'第' + i + '张轮播图' + (currentLanguage !== 'zh-cn' ? ' (' + getCurrentLanguageLabel() + ')' : '')" :path="'banner_' + i">
              <n-upload
                v-if="currentLanguage === 'zh-cn'"
                v-model:file-list="getConfigValue(3 + i).fileList"
                :max="1"
                list-type="image-card"
                :on-before-upload="handleBeforeUpload"
                :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
                :headers="{
                  'Authorization': token
                }"
                name="image"
                @finish="handleUploadFinish($event, 3 + i, 'zh-cn')"
                @error="handleUploadError"
                @remove="handleRemove(3 + i, 'zh-cn')"
              >
                点击上传
              </n-upload>
              
              <n-upload
                v-else
                v-model:file-list="getLanguageFileList(3 + i, currentLanguage).fileList"
                :max="1"
                list-type="image-card"
                :on-before-upload="handleBeforeUpload"
                :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
                :headers="{
                  'Authorization': token
                }"
                name="image"
                @finish="handleUploadFinish($event, 3 + i, currentLanguage)"
                @error="handleUploadError"
                @remove="handleRemove(3 + i, currentLanguage)"
              >
                点击上传
              </n-upload>
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <!-- 提现配置 -->
        <n-divider title-placement="left">提现配置</n-divider>
        <n-grid :cols="1" :x-gap="24">
          <n-grid-item>
            <n-form-item label="提现金额">
              <n-input-number
                v-model:value="getConfigValue(2).value"
                placeholder="请输入提现金额"
                :min="0"
              >
              </n-input-number>
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="提现次数">
              <n-input-number
                v-model:value="getConfigValue(3).value"
                placeholder="请输入提现次数"
                :min="0"
                :precision="0"
              >
                <template #suffix>次/天</template>
              </n-input-number>
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <!-- 提交按钮 -->
        <n-space justify="center" class="mt-5">
          <n-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="submitting" 
            :disabled="uploadingCount > 0"
          >
            {{ uploadingCount > 0 ? `图片上传中 (${uploadingCount})` : '保存配置' }}
          </n-button>
        </n-space>
      </n-form>
    </n-spin>
  </n-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { getConfigList, saveConfig } from '@/api/config';
import { getAppEnvConfig } from '@/utils/env';
import type { UploadFileInfo } from 'naive-ui';
import { useUser } from '@/store/modules/user';
const {
    VITE_GLOB_API_URL_PREFIX,
  } = getAppEnvConfig();
const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const uploadingCount = ref(0); // 追踪正在进行的上传任务数量
const formRef = ref();
const configList = ref<any[]>([]);
const userStore = useUser();
const token = userStore.getToken;

// 语言选项
const languageOptions = [
  { label: '英文', value: 'en-us' },
  { label: '西班牙语', value: 'es-es' },
  { label: '日语', value: 'ja-jp' },
  { label: '泰语', value: 'th-th' }
];

// 当前选择的语言
const currentLanguage = ref('zh-cn'); // 默认中文

// 获取当前选中语言的标签
const getCurrentLanguageLabel = () => {
  if (currentLanguage.value === 'zh-cn') return '中文';
  const lang = languageOptions.find(lang => lang.value === currentLanguage.value);
  return lang ? lang.label : '中文';
};

// 获取配置值
const getConfigValue = (id: number) => {
  const item = configList.value.find((item) => item.id === id);
  if(item){
    // 如果是轮播图，初始化fileList
    if(id >= 4 && id <= 8) {
      if(!item.fileList) {
        item.fileList = item.value ? [{
          id: id,
          name: `banner${id}.jpg`,
          status: 'finished',
          url: item.value
        }] : []
      }
    }
    if(item.id == 2 || item.id == 3){
      item.value = item.value ? Number(item.value) : null
    }
    return item
  }else{
    const newItem = {
      id,
      value:null,
      fileList: [],
      i18n: {}
    }
    configList.value.push(newItem)
    return newItem
  }
};

// 获取指定语言的文件列表
const getLanguageFileList = (id: number, language: string) => {
  const item = getConfigValue(id);
  
  // 确保 i18n 存在
  if (!item.i18n) {
    item.i18n = {};
  }
  
  // 检查是否有该语言的数据，并确保格式正确
  if (!item.i18n[language]) {
    // 新语言，创建空的数据结构
    item.i18n[language] = {
      value: '',
      fileList: []
    };
  } else if (typeof item.i18n[language] !== 'object') {
    // 如果是简化格式，转换为需要的完整格式
    const url = item.i18n[language];
    item.i18n[language] = {
      value: url,
      fileList: [{
        id: `${id}_${language}`,
        name: `banner${id}_${language}.jpg`,
        status: 'finished',
        url: url
      }]
    };
  }
  
  // 确保有文件列表
  if (!item.i18n[language].fileList) {
    item.i18n[language].fileList = item.i18n[language].value ? [{
      id: `${id}_${language}`,
      name: `banner${id}_${language}.jpg`,
      status: 'finished',
      url: item.i18n[language].value
    }] : [];
  }
  
  return item.i18n[language];
};

// 处理文件上传前的验证
const handleBeforeUpload = (data: { file: UploadFileInfo }) => {
  const { file } = data;
  if (!file.file) return false;
  
  // 验证文件类型
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.file.type)) {
    message.error('只能上传jpg/png/gif格式的图片');
    return false;
  }
  
  // 验证文件大小（2MB）
  if (file.file.size > 2 * 1024 * 1024) {
    message.error('图片大小不能超过2MB');
    return false;
  }
  
  // 增加正在上传的任务数量
  uploadingCount.value++;
  return true;
};

// 处理上传完成
const handleUploadFinish = (options: any, id: number, language = 'zh-cn') => {
  const { file, event } = options;
  const configItem = getConfigValue(id);
  
  try {
    const response = JSON.parse(event.target.response);
    if (response.code === 1) {
      // 更新文件状态和URL
      file.url = response.data.url;
      file.status = 'finished'; // 确保状态更新为完成
      
      // 根据语言处理上传结果
      if (language === 'zh-cn') {
        // 默认中文处理
        configItem.value = response.data.url;
        
        // 更新文件列表
        const existingIndex = configItem.fileList.findIndex(f => f.id === file.id);
        if (existingIndex === -1) {
          // 如果文件不存在于列表中，添加它
          configItem.fileList.push({
            id: file.id,
            name: file.name,
            status: 'finished',
            url: response.data.url
          });
        } else {
          // 如果文件已存在，更新它
          configItem.fileList[existingIndex].url = response.data.url;
          configItem.fileList[existingIndex].status = 'finished';
        }
      } else {
        // 其他语言处理
        if (!configItem.i18n) {
          configItem.i18n = {};
        }
        if (!configItem.i18n[language]) {
          configItem.i18n[language] = { value: '', fileList: [] };
        }
        
        // 更新该语言的值
        configItem.i18n[language].value = response.data.url;
        
        // 确保有文件列表
        if (!configItem.i18n[language].fileList) {
          configItem.i18n[language].fileList = [];
        }
        
        // 更新文件列表
        const existingIndex = configItem.i18n[language].fileList.findIndex(f => f.id === file.id);
        if (existingIndex === -1) {
          // 如果文件不存在于列表中，添加它
          configItem.i18n[language].fileList.push({
            id: file.id,
            name: file.name,
            status: 'finished',
            url: response.data.url
          });
        } else {
          // 如果文件已存在，更新它
          configItem.i18n[language].fileList[existingIndex].url = response.data.url;
          configItem.i18n[language].fileList[existingIndex].status = 'finished';
        }
      }
      
      message.success('上传成功');
    } else {
      message.error('上传失败: ' + response.msg || '未知错误');
      // 删除上传失败的文件
      if (language === 'zh-cn') {
        const index = configItem.fileList.findIndex(f => f.id === file.id);
        if (index !== -1) {
          configItem.fileList.splice(index, 1);
        }
      } else {
        if (configItem.i18n && configItem.i18n[language] && configItem.i18n[language].fileList) {
          const index = configItem.i18n[language].fileList.findIndex(f => f.id === file.id);
          if (index !== -1) {
            configItem.i18n[language].fileList.splice(index, 1);
          }
        }
      }
    }
  } catch (error) {
    console.error('上传响应解析错误:', error);
    message.error('上传失败');
    // 删除上传失败的文件
    if (language === 'zh-cn') {
      const index = configItem.fileList.findIndex(f => f.id === file.id);
      if (index !== -1) {
        configItem.fileList.splice(index, 1);
      }
    } else {
      if (configItem.i18n && configItem.i18n[language] && configItem.i18n[language].fileList) {
        const index = configItem.i18n[language].fileList.findIndex(f => f.id === file.id);
        if (index !== -1) {
          configItem.i18n[language].fileList.splice(index, 1);
        }
      }
    }
  } finally {
    // 无论成功还是失败，减少一个上传任务
    if (uploadingCount.value > 0) {
      uploadingCount.value--;
    }
  }
};

// 处理文件移除
const handleRemove = (id: number, language = 'zh-cn') => {
  const configItem = getConfigValue(id);
  
  // 根据语言清空相应的value值
  if (language === 'zh-cn') {
    // 清空默认语言的值
    configItem.value = '';
  } else if (configItem.i18n && configItem.i18n[language]) {
    // 清空特定语言的值
    configItem.i18n[language].value = '';
  }
  
  return true;
};

// 处理上传错误
const handleUploadError = () => {
  message.error('上传遇到网络错误');
  // 减少一个上传任务
  if (uploadingCount.value > 0) {
    uploadingCount.value--;
  }
};

// 加载配置数据
const loadConfig = async () => {
  try {
    loading.value = true;
    const res:any = await getConfigList({
      page: '1',
      pageSize: '50',
    });
    configList.value = res.data.list;
  } catch (error) {
    message.error('获取配置失败');
  } finally {
    loading.value = false;
  }
};

// 提交配置
const handleSubmit = async () => {
  try {
    submitting.value = true;
    const arr = configList.value.map((item) => {
      // 如果是轮播图配置项
      if (item.id >= 4 && item.id <= 8) {
        // 创建简化的i18n对象，只保留图片URL
        const simplifiedI18n = {};
        
        if (item.i18n) {
          // 遍历所有语言，只提取value属性
          Object.keys(item.i18n).forEach(lang => {
            if (item.i18n[lang] && item.i18n[lang].value) {
              simplifiedI18n[lang] = item.i18n[lang].value;
            }
          });
        }
        
        return {
          id: item.id,
          value: item.value,
          i18n: simplifiedI18n
        };
      } else {
        // 其他常规配置项
        return {
          id: item.id,
          value: item.value
        };
      }
    });
    
    await saveConfig({
      arr
    });
    message.success('保存成功');
  } catch (error) {
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
};

// 表单校验规则
const rules = {
  website_name: {
    required: true,
    message: '请输入网站名称',
    trigger: ['blur', 'input'],
  },
};

onMounted(() => {
  loadConfig();
});
</script>
