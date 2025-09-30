<template>
  <n-space align="center" size="medium">
    <span style="color: #666;">选择管理员</span>
    <n-select
      v-model:value="selectedAdmin"
      :options="adminOptions"
      placeholder="所有"
      style="width: 200px;"
      clearable
      @update:value="handleAdminChange"
    />
    
    <n-button-group>
      <n-button
        v-for="option in quickOptions"
        :key="option.value"
        :type="activeQuickOption === option.value ? 'primary' : 'default'"
        @click="handleQuickSelect(option.value)"
      >
        {{ option.label }}
      </n-button>
    </n-button-group>
    
    <n-date-picker
      v-if="activeQuickOption === '自定义'"
      v-model:value="dateRange"
      type="daterange"
      clearable
      @update:value="handleDateChange"
    />
  </n-space>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';

  interface FilterData {
    adminId?: number;
    timeType: string;
    sTime?: number;
    eTime?: number;
  }

  const emit = defineEmits<{
    change: [value: FilterData];
  }>();

  const quickOptions = [
    { label: '今日', value: '今日' },
    { label: '本周', value: '本周' },
    { label: '本月', value: '本月' },
    { label: '本年', value: '本年' },
    { label: '自定义', value: '自定义' },
  ];

  // 模拟管理员数据
  const adminOptions = ref([
    { label: '所有', value: null },
    { label: 'admin (管理员)', value: 1 },
    { label: 'manager01 (经理)', value: 2 },
    { label: 'operator01 (运营)', value: 3 },
  ]);

  const selectedAdmin = ref<number | null>(null);
  const activeQuickOption = ref('本月');
  const dateRange = ref<[number, number] | null>(null);

  function handleAdminChange() {
    emitChange();
  }

  function handleQuickSelect(value: string) {
    activeQuickOption.value = value;
    
    if (value !== '自定义') {
      dateRange.value = null;
      emitChange();
    }
  }

  function handleDateChange(value: [number, number] | null) {
    if (value) {
      emitChange();
    }
  }

  function emitChange() {
    const filterData: FilterData = {
      timeType: activeQuickOption.value,
    };

    if (selectedAdmin.value) {
      filterData.adminId = selectedAdmin.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      filterData.sTime = Math.floor(dateRange.value[0] / 1000);
      filterData.eTime = Math.floor(dateRange.value[1] / 1000);
    }
    
    emit('change', filterData);
  }

  // 初始加载
  onMounted(() => {
    emitChange();
  });
</script>

<style lang="less" scoped></style>
