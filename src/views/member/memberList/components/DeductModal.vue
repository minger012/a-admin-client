<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="用户扣款" style="width: 500px;">
    <n-form
      :model="formParams"
      :rules="rules"
      ref="formRef"
      label-placement="left"
      :label-width="100"
      class="py-4"
    >
      <n-form-item label="用户名">
        <n-input :value="userData?.username" disabled />
      </n-form-item>
      <n-form-item label="扣款金额" path="money">
        <n-input-number
          v-model:value="formParams.money"
          :min="0"
          :precision="2"
          placeholder="请输入扣款金额"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>
      <n-form-item label="扣款类型" path="type">
        <n-radio-group v-model:value="formParams.type">
          <n-space>
            <n-radio :value="1">真实</n-radio>
            <n-radio :value="2">虚拟</n-radio>
            <n-radio :value="3">系统</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="用户端备注" path="user_remarks">
        <n-input
          type="textarea"
          placeholder="请输入用户端备注"
          v-model:value="formParams.user_remarks"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="handleClose">取消</n-button>
        <n-button type="error" :loading="loading" @click="handleSubmit">确定扣款</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';
  import { userMoneySub } from '@/api/system/user';

  const message = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const showModal = ref(false);

  const props = defineProps<{
    visible: boolean;
    userData?: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    'success': [];
  }>();

  const formParams = reactive({
    id: 0,
    money: 0,
    type: 1,
    user_remarks: '',
  });

  const rules: FormRules = {
    money: {
      required: true,
      type: 'number',
      message: '请输入扣款金额',
      trigger: ['blur', 'change'],
      validator: (rule: any, value: number) => {
        if (!value || value <= 0) {
          return new Error('扣款金额必须大于0');
        }
        return true;
      },
    },
    type: {
      required: true,
      type: 'number',
      message: '请选择扣款类型',
      trigger: ['change'],
    },
    user_remarks: {
      required: true,
      message: '请输入用户端备注',
      trigger: ['blur', 'input'],
    },
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.userData) {
      formParams.id = props.userData.id;
      formParams.money = 0;
      formParams.type = 1;
      formParams.user_remarks = '';
    }
  });

  watch(showModal, (val) => {
    emit('update:visible', val);
  });

  const handleClose = () => {
    showModal.value = false;
  };

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      loading.value = true;

      const res: any = await userMoneySub(formParams);

      if (res.code === 1) {
        message.success('扣款成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '扣款失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
