<template>
  <n-modal
    v-model:show="showModal"
    :show-icon="false"
    preset="dialog"
    :title="modalTitle"
    :mask-closable="false"
  >
    <n-form
      :model="formParams"
      :rules="rules"
      ref="formRef"
      label-placement="left"
      :label-width="80"
      class="py-4"
    >
      <n-form-item label="角色名称" path="name">
        <n-input placeholder="请输入角色名称" v-model:value="formParams.name" />
      </n-form-item>
      <n-form-item label="说明" path="desc">
        <n-input
          type="textarea"
          placeholder="请输入说明"
          v-model:value="formParams.desc"
        />
      </n-form-item>
      <n-form-item label="权限" path="auth">
        <n-tree
          block-line
          cascade
          checkable
          :virtual-scroll="true"
          :data="permissionData"
          :checked-keys="checkedKeys"
          style="max-height: 400px; overflow: auto"
          @update:checked-keys="handleCheckedKeys"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="closeModal">取消</n-button>
        <n-button type="primary" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { permissionData, authStringToKeys, keysToAuthString } from './permissionData';
import { addRole, editRole } from '@/api/system/role';
import type { FormRules } from 'naive-ui';
import type { RoleData } from './columns';

const emit = defineEmits(['reloadTable']);
const message = useMessage();

const showModal = ref(false);
const modalType = ref('add'); // 'add' or 'edit'
const formRef = ref();
const formBtnLoading = ref(false);
const checkedKeys = ref<string[]>([]);

const formParams = reactive<{
  id: number | null;
  name: string;
  desc: string;
  auth: string;
}>({
  id: null,
  name: '',
  desc: '',
  auth: '',
});

const modalTitle = computed(() => {
  return modalType.value === 'add' ? '新增角色' : '编辑角色';
});

const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入角色名称',
  },
};

function handleCheckedKeys(keys) {
  checkedKeys.value = keys;
  formParams.auth = keysToAuthString(keys);
}

function openAddModal() {
  modalType.value = 'add';
  resetForm();
  showModal.value = true;
}

function openEditModal(record: RoleData) {
  modalType.value = 'edit';
  resetForm();
  
  formParams.id = record.id;
  formParams.name = record.name;
  formParams.desc = record.desc || '';
  formParams.auth = record.auth || '';
  
  // 设置选中的权限
  checkedKeys.value = authStringToKeys(record.auth);
  
  showModal.value = true;
}

function resetForm() {
  formParams.id = null;
  formParams.name = '';
  formParams.desc = '';
  formParams.auth = '';
  checkedKeys.value = [];
  
  if (formRef.value) {
    formRef.value.restoreValidation();
  }
}

function closeModal() {
  showModal.value = false;
}

function confirmForm() {
  formRef.value?.validate(async (errors) => {
    if (errors) return;
    
    formBtnLoading.value = true;
    
    try {
      const apiCall = modalType.value === 'add' ? addRole : editRole;
      const params = {
        ...formParams,
        auth: keysToAuthString(checkedKeys.value),
      };
      
      const res: any = await apiCall(params);
      
      if (res.code == 1) {
        message.success(modalType.value === 'add' ? '添加成功' : '编辑成功');
        emit('reloadTable');
        closeModal();
      } else {
        message.error(res.msg || (modalType.value === 'add' ? '添加失败' : '编辑失败'));
      }
    } catch (error) {
      message.error(modalType.value === 'add' ? '添加失败' : '编辑失败');
    } finally {
      formBtnLoading.value = false;
    }
  });
}

defineExpose({
  openAddModal,
  openEditModal,
});
</script>

<style scoped>
.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
