<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="审核实名认证" style="width: 600px;">
    <n-form
      :model="formParams"
      :rules="rules"
      ref="formRef"
      label-placement="left"
      :label-width="120"
      class="py-4"
    >
      <n-form-item label="用户名">
        <n-input :value="realnameData?.username" disabled />
      </n-form-item>
      <n-form-item label="真实姓名">
        <n-input :value="realnameData?.real_name" disabled />
      </n-form-item>
      <n-form-item label="认证类型">
        <n-input :value="getVerifyTypeName(realnameData?.verify_type)" disabled />
      </n-form-item>
      <n-form-item label="证件照片">
        <n-space>
          <n-image
            v-if="realnameData?.front_image"
            width="120"
            :src="imageUrl + realnameData.front_image"
          />
          <n-image
            v-if="realnameData?.back_image"
            width="120"
            :src="imageUrl + realnameData.back_image"
          />
        </n-space>
      </n-form-item>
      <n-form-item label="审核状态" path="status">
        <n-radio-group v-model:value="formParams.status">
          <n-space>
            <n-radio :value="1">审核通过</n-radio>
            <n-radio :value="2">审核拒绝</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="拒绝原因" path="reject_reason" v-if="formParams.status === 2">
        <n-input
          type="textarea"
          placeholder="请输入拒绝原因"
          v-model:value="formParams.reject_reason"
          :rows="3"
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
  import { reactive, ref, watch, computed } from 'vue';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';
  import { auditRealname } from '@/api/system/realname';

  const message = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const showModal = ref(false);

  const imageUrl = computed(() => import.meta.env.VITE_GLOB_API_URL || '');

  const props = defineProps<{
    visible: boolean;
    realnameData?: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    'success': [];
  }>();

  const formParams = reactive({
    id: 0,
    status: 1,
    reject_reason: '',
  });

  const verifyTypeMap = {
    1: '护照',
    2: '驾驶证',
    3: '社会安全号',
    4: '身份证',
  };

  const getVerifyTypeName = (type: number) => {
    return verifyTypeMap[type] || '未知';
  };

  const validateRejectReason = (_rule: any, value: string) => {
    if (formParams.status === 2 && !value) {
      return new Error('请输入拒绝原因');
    }
    return true;
  };

  const rules: FormRules = {
    status: {
      required: true,
      type: 'number',
      message: '请选择审核状态',
      trigger: ['blur', 'change'],
    },
    reject_reason: {
      validator: validateRejectReason,
      trigger: ['blur', 'input'],
    },
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.realnameData) {
      formParams.id = props.realnameData.id;
      formParams.status = 1;
      formParams.reject_reason = '';
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

      const params: any = {
        id: formParams.id,
        status: formParams.status,
      };

      if (formParams.status === 2) {
        params.reject_reason = formParams.reject_reason;
      }

      const res: any = await auditRealname(params);

      if (res.code === 1) {
        message.success('审核成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '审核失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
