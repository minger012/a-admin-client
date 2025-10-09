<template>
  <n-modal v-model:show="showModal" preset="card" title="派单" style="width: 1100px;" :mask-closable="false">
    <n-tabs v-model:value="activeTab" type="card">
      <n-tab-pane name="batch" tab="批量派单">
        <BatchDispatch :uid="uid" />
      </n-tab-pane>
      <n-tab-pane name="manual" tab="手动派单">
        <ManualDispatch :uid="uid" />
      </n-tab-pane>
    </n-tabs>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BatchDispatch from './BatchDispatch.vue';
import ManualDispatch from './ManualDispatch.vue';

interface Props {
  uid: number;
}

defineProps<Props>();

const showModal = ref(false);
const activeTab = ref('batch');

// 暴露给父组件的方法
function open() {
  showModal.value = true;
  activeTab.value = 'batch';
}

function close() {
  showModal.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<style lang="less" scoped>

</style>
