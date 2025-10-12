<template>
  <div>
    <n-card :bordered="false" class="proCard" title="注册统计">
      <!-- 筛选区域 -->
      <n-space vertical size="large">
        <n-form inline label-placement="left">
          <n-form-item label="创建时间">
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              clearable
              style="width: 400px;"
            />
          </n-form-item>
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch">
                <template #icon>
                  <n-icon><SearchOutlined /></n-icon>
                </template>
                查询
              </n-button>
              <n-button @click="handleReset">重置</n-button>
            </n-space>
          </n-form-item>
        </n-form>

        <!-- 导出按钮 -->
        <n-space>
          <n-button @click="handleExport">
            <template #icon>
              <n-icon><ExportOutlined /></n-icon>
            </template>
            导出
          </n-button>
          {{ checkedRowKeys.length > 0 ? `(已选${checkedRowKeys.length}项)` : '' }}
        </n-space>

        <!-- 数据表格 -->
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          :loading="loading"
          :bordered="false"
          :row-key="(row) => row.date"
          v-model:checked-row-keys="checkedRowKeys"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, reactive } from 'vue';
  import { SearchOutlined, ExportOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { exportToExcel } from '@/utils/excel';
  import { getRegisterStats } from '@/api/data/statistics';
  import type { DataTableColumns } from 'naive-ui';

  const message = useMessage();
  const dateRange = ref<[number, number] | null>(null);
  const checkedRowKeys = ref<string[]>([]); // 选中的行
  const loading = ref(false);

  // 表格数据
  const tableData = ref<any[]>([]);


  // 表格列定义
  const columns: DataTableColumns = [
    {
      type: 'selection',
    },
    {
      title: '日期',
      key: 'date',
      width: 150,
    },
    {
      title: '注册人数',
      key: 'register_count',
      width: 150,
    },

    {
      title: '创建时间',
      key: 'create_time',
      width: 200,
    },
  ];

  // 分页配置
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    pageCount: 1,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    onChange: (page: number) => {
      pagination.page = page;
      loadData();
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;
      loadData();
    },
  });

  // 加载数据
  async function loadData() {
    try {
      loading.value = true;
      
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      // 处理日期范围
      if (dateRange.value && dateRange.value.length === 2) {
        params.sTime = Math.floor(dateRange.value[0] / 1000); // 转换为秒级时间戳
        params.eTime = Math.floor(dateRange.value[1] / 1000);
      }

      const response = await getRegisterStats(params);
      
      if (response.code === 1 && response.data) {
        tableData.value = response.data.list || [];
        pagination.itemCount = response.data.total || 0;
        pagination.pageCount = response.data.total_page || 1;
      } else {
        message.error(response.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请重试');
    } finally {
      loading.value = false;
    }
  }

  // 查询
  function handleSearch() {
    pagination.page = 1; // 重置到第一页
    loadData();
  }

  // 重置
  function handleReset() {
    dateRange.value = null;
    pagination.page = 1;
    loadData();
  }

  // 导出
  function handleExport() {
    try {
      // 判断是导出选中的还是全部
      let dataToExport = tableData.value;
      
      if (checkedRowKeys.value.length > 0) {
        // 导出选中的数据
        dataToExport = tableData.value.filter(item => 
          checkedRowKeys.value.includes(item.date)
        );
        console.log(`导出选中的 ${dataToExport.length} 条数据`);
      } else {
        console.log('导出全部数据');
      }

      if (dataToExport.length === 0) {
        message.warning('没有可导出的数据');
        return;
      }

      // 定义导出列
      const exportColumns = [
        { title: '日期', key: 'date' },
        { title: '注册人数', key: 'register_count' },
        { title: '创建时间', key: 'create_time' },
      ];

      // 调用通用导出方法
      exportToExcel(dataToExport, exportColumns, '注册统计');
      
      message.success(`已导出 ${dataToExport.length} 条数据`);
      
      // 导出后清空选中
      checkedRowKeys.value = [];
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadData();
  });
</script>

<style lang="less" scoped></style>
