<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="发送优惠券" style="width: 500px;">
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
      <n-form-item label="选择优惠券" path="cid">
        <n-select
          v-model:value="formParams.cid"
          :options="couponOptions"
          placeholder="请选择优惠券"
          :loading="loadingCoupons"
          filterable
          clearable
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
  import { userAddCoupon } from '@/api/system/user';
  import { couponList } from '@/api/coupon';

  const message = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const loadingCoupons = ref(false);
  const showModal = ref(false);
  const couponOptions = ref<any[]>([]);

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
    cid: null as number | null,
  });

  const rules: FormRules = {
    cid: {
      required: true,
      type: 'number',
      message: '请选择优惠券',
      trigger: ['change'],
    },
  };

  // 加载优惠券列表
  const loadCouponList = async () => {
    try {
      loadingCoupons.value = true;
      const res: any = await couponList({
        page: '1',
        pageSize: '100',
        state: 1, // 只显示正常状态的优惠券
      });

      if (res.code === 1 && res.data.list) {
        couponOptions.value = res.data.list.map((item: any) => ({
          label: `${item.name} (${item.discount}% - ID:${item.id})`,
          value: item.id,
        }));
      }
    } catch (error) {
      console.error('加载优惠券列表失败:', error);
    } finally {
      loadingCoupons.value = false;
    }
  };

  watch(() => props.visible, (val) => {
    showModal.value = val;
    if (val && props.userData) {
      formParams.id = props.userData.id;
      formParams.cid = null;
      // 加载优惠券列表
      if (couponOptions.value.length === 0) {
        loadCouponList();
      }
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

      const res: any = await userAddCoupon({
        id: formParams.id,
        cid: formParams.cid,
      });

      if (res.code === 1) {
        message.success('优惠券发送成功');
        showModal.value = false;
        emit('success');
      } else {
        message.error(res.msg || '优惠券发送失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped></style>
