<template>
  <div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :loading="loading"
    >
      <template #tableTitle></template>
    </BasicTable>

    <!-- 编辑银行卡弹窗 -->
    <n-modal
      v-model:show="showEditModal"
      style="width:500px;"
      :show-icon="false"
      preset="dialog"
      title="编辑银行卡"
    >
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="持卡人姓名" path="name">
          <n-input placeholder="请输入姓名" v-model:value="formParams.name" />
        </n-form-item>
        <n-form-item label="银行卡号" path="cardno">
          <n-input placeholder="请输入银行卡号" v-model:value="formParams.cardno" />
        </n-form-item>
        <n-form-item label="银行名称" path="bank">
          <n-input placeholder="请输入银行名称" v-model:value="formParams.bank" />
        </n-form-item>
        <n-form-item label="兑换密码" path="password">
          <n-input placeholder="选填，不填不会修改" v-model:value="formParams.password" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { h, reactive, ref, onMounted } from 'vue';
import { BasicTable, TableAction } from '@/components/Table';
import { BasicColumn } from '@/components/Table';
import { useMessage } from 'naive-ui';
import { formatToDateTime } from '@/utils/dateUtil';
import { getBankCardList, editBankCard } from '@/api/member/bankCard';

const props = defineProps({
  memberId: {
    type: Number,
    required: true,
  },
});

const message = useMessage();
const actionRef = ref();
const formRef = ref();
const loading = ref(false);
const showEditModal = ref(false);
const formBtnLoading = ref(false);

// 表单参数
const formParams = ref({
  id: null,
  name: '',
  cardno: '',
  bank: '',
  password:""
});

// 表单验证规则
const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入持卡人姓名',
  },
  cardno: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入银行卡号',
  },
  bank: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入银行名称',
  },
};

// 表格列定义
const columns: BasicColumn[] = [
  {
    title: '编号',
    key: 'id',
    width: 80,
  },
  {
    title: '持卡人姓名',
    key: 'name',
    width: 120,
  },
  {
    title: '银行名称',
    key: 'bank',
    width: 180,
  },
  {
    title: '卡号',
    key: 'cardno',
    width: 180,
  },
  {
    title: '开户支行',
    key: 'branch',
    width: 180,
    render: (row) => {
      return row.branch || '-';
    },
  },
  // {
  //   title: '兑换密码',
  //   key: 'password',
  //   width: 120,
  // },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render: (row) => {
      return row.create_time ? formatToDateTime(row.create_time * 1000) : '-';
    },
  },
];

// 操作列
const actionColumn = reactive({
  width: 100,
  title: '操作',
  key: 'action',
  fixed: 'right',
  render: (record) => {
    return h(TableAction, {
      style: 'button',
      actions: [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
          type: 'primary',
        },
      ],
    });
  },
});

// 加载银行卡数据
const loadDataTable = async ({ page, pageSize }) => {
  loading.value = true;
  try {
    const res = await getBankCardList({
      page,
      pageSize,
      id: props.memberId,
    });

    loading.value = false;
    
    return {
      list: res.data?.list || [],
      page: res.data?.page || 1,
      pageSize: res.data?.page_size || 10,
      pageCount: res.data?.total_page || 1,
      itemCount: res.data?.total || 0,
    };
  } catch (error) {
    loading.value = false;
    return {
      list: [],
      page: 1,
      pageSize: 10,
      pageCount: 1,
      itemCount: 0,
    };
  }
};

// 编辑银行卡
const handleEdit = (record) => {
  showEditModal.value = true;
  formParams.value = {
    id: record.id,
    name: record.name,
    cardno: record.cardno,
    bank: record.bank,
    password:""
  };
};

// 确认表单提交
const confirmForm = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return;

    formBtnLoading.value = true;

    try {
      const obj = {
        id: formParams.value.id,
        name: formParams.value.name,
        cardno: formParams.value.cardno,
        bank: formParams.value.bank,
      }
      if(formParams.value.password){
        obj.password = formParams.value.password
      }
      const res = await editBankCard(obj);

      if (res.code === 1) {
        message.success('编辑成功');
        showEditModal.value = false;
        actionRef.value?.reload();
      } else {
        message.error(res.msg || '编辑失败');
      }
    } catch (error) {
      console.error('编辑银行卡失败:', error);
      message.error('编辑失败');
    } finally {
      formBtnLoading.value = false;
    }
  });
};

// 暴露重新加载方法
defineExpose({
  reload: () => {
    actionRef.value?.reload();
  },
});
</script>
