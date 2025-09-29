<template>
  <n-select
    v-model:value="selectedValue"
    filterable
    remote
    :loading="loading"
    :options="options"
    :placeholder="placeholder"
    @search="handleSearch"
    @update:value="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { goodsList } from '@/api/goods';
import { useMessage } from 'naive-ui';

interface ProductOption {
  label: string;
  value: number;
}

interface ProductItem {
  id: number;
  name: string;
  [key: string]: any;
}

interface ApiResponse {
  code: number;
  data: {
    list: ProductItem[];
    [key: string]: any;
  };
  [key: string]: any;
}

const props = defineProps({
  value: {
    type: [Number, String],
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择产品'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value', 'change']);

const message = useMessage();
const loading = ref(false);
const options = ref<ProductOption[]>([]);
const selectedValue = ref(props.value);

// 监听外部value变化
watch(() => props.value, (newVal) => {
  selectedValue.value = newVal;
});

// 监听内部选择变化
watch(() => selectedValue.value, (newVal) => {
  emit('update:value', newVal);
  emit('change', newVal);
});

// 初始加载产品列表
onMounted(() => {
  loadProducts();
});

// 加载产品列表
async function loadProducts(keyword = '') {
  loading.value = true;
  try {
    const params: { page: string; pageSize: string; name?: string } = {
      page: '1',
      pageSize: '100',
    };
    
    // 如果有关键字，添加到查询参数
    if (keyword) {
      params.name = keyword;
    }
    
    const res = await goodsList(params) as ApiResponse;
    if (res.code === 1) {
      const productList = res.data.list || [];
      options.value = productList.map(item => ({
        label: `${item.name} (ID: ${item.id})`,
        value: item.id
      }));
      
      // 如果当前选中的产品不在列表中，且有选中值，则添加当前选中的产品到选项中
      if (selectedValue.value && !options.value.some(option => option.value === selectedValue.value)) {
        // 尝试获取产品详情
        const currentProduct = productList.find(p => p.id === selectedValue.value);
        if (currentProduct) {
          options.value.unshift({
            label: `${currentProduct.name} (ID: ${currentProduct.id})`,
            value: currentProduct.id
          });
        }
      }
    } else {
      message.error('获取产品列表失败');
    }
  } catch (error) {
    console.error('加载产品列表错误:', error);
    message.error('获取产品列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
function handleSearch(keyword) {
  if (keyword) {
    loadProducts(keyword);
  }
}

// 处理选择变化
function handleChange(value) {
  selectedValue.value = value;
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
