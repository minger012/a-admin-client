<template>
  <div>
    <n-card :bordered="false" class="proCard" title="充值提现统计">
      <!-- 筛选区域 -->
      <n-space vertical size="large">
        <n-form inline label-placement="left">
          <n-form-item label="创建时间">
            <n-date-picker
              v-model:value="filters.createDate"
              type="daterange"
              clearable
              style="width: 300px;"
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
          :row-key="(row) => row.id"
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
  const filters = ref({
    createDate: null as [number, number] | null,
  });
  const checkedRowKeys = ref<number[]>([]); // 选中的行

  // 模拟数据
  const tableData = ref([
    {
      id: 22,
      date: '2025-09-30',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-30 08:00:13',
      create_time: '2025-09-30 08:00:13',
    },
    {
      id: 21,
      date: '2025-09-29',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-29 08:00:13',
      create_time: '2025-09-29 08:00:13',
    },
    {
      id: 20,
      date: '2025-09-28',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-28 08:00:13',
      create_time: '2025-09-28 08:00:13',
    },
    {
      id: 19,
      date: '2025-09-27',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-27 08:00:13',
      create_time: '2025-09-27 08:00:13',
    },
    {
      id: 18,
      date: '2025-09-26',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-26 08:00:13',
      create_time: '2025-09-26 08:00:13',
    },
    {
      id: 17,
      date: '2025-09-25',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-25 08:00:13',
      create_time: '2025-09-25 08:00:13',
    },
    {
      id: 16,
      date: '2025-09-24',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-24 08:00:07',
      create_time: '2025-09-24 08:00:07',
    },
    {
      id: 15,
      date: '2025-09-23',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-23 08:00:07',
      create_time: '2025-09-23 08:00:07',
    },
    {
      id: 14,
      date: '2025-09-22',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-22 23:05:07',
      create_time: '2025-09-22 23:05:07',
    },
    {
      id: 13,
      date: '2025-09-21',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-21 08:00:08',
      create_time: '2025-09-21 08:00:08',
    },
    {
      id: 12,
      date: '2025-09-20',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-20 08:00:08',
      create_time: '2025-09-20 08:00:08',
    },
    {
      id: 11,
      date: '2025-09-19',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-19 08:00:08',
      create_time: '2025-09-19 08:00:08',
    },
    {
      id: 10,
      date: '2025-09-18',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-18 08:00:08',
      create_time: '2025-09-18 08:00:08',
    },
    {
      id: 9,
      date: '2025-09-17',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-17 08:00:08',
      create_time: '2025-09-17 08:00:08',
    },
    {
      id: 8,
      date: '2025-09-16',
      recharge_amount: 100,
      withdraw_amount: 0,
      update_time: '2025-09-17 03:50:53',
      create_time: '2025-09-16 08:00:08',
    },
    {
      id: 7,
      date: '2025-09-15',
      recharge_amount: 0,
      withdraw_amount: 0,
      update_time: '2025-09-15 08:00:12',
      create_time: '2025-09-15 08:00:12',
    },
  ]);

  // 表格列定义
  const columns: DataTableColumns = [
    {
      type: 'selection',
    },
    {
      title: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '日期',
      key: 'date',
      width: 150,
    },
    {
      title: '充值金额',
      key: 'recharge_amount',
      width: 150,
    },
    {
      title: '提现金额',
      key: 'withdraw_amount',
      width: 150,
    },
    {
      title: '更新时间',
      key: 'update_time',
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
    console.log('查询条件:', filters.value);
    message.info('查询功能待API实现');
  }

  // 重置
  function handleReset() {
    filters.value = {
      createDate: null,
    };
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
          checkedRowKeys.value.includes(item.id)
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
        { title: 'ID', key: 'id' },
        { title: '日期', key: 'date' },
        { title: '充值金额', key: 'recharge_amount' },
        { title: '提现金额', key: 'withdraw_amount' },
        { title: '更新时间', key: 'update_time' },
        { title: '创建时间', key: 'create_time' },
      ];

      // 调用通用导出方法
      exportToExcel(dataToExport, exportColumns, '充值提现统计');
      
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
