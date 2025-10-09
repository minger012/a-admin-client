<template>
  <n-space class="pt-3" vertical>
    <!-- 计划匹配方式 -->
    <n-form-item label="计划匹配方式">
      <n-radio-group v-model:value="formData.matchType">
        <n-space>
          <n-radio value="all">全部随机匹配</n-radio>
          <n-radio value="random">指定计划随机</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>

    <!-- 选择计划（仅在指定计划随机时显示） -->
    <n-form-item v-if="formData.matchType === 'random'" label="选择计划范围" required>
      <n-select
        v-model:value="formData.selectedPlans"
        multiple
        filterable
        :options="planOptions"
        placeholder="请选择计划"
        :loading="loadingPlans"
        clearable
      />
    </n-form-item>

    <!-- 金额设置方式 -->
    <n-form-item label="金额设置方式">
      <n-radio-group v-model:value="formData.amountType">
        <n-space>
          <n-radio value="fixed">固定金额的范围</n-radio>
          <n-radio value="random">范围内随机(100整数)</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>

    <!-- 金额范围 -->
    <n-space>
      <n-form-item label="最低" required>
        <n-input-number
          v-model:value="formData.minAmount"
          :min="0"
          placeholder="请输入最低金额"
          :show-button="false"
          style="width: 200px"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <n-form-item label="最高" required>
        <n-input-number
          v-model:value="formData.maxAmount"
          :min="0"
          placeholder="请输入最高金额"
          :show-button="false"
          style="width: 200px"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>
    </n-space>

    <!-- 批量数量和官方推送 -->
    <n-space>
      <n-form-item label="批量数量" required>
        <n-input-number
          v-model:value="formData.batchCount"
          :min="1"
          placeholder="请输入批量数量"
          :show-button="false"
          style="width: 200px"
        />
      </n-form-item>

      <n-form-item label="官方推送">
        <n-switch v-model:value="formData.officialPush" />
      </n-form-item>
    </n-space>

    <!-- 投放时间 -->
    <n-space>
      <n-form-item label="投放利润">
        <n-input-number
          v-model:value="formData.profitRate"
          :min="0"
          placeholder="请输入利润率"
          style="width: 200px"
          :show-button="false"
        >
          <template #suffix>%</template>
        </n-input-number>
      </n-form-item>

      <n-form-item label="投放时间">
        <n-input-number
          v-model:value="formData.releaseTime"
          :min="0"
          placeholder="请输入投放时间"
          style="width: 200px"
          :show-button="false"
        >
          <template #suffix>分钟</template>
        </n-input-number>
      </n-form-item>
    </n-space>

    <!-- 生成计划按钮 -->
    <n-button type="primary" class="mb-3" @click="generatePlans" :loading="generating">
      <template #icon>
        <n-icon><PlusOutlined /></n-icon>
      </template>
      生成计划
    </n-button>

    <!-- 已生成计划列表 -->
    <n-card v-if="generatedPlans.length > 0" :title="`批量已添加计划汇总（${generatedPlans.length}）`" :bordered="false">
      <template #header-extra>
        <n-space>
          <n-button text type="error" @click="clearAll">
            清除全部
          </n-button>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="generatedPlans"
        :pagination="false"
        :bordered="true"
        :scroll-x="960"
        class="-mt-6"
      />
    </n-card>

    <!-- 派单按钮 -->
    <n-button
      v-if="generatedPlans.length > 0"
      type="primary"
      size="large"
      @click="handleDispatch"
      :loading="dispatching"
      class="mt-3"
      block
    >
      派单
    </n-button>
  </n-space>
</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue';
import { NButton, NInputNumber, NIcon, useMessage } from 'naive-ui';
import { PlusOutlined, DeleteOutlined } from '@vicons/antd';
import { planList } from '@/api/plan';
import { addPlanOrder } from '@/api/system/user';

interface Props {
  uid: number;
}

const props = defineProps<Props>();
const message = useMessage();

// 表单数据
const formData = reactive({
  matchType: 'all', // all: 全部随机匹配, random: 指定计划随机
  amountType: 'fixed', // fixed: 固定金额的范围, random: 范围内随机(100笔数)
  minAmount: null as number | null,
  maxAmount: null as number | null,
  batchCount: 1,
  officialPush: false,
  profitRate: null as number | null,
  releaseTime: null as number | null,
  selectedPlans: [] as number[], // 选中的计划ID列表
});

// 生成的计划列表
const generatedPlans = ref<any[]>([]);
const generating = ref(false);
const dispatching = ref(false);
const loadingPlans = ref(false);

// 所有计划列表（从API获取）
const allPlans = ref<any[]>([]);

// 计划选项（用于下拉框）
const planOptions = ref<any[]>([]);

// 表格列定义
const columns = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_row: any, index: number) => index + 1,
  },
  {
    title: '计划名称',
    key: 'plan_name',
    width: 160,
    render: (row: any) => `${row.plan_id}:${row.plan_name}`,
  },
  {
    title: '金额范围',
    key: 'amount',
    width: 120,
    render: (row: any) => `¥${row.min} - ¥${row.max}`,
  },
  {
    title: '利润率',
    key: 'profitRate',
    width: 120,
    render: (row: any) => {
      return h(NInputNumber, {
        value: row.profitRate,
        onUpdateValue: (v) => {
          row.profitRate = v ?? 0;
        },
        min: 0,
        suffix: () => '%',
        style: { width: '100%' },
      });
    },
  },
  {
    title: '投放时间',
    key: 'cd',
    width: 120,
    render: (row: any) => {
      return h(NInputNumber, {
        value: row.cd,
        onUpdateValue: (v) => {
          row.cd = v ?? 0;
        },
        min: 0,
        suffix: () => '分',
        style: { width: '100%' },
      });
    },
  },
  {
    title: '官方推送',
    key: 'form',
    width: 100,
    render: (row: any) => (row.form === 1 ? '前台' : '后台'),
  },
  {
    title: '操作',
    key: 'action',
    width: 70,
    fixed: 'right' as const,
    render: (_row: any, index: number) => {
      return h(
        NButton,
        {
          text: true,
          type: 'error',
          onClick: () => removePlan(index),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) }),
        }
      );
    },
  },
];

// 获取所有计划列表
async function fetchAllPlans() {
  loadingPlans.value = true;
  try {
    const res: any = await planList({
      page: '1',
      pageSize: '999999',
      state: 1, // 只获取激活状态的计划
    });
    if (res.code === 1) {
      allPlans.value = res.data.list || [];
      // 生成下拉选项
      planOptions.value = allPlans.value.map(plan => ({
        label: `${plan.id}:${plan.name}`,
        value: plan.id,
      }));
    }
  } catch (error) {
    console.error('获取计划列表失败:', error);
  } finally {
    loadingPlans.value = false;
  }
}

// 生成随机金额范围
function generateRandomAmount(min: number, max: number, type: 'fixed' | 'random'): [number, number] {
  if (type === 'fixed') {
    return [min, max];
  }

  // 范围内随机(100笔数)
  const diff = max - min;
  
  // 如果差值小于100，使用固定范围
  if (diff < 100) {
    return [min, max];
  }

  // 随机生成起始金额
  const maxStart = max - 100;
  const start = Math.floor(Math.random() * (maxStart - min + 1)) + min;
  
  // 计算可能的差值倍数
  const maxMultiplier = Math.floor((max - start) / 100);
  const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
  
  // 计算结束金额（确保是100的倍数差值）
  const end = start + (multiplier * 100);
  
  return [start, Math.min(end, max)];
}

// 生成计划
async function generatePlans() {
  // 验证
  if (!formData.minAmount || !formData.maxAmount) {
    message.error('请输入金额范围');
    return;
  }
  if (formData.minAmount >= formData.maxAmount) {
    message.error('最低金额必须小于最高金额');
    return;
  }
  if (!formData.batchCount || formData.batchCount < 1) {
    message.error('请输入有效的批量数量');
    return;
  }

  // 如果是指定计划随机，检查是否选择了计划
  if (formData.matchType === 'random' && formData.selectedPlans.length === 0) {
    message.error('请至少选择一个计划');
    return;
  }

  generating.value = true;

  try {
    // 确保已加载计划列表
    if (allPlans.value.length === 0) {
      await fetchAllPlans();
    }

    if (allPlans.value.length === 0) {
      message.error('没有可用的计划');
      return;
    }

    // 确定可用的计划池
    let availablePlans: any[] = [];
    if (formData.matchType === 'all') {
      // 全部随机匹配
      availablePlans = allPlans.value;
    } else {
      // 指定计划随机
      availablePlans = allPlans.value.filter(plan => 
        formData.selectedPlans.includes(plan.id)
      );
    }

    if (availablePlans.length === 0) {
      message.error('没有可用的计划');
      return;
    }

    const plans: any[] = [];

    for (let i = 0; i < formData.batchCount; i++) {
      // 从可用计划池中随机选择一个计划
      const randomPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
      
      // 生成金额范围
      const [min, max] = generateRandomAmount(
        formData.minAmount,
        formData.maxAmount,
        formData.amountType as 'fixed' | 'random'
      );

      plans.push({
        plan_id: randomPlan.id,
        plan_name: randomPlan.name,
        min: min,
        max: max,
        cd: formData.releaseTime || 0,
        form: formData.officialPush ? 1 : 2,
        profitRate: formData.profitRate || 0,
      });
    }

    // 追加而不是覆盖
    generatedPlans.value.push(...plans);
    message.success(`已生成 ${plans.length} 个计划，当前共 ${generatedPlans.value.length} 个`);
  } catch (error) {
    message.error('生成计划失败');
    console.error(error);
  } finally {
    generating.value = false;
  }
}

// 删除计划
function removePlan(index: number) {
  generatedPlans.value.splice(index, 1);
}

// 清除全部
function clearAll() {
  generatedPlans.value = [];
}

// 派单
async function handleDispatch() {
  if (generatedPlans.value.length === 0) {
    message.error('请先生成计划');
    return;
  }

  dispatching.value = true;

  try {
    const params = {
      uid: props.uid,
      plan: generatedPlans.value.map(item => ({
        plan_id: item.plan_id,
        min: item.min,
        max: item.max,
        cd: item.cd,
        form: item.form,
      })),
    };

    const res: any = await addPlanOrder(params);

    if (res.code === 1) {
      message.success('派单成功');
      // 清空已生成的计划
      generatedPlans.value = [];
      // 重置表单
      formData.minAmount = null;
      formData.maxAmount = null;
      formData.batchCount = 1;
      formData.profitRate = null;
      formData.releaseTime = null;
    } else {
      message.error(res.msg || '派单失败');
    }
  } catch (error) {
    message.error('派单失败');
    console.error(error);
  } finally {
    dispatching.value = false;
  }
}

// 初始化
fetchAllPlans();
</script>

<style lang="less" scoped>
:deep(.n-form-item-label) {
  font-weight: 500;
}
</style>
