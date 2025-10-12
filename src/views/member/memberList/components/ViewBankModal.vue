<template>
  <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="查看提现方式" style="width: 500px;">
    <n-form
      :model="formParams"
      ref="formRef"
      label-placement="left"
      :label-width="100"
      class="py-4"
    >
      <n-form-item label="用户名">
        {{ userData?.username || '-'}}
      </n-form-item>
      <n-form-item label="提现方式">
        {{ formParams.methods || '-'}}
      </n-form-item>
      <n-form-item label="货币类型">
        {{ formParams.currency || '-'}}
      </n-form-item>
      <n-form-item label="钱包地址">
        {{ formParams.address || '-'}}
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="handleClose">关闭</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';

  const formRef = ref();
  const showModal = ref(false);

  const props = defineProps<{
    visible: boolean;
    userData?: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
  }>();

  const formParams = reactive({
    methods: '',
    currency: '',
    address: '',
  });

  watch(
    () => props.visible,
    (val) => {
      showModal.value = val;
      if (val && props.userData) {
        formParams.methods = props.userData.methods || '';
        formParams.currency = props.userData.currency || '';
        formParams.address = props.userData.address || '';
      }
    }
  );

  watch(
    () => showModal.value,
    (val) => {
      emit('update:visible', val);
    }
  );

  function handleClose() {
    showModal.value = false;
  }
</script>

<style scoped></style>
