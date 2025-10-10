<template>
  <n-space vertical>
    <!-- 已添加计划 -->
    <div class="flex items-center justify-between">
      <span class="font-medium">已添加计划 ({{ manualPlans.length }})</span>
      <n-button size="small" @click="addPlan">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        添加计划
      </n-button>
    </div>

    <!-- 计划配置列表 -->
    <n-grid v-if="manualPlans.length > 0" :cols="2" :x-gap="12" :y-gap="12">
      <n-grid-item v-for="(plan, index) in manualPlans" :key="index">
        <n-card 
          size="small"
          :title="`计划 #${index + 1}`"
        >
        <template #header-extra>
          <n-button text type="error" @click="removePlan(index)">
            <template #icon>
              <n-icon><CloseCircleOutlined /></n-icon>
            </template>
          </n-button>
        </template>

        <n-space vertical>
          <!-- 计划选择 -->
          <n-form-item label="计划选择" required>
            <n-select
              v-model:value="plan.plan_id"
              filterable
              :options="planOptions"
              placeholder="请选择计划"
              :loading="loadingPlans"
            />
          </n-form-item>

          <!-- 金额范围 -->
          <n-space>
            <n-form-item label="最低" required>
              <n-input-number
                v-model:value="plan.min"
                :min="0"
                :show-button="false"
                placeholder="最低金额"
                style="width: 180px"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="最高" required>
              <n-input-number
                v-model:value="plan.max"
                :min="0"
                :show-button="false"
                placeholder="最高金额"
                style="width: 180px"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-space>

          <!-- 官方推送 -->
          <n-form-item label="官方推送">
            <n-switch v-model:value="plan.officialPush" />
          </n-form-item>

          <!-- 投放利润和投放时间 -->
          <n-space>
            <n-form-item label="投放利润" required>
              <n-input-number
                v-model:value="plan.rate"
                :min="0"
                :show-button="false"
                placeholder="利润率"
                style="width: 180px"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="投放时间" required>
              <n-input-number
                v-model:value="plan.cd"
                :min="0"
                :show-button="false"
                placeholder="投放时间"
                style="width: 180px"
              >
                <template #suffix>分钟</template>
              </n-input-number>
            </n-form-item>
          </n-space>
        </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 空状态占位 -->
    <n-empty 
      v-if="manualPlans.length === 0" 
      :description="`暂无计划，点击上方【添加计划】按钮开始添加`"
      style="padding: 60px 0"
    />
    

    <!-- 手动已添加计划汇总 -->
    <div class="border-[1px] rounded-lg" v-if="manualPlans.length > 0">
      <div class="flex justify-between p-3 border-b-[1px] border-[#e7e7e7]">
        <div class="font-semibold text-base">手动已添加计划汇总（{{ manualPlans.length }}）</div>
      
        <n-space>
          <n-button text type="error" @click="clearAll">
            清除全部
          </n-button>
        </n-space>
      </div>
      <div class="p-3">
        <n-data-table
          :columns="summaryColumns"
          :data="manualPlans"
          :pagination="false"
          :bordered="false"
          :scroll-x="960"
        />
      </div>
    </div>

    <!-- 派单按钮 -->
    <n-button
      v-if="manualPlans.length > 0"
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
import { h, ref } from 'vue';
import { NButton, NInputNumber, NSwitch, NIcon, useMessage } from 'naive-ui';
import { PlusOutlined, CloseCircleOutlined, DeleteOutlined } from '@vicons/antd';
import { planList } from '@/api/plan';
import { addPlanOrder } from '@/api/system/user';

interface Props {
  uid: number;
}

const props = defineProps<Props>();
const message = useMessage();

interface ManualPlan {
  plan_id: number | null;
  plan_name?: string;
  min: number | null;
  max: number | null;
  cd: number | null;
  officialPush: boolean;
  rate: number | null;
}

// 手动添加的计划列表
const manualPlans = ref<ManualPlan[]>([]);
const dispatching = ref(false);
const loadingPlans = ref(false);

// 所有计划列表
const allPlans = ref<any[]>([]);
const planOptions = ref<any[]>([]);

// 汇总表格列定义
const summaryColumns = [
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
    render: (row: ManualPlan) => {
      const plan = allPlans.value.find(p => p.id === row.plan_id);
      return plan ? `${plan.id}:${plan.name}` : '-';
    },
  },
  {
    title: '金额范围',
    key: 'amount',
    width: 120,
    render: (row: ManualPlan) => `¥${row.min || 0} - ¥${row.max || 0}`,
  },
  {
    title: '利润率',
    key: 'rate',
    width: 120,
    render: (row: ManualPlan) => {
      return h(NInputNumber, {
        value: row.rate,
        onUpdateValue: (v) => {
          row.rate = v ?? 0;
        },
        min: 0,
        showButton: false,
        suffix: () => '%',
        style: { width: '100%' },
      });
    },
  },
  {
    title: '投放时间',
    key: 'cd',
    width: 120,
    render: (row: ManualPlan) => {
      return h(NInputNumber, {
        value: row.cd,
        onUpdateValue: (v) => {
          row.cd = v ?? 0;
        },
        min: 0,
        showButton: false,
        suffix: () => '分',
        style: { width: '100%' },
      });
    },
  },
  {
    title: '官方推送',
    key: 'officialPush',
    width: 100,
    render: (row: ManualPlan) => {
      return h(NSwitch, {
        value: row.officialPush,
        onUpdateValue: (v) => {
          row.officialPush = v;
        },
      });
    },
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
      state: 1,
    });
    if (res.code === 1) {
      allPlans.value = res.data.list || [];
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

// 添加计划
function addPlan() {
  manualPlans.value.push({
    plan_id: null,
    min: null,
    max: null,
    cd: null,
    officialPush: false,
    rate: null,
  });
}

// 删除计划
function removePlan(index: number) {
  manualPlans.value.splice(index, 1);
}

// 清除全部
function clearAll() {
  manualPlans.value = [];
}

// 派单
async function handleDispatch() {
  // 验证
  for (let i = 0; i < manualPlans.value.length; i++) {
    const plan = manualPlans.value[i];
    
    if (!plan.plan_id) {
      message.error(`计划 #${i + 1}: 请选择计划`);
      return;
    }
    if (plan.min === null || plan.min === undefined) {
      message.error(`计划 #${i + 1}: 请输入最低金额`);
      return;
    }
    if (plan.max === null || plan.max === undefined) {
      message.error(`计划 #${i + 1}: 请输入最高金额`);
      return;
    }
    if (plan.min >= plan.max) {
      message.error(`计划 #${i + 1}: 最低金额必须小于最高金额`);
      return;
    }
    if (plan.cd === null || plan.cd === undefined) {
      message.error(`计划 #${i + 1}: 请输入投放时间`);
      return;
    }
    if (plan.rate === null || plan.rate === undefined) {
      message.error(`计划 #${i + 1}: 请输入投放利润`);
      return;
    }
  }

  dispatching.value = true;

  try {
    const params = {
      uid: props.uid,
      plan: manualPlans.value.map(item => ({
        plan_id: item.plan_id!,
        min: item.min!,
        max: item.max!,
        cd: item.cd!,
        form: item.officialPush ? 2 : 1,
        rate: item.rate
      })),
    };

    const res: any = await addPlanOrder(params);

    if (res.code === 1) {
      message.success('派单成功');
      // 清空计划列表
      manualPlans.value = [];
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
