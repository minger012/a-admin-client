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
          :bordered="false"
          :row-key="(row) => row.date"
          v-model:checked-row-keys="checkedRowKeys"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { SearchOutlined, ExportOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { exportToExcel } from '@/utils/excel';
  import type { DataTableColumns } from 'naive-ui';

  const message = useMessage();
  const dateRange = ref<[number, number] | null>(null);
  const checkedRowKeys = ref<string[]>([]); // 选中的行

  // 模拟数据
  const tableData = ref([
    {
      date: '2025-09-30',
      register_count: 0,
      first_time: '2025-09-30 08:00:13',
      create_time: '2025-09-30 08:00:13',
    },
    {
      date: '2025-09-29',
      register_count: 0,
      first_time: '2025-09-29 08:00:13',
      create_time: '2025-09-29 08:00:13',
    },
    {
      date: '2025-09-28',
      register_count: 0,
      first_time: '2025-09-28 08:00:13',
      create_time: '2025-09-28 08:00:13',
    },
    {
      date: '2025-09-27',
      register_count: 0,
      first_time: '2025-09-27 08:00:13',
      create_time: '2025-09-27 08:00:13',
    },
    {
      date: '2025-09-26',
      register_count: 0,
      first_time: '2025-09-26 08:00:13',
      create_time: '2025-09-26 08:00:13',
    },
    {
      date: '2025-09-25',
      register_count: 0,
      first_time: '2025-09-25 08:00:13',
      create_time: '2025-09-25 08:00:13',
    },
    {
      date: '2025-09-24',
      register_count: 1,
      first_time: '2025-09-24 15:50:43',
      create_time: '2025-09-24 08:00:07',
    },
    {
      date: '2025-09-23',
      register_count: 0,
      first_time: '2025-09-23 08:00:07',
      create_time: '2025-09-23 08:00:07',
    },
    {
      date: '2025-09-22',
      register_count: 0,
      first_time: '2025-09-22 23:05:07',
      create_time: '2025-09-22 23:05:07',
    },
    {
      date: '2025-09-21',
      register_count: 0,
      first_time: '2025-09-21 08:00:08',
      create_time: '2025-09-21 08:00:08',
    },
    {
      date: '2025-09-20',
      register_count: 0,
      first_time: '2025-09-20 08:00:08',
      create_time: '2025-09-20 08:00:08',
    },
    {
      date: '2025-09-19',
      register_count: 0,
      first_time: '2025-09-19 08:00:08',
      create_time: '2025-09-19 08:00:08',
    },
    {
      date: '2025-09-18',
      register_count: 1,
      first_time: '2025-09-18 11:00:08',
      create_time: '2025-09-18 08:00:08',
    },
    {
      date: '2025-09-17',
      register_count: 0,
      first_time: '2025-09-17 08:00:08',
      create_time: '2025-09-17 08:00:08',
    },
    {
      date: '2025-09-16',
      register_count: 1,
      first_time: '2025-09-17 03:47:38',
      create_time: '2025-09-16 08:00:08',
    },
    {
      date: '2025-09-15',
      register_count: 1,
      first_time: '2025-09-15 21:18:38',
      create_time: '2025-09-15 08:00:02',
    },
  ]);

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
      title: '首次时间',
      key: 'first_time',
      width: 200,
    },
    {
      title: '创建时间',
      key: 'create_time',
      width: 200,
    },
  ];

  // 分页配置
  const pagination = {
    page: 1,
    pageSize: 10,
    pageCount: 2,
    itemCount: tableData.value.length,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
  };

  // 查询
  function handleSearch() {
    console.log('查询，日期范围:', dateRange.value);
    message.info('查询功能待API实现');
  }

  // 重置
  function handleReset() {
    dateRange.value = null;
    console.log('重置筛选');
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
        { title: '首次时间', key: 'first_time' },
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
</script>

<style lang="less" scoped></style>
