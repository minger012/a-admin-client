<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="编辑用户计划"
    :style="{ width: '600px' }"
    :mask-closable="false"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="120"
    >
      <n-form-item label="展示数" path="show_num">
        <n-input-number
          v-model:value="formData.show_num"
          :min="0"
          placeholder="请输入展示数"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="点击数" path="click_num">
        <n-input-number
          v-model:value="formData.click_num"
          :min="0"
          placeholder="请输入点击数"
          :disabled="originalState !== 0 && originalState !== 1"
          style="width: 100%"
          @update:value="handleClickDataChange"
        />
      </n-form-item>
      <n-form-item label="投放状态" path="state">
        <n-select
          v-model:value="formData.state"
          :options="stateOptions"
          placeholder="请选择投放状态"
        />
      </n-form-item>
      <n-form-item label="点击单价" path="click_price">
        <n-input-number
          v-model:value="formData.click_price"
          :min="0"
          :precision="2"
          placeholder="请输入点击单价"
          :disabled="originalState !== 0 && originalState !== 1"
          style="width: 100%"
          @update:value="handleClickDataChange"
        />
      </n-form-item>

      <n-form-item label="消耗时间(分钟)" path="cd">
        <n-input-number
          v-model:value="formData.cd"
          :min="0"
          placeholder="请输入消耗时间"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="最低投放金额" path="min">
        <n-input-number
          v-model:value="formData.min"
          :min="0"
          :disabled="originalState !== 0"
          placeholder="请输入最低投放金额"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="最高投放金额" path="max">
        <n-input-number
          v-model:value="formData.max"
          :min="0"
          :disabled="originalState !== 0"
          placeholder="请输入最高投放金额"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="投放利润率(%)" path="rate">
        <n-space>
          <n-input-number
            v-model:value="formData.rate"
            :min="0"
            :disabled="originalState !== 0 && originalState !== 1"
            placeholder="请输入投放利润率"
            style="width: 200px"
            @update:value="handleRateChange"
          />
          <span class="expected-profit">
            预期利润: <span class="profit-value">¥{{ expectedProfit.toFixed(2) }}</span>
          </span>
        </n-space>
      </n-form-item>


      <n-form-item label="失败备注" path="remarks" v-if="formData.state === 3">
        <n-input
          v-model:value="formData.remarks"
          type="textarea"
          placeholder="请输入失败备注"
          :rows="3"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useMessage, FormInst } from 'naive-ui';
import { planOrderEdit } from '@/api/plan';
import { PlanOrderItem } from './columns';

interface Props {
  show: boolean;
  data: PlanOrderItem | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const originalState = ref(0); // 保存初始状态

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// 表单数据
const formData = ref({
  id: 0,
  show_num: 0,
  click_num: 0,
  click_price: 0,
  cd: 0,
  min: 0,
  max: 0,
  rate: 0,
  state: 0,
  remarks: '',
  money: 0, // 用于计算预期利润
});

// 预期利润
const expectedProfit = computed(() => {
  return (formData.value.money * formData.value.rate) / 100;
});

// 状态选项（根据初始状态动态生成，不支持的选项设置为disabled）
const stateOptions = computed(() => {
  const currentState = originalState.value; // 使用初始状态
  const allOptions = [
    { label: '待投放', value: 0 },
    { label: '匹配中', value: 1 },
    { label: '投放中', value: 2 },
    { label: '投放失败', value: 3 },
    { label: '等待结算', value: 4 },
    { label: '结算成功', value: 5 },
  ];

  return allOptions.map(opt => {
    let disabled = false;
    
    if (currentState === 0) {
      // 待投放只能设置为待投放或投放失败
      disabled = opt.value !== 0 && opt.value !== 3;
    } else if (currentState === 1) {
      // 匹配中可以设置为匹配中、投放中或投放失败
      disabled = opt.value !== 1 && opt.value !== 2 && opt.value !== 3;
    } else if (currentState === 4) {
      // 等待结算只能设置为等待结算或结算成功
      disabled = opt.value !== 4 && opt.value !== 5;
    } else {
      // 其他状态不可修改（只能保持当前状态）
      disabled = opt.value !== currentState;
    }
    
    return {
      ...opt,
      disabled
    };
  });
});

// 表单验证规则
const rules = {
  show_num: { required: true, type: 'number', message: '请输入展示数', trigger: 'blur' },
  click_num: { required: true, type: 'number', message: '请输入点击数', trigger: 'blur' },
  click_price: { required: true, type: 'number', message: '请输入点击单价', trigger: 'blur' },
  cd: { required: true, type: 'number', message: '请输入消耗时间', trigger: 'blur' },
  min: { required: true, type: 'number', message: '请输入最低投放金额', trigger: 'blur' },
  max: { required: true, type: 'number', message: '请输入最高投放金额', trigger: 'blur' },
  rate: { required: true, type: 'number', message: '请输入投放利润率', trigger: 'blur' },
  state: { required: true, type: 'number', message: '请选择投放状态', trigger: 'change' },
};

// 监听数据变化，初始化表单
watch(() => props.data, (data) => {
  if (data) {
    originalState.value = data.state; // 保存初始状态
    formData.value = {
      id: data.id,
      show_num: data.show_num,
      click_num: data.click_num,
      click_price: data.click_price,
      cd: Math.floor(data.cd / 60), // 转换为分钟
      min: data.min,
      max: data.max,
      rate: data.rate,
      state: data.state,
      remarks: data.remarks || '',
      money: data.money,
    };
  }
}, { immediate: true });

// 点击数或点击单价变化时，自动更新利润率
function handleClickDataChange() {
  if (formData.value.money > 0 && formData.value.click_num > 0 && formData.value.click_price > 0) {
    // 实际利润 = 点击数 × 点击单价
    const actualProfit = formData.value.click_num * formData.value.click_price;
    // 利润率 = (实际利润 / 投放金额) × 100
    const calculatedRate = (actualProfit / formData.value.money) * 100;
    formData.value.rate = Number(calculatedRate.toFixed(2));
  }
}

// 利润率变化时，随机重新计算展示数、点击数、点击单价
function handleRateChange() {
  if (expectedProfit.value > 0) {
    // 设定合理的点击单价范围 (0.1-2元)
    const minClickPrice = 0.1;
    const maxClickPrice = 2;
    const targetClickPrice = Math.random() * (maxClickPrice - minClickPrice) + minClickPrice;
    
    // 根据预期利润和目标点击单价计算需要的点击数
    const requiredClickNum = Math.ceil(expectedProfit.value / targetClickPrice);
    
    // 设定合理的点击率范围 (5%-20%)
    const clickRate = Math.random() * 0.15 + 0.05;
    
    // 根据点击数和点击率计算展示数
    const requiredShowNum = Math.ceil(requiredClickNum / clickRate);
    
    // 设置计算出的值
    formData.value.show_num = requiredShowNum;
    formData.value.click_num = requiredClickNum;
    formData.value.click_price = Number(targetClickPrice.toFixed(2));
    
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    
    submitting.value = true;
    const params = {
      id: formData.value.id,
      show_num: formData.value.show_num,
      click_num: formData.value.click_num,
      click_price: formData.value.click_price,
      cd: formData.value.cd * 60, // 转换为秒
      min: formData.value.min,
      max: formData.value.max,
      rate: formData.value.rate,
      state: formData.value.state,
      remarks: formData.value.remarks,
    };

    const res: any = await planOrderEdit(params);
    
    if (res.code === 1) {
      message.success('保存成功');
      formRef.value?.restoreValidation();
      emit('success');
      showModal.value = false;
    } else {
      message.error(res.msg || '保存失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitting.value = false;
  }
}

// 取消
function handleCancel() {
  showModal.value = false;
  // 重置表单验证
  formRef.value?.restoreValidation();
}
</script>

<style lang="less" scoped>
.expected-profit {
  color: #52c41a;
  font-weight: bold;
  font-size: 14px;

  .profit-value {
    font-size: 16px;
  }
}
</style>
