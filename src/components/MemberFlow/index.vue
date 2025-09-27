<template>
  <div class="member-flow">
    <n-card :bordered="false">
      <n-data-table
        ref="tableRef"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="false"
        :row-key="row => row.id"
        :striped="true"
      />
      <div class="pagination-container">
        <n-pagination
          v-model:page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          :page-sizes="pagination.pageSizes"
          :show-size-picker="pagination.showSizePicker"
          @update:page="onPageChange"
          @update:page-size="onPageSizeChange"
        >
          <template #suffix="{ itemCount }">
            共 {{ pagination.itemCount }} 条
          </template>
        </n-pagination>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { h, onMounted, ref, reactive, PropType, watch } from 'vue';
import { NCard, NDataTable, NTag, NPagination, NText, useMessage } from 'naive-ui';
import { getFlowList } from '@/api/member/flow';

const props = defineProps({
  memberId: {
    type: Number as PropType<number>,
    required: true
  }
});

const message = useMessage();
const loading = ref(false);
const tableData = ref([]);
const tableRef = ref();

// 分页对象
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageCount: 1,
  pageSizes: [10, 20, 30, 50],
  showSizePicker: true
});

// 查询参数
const searchParams = reactive({
  page: 1,
  pageSize: 10,
  id: props.memberId
});

// 定义类型常量映射
const FLOW_TYPE_MAP = {
  1: { label: '后台充值', type: 'success' },
  2: { label: '下单', type: 'error' },
  3: { label: '开奖', type: 'success' },
  4: { label: '提现', type: 'error' },
  5: { label: '后台扣款', type: 'error' },
  6: { label: '提现失败', type: 'warning' },
  7: { label: '彩金', type: 'success' },
  8: { label: '扣除彩金', type: 'error' },
  9: { label: '下单超时取消', type: 'error' },
};

// 分页方法
const onPageChange = (currentPage) => {
  console.log('页码变化为:', currentPage);
  searchParams.page = currentPage;
  loadFlowData();
};

const onPageSizeChange = (size) => {
  console.log('每页条数变化为:', size);
  searchParams.pageSize = size;
  if (pagination.page !== 1) {
    pagination.page = 1; // 重置到第一页
    searchParams.page = 1;
  }
  loadFlowData();
};

// 表格列配置
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render(row) {
      const typeInfo = FLOW_TYPE_MAP[row.type] || { label: '未知类型', type: 'default' };
      return h(
        NTag,
        {
          type: typeInfo.type,
          bordered: false
        },
        { default: () => typeInfo.label }
      );
    }
  },
  {
    title: '变动金额',
    key: 'cha',
    width: 120,
    render(row) {
      const isPositive = parseFloat(row.cha) >= 0;
      return h(
        'span', 
        { 
          style: { 
            color: isPositive ? '#18a058' : '#d03050',
            fontWeight: 'bold'
          } 
        }, 
        isPositive ? `+${row.cha}` : row.cha
      );
    }
  },
  {
    title: '变动前金额',
    key: 'before',
    width: 120,
  },
  {
    title: '变动后金额',
    key: 'after',
    width: 120,
  },
  {
    title: '期号',
    key: 'period_no',
    width: 150,
  },
  {
    title: '产品',
    key: 'goods_name',
    width: 100,
  },
  {
    title: '备注',
    key: 'remarks',
    width: 150,
  },
  {
    title: '时间',
    key: 'create_time',
    width: 180,
    render(row) {
      return h('span', {}, formatTime(row.create_time));
    }
  }
];

// 时间戳格式化
function formatTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 加载流水记录数据
async function loadFlowData() {
  if (!props.memberId) return;
  
  loading.value = true;
  try {
    // 更新会员ID
    searchParams.id = props.memberId;
    
    const res = await getFlowList(searchParams);
    
    if (res.code === 1) {
      tableData.value = res.data.list || [];
      
      // 设置分页信息
      pagination.itemCount = res.data.total || 0;
      pagination.page = res.data.page || searchParams.page;
      pagination.pageSize = res.data.page_size || searchParams.pageSize;
      pagination.pageCount = Math.ceil(pagination.itemCount / pagination.pageSize);
      
      console.log('分页数据:', {
        total: pagination.itemCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        pageCount: pagination.pageCount
      });
    } else {
      message.error(res.msg || '获取账变记录失败');
    }
  } catch (error) {
    console.error('获取账变记录失败:', error);
    message.error('获取账变记录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

watch(()=>props.memberId,()=>{
  onPageChange(1)
})

// 初始加载数据
onMounted(() => {
  loadFlowData();
});

// 向父组件暴露的方法
defineExpose({
  refresh: loadFlowData
});
</script>

<style lang="less" scoped>
.member-flow {
  width: 100%;
}

.pagination-container {
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 12px 0;
  margin-top: 12px;
  
  .pagination-info {
    margin-right: 12px;
  }
}
</style>
