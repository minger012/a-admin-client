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
      <n-form-item label="用户名" path="username">
        <n-input placeholder="请输入用户名" v-model:value="formParams.username" :disabled="isEdit" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          type="password"
          placeholder="编辑时可不填写密码"
          v-model:value="formParams.password"
        />
        <template #help v-if="isEdit">
          <span class="text-gray-400">不修改密码请留空</span>
        </template>
      </n-form-item>
      <n-form-item label="角色" path="auth_id">
        <n-select
          v-model:value="formParams.auth_id"
          :options="roleOptions"
          placeholder="请选择权限组"
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
import { addAdmin, editAdmin } from '@/api/system/admin';
import { getRoleList } from '@/api/system/role';
import type { FormRules } from 'naive-ui';
import type { AdminData } from './columns';

const emit = defineEmits(['reloadTable']);
const message = useMessage();

const showModal = ref(false);
const modalType = ref('add'); // 'add' or 'edit'
const formRef = ref();
const formBtnLoading = ref(false);
const isEdit = ref(false);
const roleOptions = ref([]);

const formParams = reactive({
  username: '',
  password: '',
  auth_id: null,
});

const modalTitle = computed(() => {
  return modalType.value === 'add' ? '新增管理员' : '编辑管理员';
});

const rules = computed((): FormRules => {
  return {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    password: {
      required: modalType.value === 'add',
      trigger: ['blur', 'input'],
      message: '请输入密码',
    },
    auth_id: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择角色',
      type: 'number',
    },
  };
});

async function loadRoleOptions() {
  try {
    const res = await getRoleList({ pageSize: 100, page: 1 });
    if (res.code === 1) {
      roleOptions.value = res.data.list.map(item => ({
        label: item.name,
        value: item.id,
      }));
    }
  } catch (error) {
    console.error('Failed to load role options:', error);
  }
}

function openAddModal() {
  modalType.value = 'add';
  isEdit.value = false;
  resetForm();
  loadRoleOptions();
  showModal.value = true;
}

function openEditModal(record: AdminData) {
  modalType.value = 'edit';
  isEdit.value = true;
  resetForm();
  
  formParams.username = record.username;
  formParams.password = ''; // Don't populate password for security
  formParams.auth_id = record.auth_id;
  
  loadRoleOptions();
  showModal.value = true;
}

function resetForm() {
  formParams.username = '';
  formParams.password = '';
  formParams.auth_id = null;
  
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
      // 如果是编辑模式且密码为空，则从请求参数中移除密码字段
      const params = { ...formParams };
      if (modalType.value === 'edit' && !params.password) {
        delete params.password;
      }
      
      const apiCall = modalType.value === 'add' ? addAdmin : editAdmin;
      const res = await apiCall(params);
      
      if (res.code === 1) {
        message.success(modalType.value === 'add' ? '添加成功' : '编辑成功');
        closeModal();
        emit('reloadTable');
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
