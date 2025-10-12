<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="修改提现方式" style="width: 500px;">
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
      <n-form-item label="提现方式" path="methods">
        <n-select 
          placeholder="请选择提现方式" 
          v-model:value="formParams.methods"
          :options="withdrawMethodOptions"
        />
      </n-form-item>
      <n-form-item label="货币类型" path="currency">
        <n-input placeholder="请输入货币类型" v-model:value="formParams.currency" />
      </n-form-item>
      <n-form-item label="钱包地址" path="address">
        <n-input
          type="textarea"
          placeholder="请输入钱包地址"
          v-model:value="formParams.address"
          :autosize="{ minRows: 2, maxRows: 4 }"
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
  import { editUserBank } from '@/api/system/user';

  const message = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const showModal = ref(false);

  // 提现方式选项
  const withdrawMethodOptions = [
    { label: '加密货币', value: 'Crypto' }
  ];

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
    methods: '',
    currency: '',
    address: '',
  });

  const rules: FormRules = {
    methods: {
      required: true,
      message: '请选择提现方式',
      trigger: ['blur', 'change'],
    },
    currency: {
      required: true,
      message: '请输入货币类型',
      trigger: ['blur', 'input'],
    },
    address: {
      required: true,
      message: '请输入钱包地址',
      trigger: ['blur', 'input'],
    },
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.userData) {
      formParams.id = props.userData.id;
      formParams.methods = props.userData.methods || '';
      formParams.currency = props.userData.currency || '';
      formParams.address = props.userData.address || '';
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

      const res: any = await editUserBank(formParams);

      if (res.code === 1) {
        message.success('提现方式修改成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '提现方式修改失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
