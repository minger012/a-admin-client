<template>
  <n-button-group>
    <n-button
      :type="modelValue === 'summary' ? 'primary' : 'default'"
      @click="handleChange('summary')"
    >
      汇总统计
    </n-button>
    <n-button
      :type="modelValue === 'detail' ? 'primary' : 'default'"
      @click="handleChange('detail')"
    >
      明细统计
    </n-button>
  </n-button-group>
</template>

<script lang="ts" setup>
  type ViewType = 'summary' | 'detail';

  interface Props {
    modelValue: ViewType;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    'update:modelValue': [value: ViewType];
  }>();

  function handleChange(value: ViewType) {
    emit('update:modelValue', value);
  }
</script>

<style lang="less" scoped></style>
