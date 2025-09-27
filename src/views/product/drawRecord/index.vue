<template>
  <n-card :bordered="false" class="mt-3">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <n-space>
        <n-select
          v-model:value="searchForm.goods_id"
          placeholder="请选择产品"
          :options="productOptions"
          filterable
          clearable
          :loading="productLoading"
          style="width: 200px"
        />
        <n-input 
          v-model:value="searchForm.period_no" 
          placeholder="请输入期号" 
          style="width: 200px"
        />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button @click="resetSearch">重置</n-button>
      </n-space>
    </div>

    <!-- 表格 -->
    <BasicTable
      ref="tableRef"
      :columns="[...columns, actionColumn]"
      :request="loadTableData"
      :row-key="(row) => row.id"
      :scroll-x="1200"
      :striped="true"
      :loading="loading"
    >
    </BasicTable>
  </n-card>
  <!-- 开奖详情弹窗 -->
  <n-modal v-model:show="showDetailModal" :show-icon="false" preset="dialog" title="开奖详情">
    <n-descriptions v-if="detailData" bordered label-placement="left" :column="1" class="py-4">
      <n-descriptions-item label="ID">
        {{ detailData.id }}
      </n-descriptions-item>
      <n-descriptions-item label="期号">
        {{ detailData.period_no }}
      </n-descriptions-item>
      <n-descriptions-item label="开始时间">
        {{ detailData.start_time ? formatToDateTime(detailData.start_time * 1000) : '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="结束时间">
        {{ detailData.end_time ? formatToDateTime(detailData.end_time * 1000) : '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="开奖时间">
        {{ detailData.open_time ? formatToDateTime(detailData.open_time * 1000) : '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="状态">
        <n-tag :type="statusTypeMap[detailData.status]">
          {{ statusMap[detailData.status] }}
        </n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="大小">
        {{ bigSmallMap[detailData.big_small] }}
      </n-descriptions-item>
      <n-descriptions-item label="单双">
        {{ singleDoubleMap[detailData.single_double] }}
      </n-descriptions-item>
    </n-descriptions>

    <template #action>
      <n-space>
        <n-button @click="() => (showDetailModal = false)">关闭</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- 编辑期号弹窗 -->
  <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑期号">
    <n-form
      :model="editForm"
      :rules="editRules"
      ref="editFormRef"
      label-placement="left"
      :label-width="100"
      class="py-4"
    >
      <n-form-item label="期号" path="period_no">
        <n-input placeholder="请输入期号" v-model:value="editForm.period_no" disabled />
      </n-form-item>
      <n-form-item label="单双" path="single_double">
        <n-radio-group v-model:value="editForm.single_double">
          <n-space>
            <n-radio value="single">单</n-radio>
            <n-radio value="double">双</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="大小" path="big_small">
        <n-radio-group v-model:value="editForm.big_small">
          <n-space>
            <n-radio value="big">大</n-radio>
            <n-radio value="small">小</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="限制所有人投注" path="impose">
        <n-radio-group v-model:value="editForm.impose">
          <n-space>
            <n-radio value="1">是</n-radio>
            <n-radio value="0">否</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="限制用户列表" path="impose_user">
        <n-input
          type="textarea"
          placeholder="请输入限制用户名，用逗号隔开"
          v-model:value="editForm.impose_user"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="() => (showEditModal = false)">取消</n-button>
        <n-button type="info" :loading="editBtnLoading" @click="confirmEdit">确定</n-button>
      </n-space>
    </template>
  </n-modal>

</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue';
import { BasicTable, TableAction } from '@/components/Table';
import type { BasicColumn } from '@/components/Table';
import { NButton, NTag, NSpace, NModal, NDescriptions, NDescriptionsItem, NInput, NSelect, useMessage, FormRules, NForm, NFormItem, NRadio, NRadioGroup } from 'naive-ui';
import { formatToDateTime } from '@/utils/dateUtil';
import { getLotteryPeriodList } from '@/api/lottery';
import { goodsList } from '@/api/goods';
import { columns, DrawRecordData } from './columns';
import { bigSmallMap, singleDoubleMap } from '@/constants/common';


// 状态映射
const statusMap = {
  0: '未开奖',
  1: '已开奖',
};

// 状态类型映射
const statusTypeMap = {
  0: 'warning',
  1: 'success',
};

const message = useMessage();
const tableRef = ref();
const loading = ref(false);
const productLoading = ref(false);
const productOptions = ref([]);

// 详情弹窗
const showDetailModal = ref(false);
const detailData = ref<DrawRecordData | null>(null);

// 编辑弹窗
const showEditModal = ref(false);
const editFormRef = ref();
const editBtnLoading = ref(false);
const editForm = reactive({
  period_no: '',
  single_double: 'single',
  big_small: 'big',
  impose: '0',
  impose_user: '',
});

// 编辑表单验证规则
const editRules: FormRules = {
  period_no: {
    required: true,
    message: '期号不能为空',
    trigger: ['blur', 'input'],
  },
  single_double: {
    required: true,
    message: '请选择单双',
    trigger: ['blur', 'change'],
  },
  big_small: {
    required: true,
    message: '请选择大小',
    trigger: ['blur', 'change'],
  }
};

// 搜索条件
const searchForm = ref({
  goods_id: null,
  period_no: '',
  status: '1',
});

// 加载表格数据
const loadTableData = async ({ page, pageSize }) => {
  try {
    loading.value = true;
    const params = {
      page: String(page),
      pageSize: String(pageSize),
      status: searchForm.value.status,
    };
    
    // 添加产品ID和期号参数（如果有）
    if (searchForm.value.goods_id) {
      params.goods_id = searchForm.value.goods_id;
    }
    
    if (searchForm.value.period_no) {
      params.period_no = searchForm.value.period_no;
    }
    
    const res = await getLotteryPeriodList(params);
    
    // 如果有数据并且产品ID不为空，获取产品名称信息
    if (res.data && res.data.list && Array.isArray(res.data.list) && res.data.list.length > 0) {
      // 收集所有产品ID
      const goodsIds = [];
      const goodsIdMap = {};
      
      res.data.list.forEach(item => {
        if (item.goods_id && !goodsIdMap[item.goods_id]) {
          goodsIds.push(item.goods_id);
          goodsIdMap[item.goods_id] = true;
        }
      });
      
      // 如果有产品ID，获取产品信息
      if (goodsIds.length > 0) {
        try {
          const goodsRes = await goodsList({
            page: 1,
            pageSize: 100,
            ids: goodsIds.join(','),
          });
          
          const goodsMap = {};
          if (goodsRes.data && goodsRes.data.list) {
            goodsRes.data.list.forEach(item => {
              goodsMap[item.id] = item.name;
            });
          }
          
          // 将产品名称补充到列表数据中
          res.data.list.forEach(item => {
            if (item.goods_id) {
              item.goods_name = goodsMap[item.goods_id] || '-';
            } else {
              item.goods_name = '-';
            }
          });
        } catch (err) {
          console.error('获取产品信息失败', err);
        }
      }
    }
    const responseData = res.data;
    return {
      page: responseData.page,
      pageSize: responseData.page_size,
      pageCount: responseData.total_page,
      itemCount: responseData.total,
      list: responseData.list || [],
    }
  } catch (error) {
    message.error('获取开奖记录失败');
    return {
      list: [],
      page: 1,
      pageCount: 0,
      pageSize: 10,
      itemCount: 0,
    };
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    goods_id: '',
    period_no: '',
    status: '1',
  };
  reload();
};

// 搜索
const handleSearch = () => {
  reload();
};

// 加载所有产品数据
const loadAllProducts = async () => {
  productLoading.value = true;
  try {
    const res = await goodsList({
      page: 1,
      pageSize: 100, // 加载更多产品，以便前端筛选
    });
    if (res.data && res.data.list && Array.isArray(res.data.list)) {
      productOptions.value = res.data.list.map(item => ({
        label: item.name,
        value: item.id,
      }));
    }
  } catch (error) {
    console.error('获取产品列表失败:', error);
  } finally {
    productLoading.value = false;
  }
};

// 初始化时加载产品列表
loadAllProducts();

// 刷新表格
const reload = () => {
  tableRef.value?.reload();
};

  // 查看详情
  const handleDetail = (record: DrawRecordData) => {
    detailData.value = record;
    showDetailModal.value = true;
  };

  // 表格操作列
  const actionColumn = reactive({
    width: 150,
    title: '操作',
    key: 'actions',
    render(record) {
      return h(TableAction as any, {
        actions: [
          {
            label: '详情',
            onClick: () => handleDetail(record),
          },
        ],
      });
    },
  });

  function reloadTable() {
    actionRef.value.reload();
  }

</script>

<style lang="less" scoped></style>
