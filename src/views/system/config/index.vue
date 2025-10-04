<template>
  <div class="config-container">
    <n-spin :show="loading">
      <n-space vertical :size="16">
        <!-- 基础配置卡片 -->
        <n-card title="基础配置" :bordered="false">
          <n-form
            ref="formRef"
            :model="formData"
            label-placement="left"
            :label-width="120"
          >
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="货币符号">
                  <n-input 
                    v-model:value="configMap[1].content" 
                    placeholder="请输入货币符号（如：$）" 
                  />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="货币代码">
                  <n-input 
                    v-model:value="configMap[2].content" 
                    placeholder="请输入货币代码（如：USD）" 
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-form>
        </n-card>

        <!-- 客服链接配置卡片 -->
        <n-card title="客服链接" :bordered="false">
          <n-space vertical size="large">
            <ServiceLinkConfig 
              v-model="configMap[3].content" 
              title="链接标签"
              add-button-text="添加客服链接"
              v-if="configMap[3]"
            />
            <ServiceLinkConfig 
              v-model="configMap[4].content" 
              title="充值客服链接"
              add-button-text="添加充值客服链接"
              v-if="configMap[4]"
            />
          </n-space>
        </n-card>

        <!-- 店铺星级配置卡片 -->
        <n-card title="店铺星级配置" :bordered="false" v-if="configMap[5]">
          <ShopLevelConfig v-model="configMap[5].content" />
        </n-card>

        <!-- 店铺星级多语言映射配置卡片 -->
        <n-card title="店铺星级多语言映射配置" :bordered="false" v-if="configMap[6]">
          <ShopLevelI18nConfig v-model="configMap[6].content" />
        </n-card>

        <!-- 常见问题配置卡片 -->
        <n-card title="常见问题配置" :bordered="false" v-if="configMap[7]">
          <FAQConfig v-model="configMap[7].content" />
        </n-card>

        <!-- 服务条款卡片 -->
        <n-card title="服务条款" :bordered="false" v-if="configMap[8]">
          <TermsConfig v-model="configMap[8].content" />
        </n-card>

        <!-- 广告中心Banner配置卡片 -->
        <n-card title="广告中心Banner配置" :bordered="false" v-if="configMap[9]">
          <BannerConfig v-model="configMap[9].content" />
        </n-card>

        <!-- 保存按钮 -->
        <n-space justify="center" class="mt-8">
          <n-button 
            type="primary" 
            size="large"
            @click="handleSave" 
            :loading="saving"
          >
            保存配置
          </n-button>
        </n-space>
      </n-space>
    </n-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { getConfigList, editConfig } from '@/api/config';
import ServiceLinkConfig from './components/ServiceLinkConfig.vue';
import ShopLevelConfig from './components/ShopLevelConfig.vue';
import ShopLevelI18nConfig from './components/ShopLevelI18nConfig.vue';
import FAQConfig from './components/FAQConfig.vue';
import TermsConfig from './components/TermsConfig.vue';
import BannerConfig from './components/BannerConfig.vue';

const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const formRef = ref();

// 配置数据结构
interface ConfigItem {
  id: number;
  title: string;
  content: any;
}

const formData = reactive({});
const configMap = ref<Record<number, ConfigItem>>({});
const configList = ref<ConfigItem[]>([]);

// 初始化配置项
const initConfigMap = () => {
  const defaultConfigs = [
    { id: 1, title: '货币符号', content: '$' },
    { id: 2, title: '货币代码', content: 'USD' },
    { id: 3, title: '客服链接', content: [] },
    { id: 4, title: '充值客服链接', content: [] },
    { id: 5, title: '店铺星级配置', content: [] },
    { id: 6, title: '店铺星级多语言映射配置', content: {} },
    { id: 7, title: '常见问题配置', content: {} },
    { id: 8, title: '服务条款', content: {} },
    { id: 9, title: '广告中心Banner配置', content: {} },
  ];

  defaultConfigs.forEach(config => {
    configMap.value[config.id] = { ...config };
  });
};

// 加载配置数据
async function loadConfig() {
  try {
    loading.value = true;
    const res: any = await getConfigList({
      page: '1',
      pageSize: '50',
    });
    
    if (res.code === 1 && res.data.list) {
      configList.value = res.data.list;
      // 合并后端数据到configMap，注意API返回的是value字段
      res.data.list.forEach((item: any) => {
        if (configMap.value[item.id]) {
          configMap.value[item.id].content = item.value || item.content;
        }
      });
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    message.error('加载配置失败');
  } finally {
    loading.value = false;
  }
}

// 保存配置
async function handleSave() {
  try {
    saving.value = true;
    
    // 组装提交数据
    const config = Object.values(configMap.value).map(item => ({
      id: item.id,
      content: item.content,
    }));
    
    const res: any = await editConfig({ config });
    
    if (res.code === 1) {
      message.success('保存成功');
      loadConfig(); // 重新加载数据
    } else {
      message.error(res.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
}
initConfigMap();
loadConfig();
</script>

<style lang="less" scoped>
.mt-8 {
  margin-top: 32px;
}
</style>
