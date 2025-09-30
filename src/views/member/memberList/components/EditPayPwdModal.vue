<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="修改支付密码" style="width: 500px;">
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
      <n-form-item label="新支付密码" path="pay_password">
        <n-input
          type="password"
          show-password-on="click"
          placeholder="请输入新支付密码"
          v-model:value="formParams.pay_password"
          maxlength="6"
        />
      </n-form-item>
      <n-form-item label="确认支付密码" path="confirmPassword">
        <n-input
          type="password"
          show-password-on="click"
          placeholder="请再次输入支付密码"
          v-model:value="formParams.confirmPassword"
          maxlength="6"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="handleClose">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';
  import { editUserPayPwd } from '@/api/system/user';

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
    pay_password: '',
    confirmPassword: '',
  });

  const validatePasswordSame = (rule: any, value: string) => {
    if (value !== formParams.pay_password) {
      return new Error('两次输入的密码不一致');
    }
    return true;
  };

  const rules: FormRules = {
    pay_password: {
      required: true,
      message: '请输入新支付密码',
      trigger: ['blur', 'input'],
    },
    confirmPassword: {
      required: true,
      validator: validatePasswordSame,
      trigger: ['blur', 'input'],
    },
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.userData) {
      formParams.id = props.userData.id;
      formParams.pay_password = '';
      formParams.confirmPassword = '';
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

      const res: any = await editUserPayPwd({
        id: formParams.id,
        pay_password: formParams.pay_password,
      });

      if (res.code === 1) {
        message.success('支付密码修改成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '支付密码修改失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
