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
  import { getAdminList } from '@/api/system/admin';

  interface FilterData {
    adminUsername?: string;
    timeType: string;
    startDate?: number;
    endDate?: number;
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

  // 管理员选项
  const adminOptions = ref<any[]>([
    { label: '所有', value: null },
  ]);

  // 加载管理员列表
  async function loadAdminList() {
    try {
      const res: any = await getAdminList({
        page: '1',
        pageSize: '1000',
      });
      
      if (res.code === 1 && res.data && res.data.list) {
        const list = res.data.list.map((admin: any) => ({
          label: `${admin.username}${admin.name ? ` (${admin.name})` : ''}`,
          value: admin.id,
          username: admin.username, // 保存username
        }));
        adminOptions.value = [
          { label: '所有', value: null, username: null },
          ...list,
        ];
      }
    } catch (error) {
      console.error('加载管理员列表失败:', error);
    }
  }

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

    // 获取admin_username
    if (selectedAdmin.value) {
      const selectedAdminObj = adminOptions.value.find(opt => opt.value === selectedAdmin.value);
      if (selectedAdminObj && selectedAdminObj.username) {
        filterData.adminUsername = selectedAdminObj.username;
      }
    }
    
    // 计算时间范围
    let startTime: number;
    let endTime: number;
    
    if (dateRange.value && dateRange.value.length === 2) {
      // 自定义时间
      // 开始时间设为 00:00:00
      const startDate = new Date(dateRange.value[0]);
      startDate.setHours(0, 0, 0, 0);
      startTime = Math.floor(startDate.getTime() / 1000);
      
      // 结束时间设为 23:59:59
      const endDate = new Date(dateRange.value[1]);
      endDate.setHours(23, 59, 59, 999);
      endTime = Math.floor(endDate.getTime() / 1000);
    } else {
      // 根据timeType计算时间范围
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      switch (activeQuickOption.value) {
        case '今日':
          // 今天 00:00:00 - 今天 23:59:59
          startTime = Math.floor(today.getTime() / 1000);
          endTime = Math.floor(todayEnd.getTime() / 1000);
          break;
        case '本周':
          // 本周日 00:00:00 - 今天 23:59:59
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startTime = Math.floor(weekStart.getTime() / 1000);
          endTime = Math.floor(todayEnd.getTime() / 1000);
          break;
        case '本月':
          // 本月1日 00:00:00 - 今天 23:59:59
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          startTime = Math.floor(monthStart.getTime() / 1000);
          endTime = Math.floor(todayEnd.getTime() / 1000);
          break;
        case '本年':
          // 本年1月1日 00:00:00 - 今天 23:59:59
          const yearStart = new Date(now.getFullYear(), 0, 1);
          startTime = Math.floor(yearStart.getTime() / 1000);
          endTime = Math.floor(todayEnd.getTime() / 1000);
          break;
        default:
          // 默认本月
          const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
          startTime = Math.floor(defaultStart.getTime() / 1000);
          endTime = Math.floor(todayEnd.getTime() / 1000);
      }
    }
    
    filterData.startDate = startTime;
    filterData.endDate = endTime;
    
    emit('change', filterData);
  }

  // 初始加载
  onMounted(() => {
    loadAdminList();
    emitChange();
  });
</script>

<style lang="less" scoped></style>
