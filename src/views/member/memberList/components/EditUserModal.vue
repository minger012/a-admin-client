<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="编辑用户信息" style="width: 600px;">
    <n-form
      :model="formParams"
      :rules="rules"
      ref="formRef"
      label-placement="left"
      :label-width="120"
      class="py-4"
    >
      <n-form-item label="用户简称" path="short_name">
        <n-input placeholder="请输入用户简称" v-model:value="formParams.short_name" />
      </n-form-item>
      <n-form-item label="店铺星级" path="lv">
        <n-select v-model:value="formParams.lv" :options="starOptions" />
      </n-form-item>
      <n-form-item label="保证金" path="pledge_money">
        <n-input-number v-model:value="formParams.pledge_money" :min="0" :precision="2" style="width: 100%">
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>
      <n-form-item label="手机号" path="phone">
        <n-input placeholder="请输入手机号" v-model:value="formParams.phone" />
      </n-form-item>
      <n-form-item label="姓名" path="name">
        <n-input placeholder="请输入姓名" v-model:value="formParams.name" />
      </n-form-item>
      <n-form-item label="Facebook ID" path="fb_id">
        <n-input placeholder="请输入Facebook ID" v-model:value="formParams.fb_id" />
      </n-form-item>
      <n-form-item label="是否激活" path="state">
        <n-radio-group v-model:value="formParams.state">
          <n-space>
            <n-radio :value="1">激活</n-radio>
            <n-radio :value="2">未激活</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      
      <n-form-item label="是否退还保证金" path="pledge_refund">
        <n-radio-group v-model:value="formParams.pledge_refund">
          <n-space>
            <n-radio :value="0">否</n-radio>
            <n-radio :value="1">是</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="积分" path="score">
        <n-input-number v-model:value="formParams.score" :min="0" style="width: 100%" />
      </n-form-item>
      <n-form-item label="提现禁用原因" path="withdraw_disabled">
        <n-input
          type="textarea"
          placeholder="请输入提现禁用原因"
          v-model:value="formParams.withdraw_disabled"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>
      <n-form-item label="客服地址" path="service_address">
        <n-input placeholder="请输入客服地址" v-model:value="formParams.service_address" />
      </n-form-item>
      <n-form-item label="客服类型" path="service_type">
        <n-input-number v-model:value="formParams.service_type" :min="0" style="width: 100%" />
      </n-form-item>
      <n-form-item label="代运营ID" path="operate">
        <n-input placeholder="请输入代运营ID" v-model:value="formParams.operate" />
      </n-form-item>
      <n-form-item label="备注" path="remarks">
        <n-input
          type="textarea"
          placeholder="请输入备注"
          v-model:value="formParams.remarks"
          :autosize="{ minRows: 3, maxRows: 5 }"
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
  import { editUser } from '@/api/system/user';

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

  const starOptions = [
    { label: '星级1', value: 1 },
    { label: '星级2', value: 2 },
    { label: '星级3', value: 3 },
    { label: '星级4', value: 4 },
    { label: '星级5', value: 5 },
  ];

  const formParams = reactive({
    id: 0,
    short_name: '',
    phone: '',
    name: '',
    fb_id: '',
    lv: 1,
    state: 1,
    pledge_money: 0,
    pledge_refund: 0,
    score: 0,
    withdraw_disabled: '',
    service_address: '',
    service_type: 0,
    operate: '',
    remarks: '',
  });

  const rules: FormRules = {
    phone: {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['blur'],
    },
    fb_id: {
      required: true,
      message: '请输入Facebook ID',
      trigger: ['blur', 'input'],
    },
    operate: {
      required: true,
      message: '请输入代运营ID',
      trigger: ['blur', 'input'],
    },
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.userData) {
      Object.assign(formParams, {
        id: props.userData.id,
        short_name: props.userData.short_name,
        phone: props.userData.phone || '',
        name: props.userData.name || '',
        fb_id: props.userData.fb_id || '',
        lv: props.userData.lv || 1,
        state: props.userData.state || 1,
        pledge_money: props.userData.pledge_money || 0,
        pledge_refund: props.userData.pledge_refund || 0,
        score: props.userData.score || 0,
        withdraw_disabled: props.userData.withdraw_disabled || '',
        service_address: props.userData.service_address || '',
        service_type: props.userData.service_type || 0,
        operate: props.userData.operate || '',
        remarks: props.userData.remarks || '',
      });
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

      const res: any = await editUser(formParams);
      if (res.code === 1) {
        message.success('修改成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '修改失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
