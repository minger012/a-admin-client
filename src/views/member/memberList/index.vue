<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #stateSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          placeholder="请选择状态"
          :options="[
            { label: '全部', value: '' },
            { label: '正常', value: 1 },
            { label: '禁止登录', value: 2 },
            { label: '禁止投注', value: 3 },
            { label: '禁止提现', value: 4 },
            { label: '禁止充值', value: 5 },
          ]"
          clearable
        />
      </template>
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:MemberListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :loading="loading"
      :scroll-x="1800"
      :striped="true"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addMember">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增会员
        </n-button>
      </template>
    </BasicTable>

    <!-- 账变记录弹窗 -->
    <n-modal v-model:show="showFlowModal" :show-icon="false" preset="card" style="width: 1200px;" title="账变记录">
      <MemberFlow :member-id="selectedMemberId"  />
    </n-modal>

    <!-- 银行卡列表弹窗 -->
    <n-modal v-model:show="showBankCardModal" :show-icon="false" preset="card" style="width: 1200px;" title="银行卡列表">
      <BankCardList :member-id="selectedMemberId" ref="bankCardListRef" />
    </n-modal>

    <!-- 编辑会员弹窗 -->
    <n-modal v-model:show="showEditModal" style="width:600px;" :show-icon="false" preset="dialog" :title="formParams.id ? '编辑会员' : '新增会员'">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="用户名" path="username">
          <n-input placeholder="请输入用户名" v-model:value="formParams.username" :disabled="!!formParams.id" />
        </n-form-item>
        <n-form-item label="手机号" path="phone">
          <n-input placeholder="请输入手机号" v-model:value="formParams.phone" />
        </n-form-item>
        <n-form-item label="持卡人姓名" path="name">
          <n-input placeholder="请输入姓名" v-model:value="formParams.name" />
        </n-form-item>
        <n-form-item label="VIP等级" path="lv">
          <n-select
            v-model:value="formParams.lv"
            placeholder="请选择等级"
            :options="vipLevelOptions"
          />
        </n-form-item>
        <n-form-item label="选择代理" path="admin_id">
          <n-select
            v-model:value="formParams.admin_id"
            placeholder="请选择代理"
            :options="adminOptions"
            filterable
            clearable
          />
        </n-form-item>
        <n-form-item label="状态" path="state">
          <n-radio-group v-model:value="formParams.state">
            <n-space>
              <n-radio :value="1">正常</n-radio>
              <n-radio :value="2">禁止登录</n-radio>
              <n-radio :value="3">禁止投注</n-radio>
              <n-radio :value="4">禁止提现</n-radio>
              <n-radio :value="5">禁止充值</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="信誉分" path="score">
          <n-input-number placeholder="请输入信誉分" v-model:value="formParams.score" />
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input placeholder="请输入备注" v-model:value="formParams.remarks" />
        </n-form-item>

        
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmEditForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 金额变更弹窗 -->
    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPasswordModal" :show-icon="false" preset="dialog" title="修改密码">
      <n-form
        :model="passwordParams"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="用户名">
          <n-input disabled v-model:value="passwordParams.username" />
        </n-form-item>
        <n-form-item label="新密码" path="password">
          <n-input 
            type="password" 
            placeholder="请输入新密码" 
            v-model:value="passwordParams.password" 
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showPasswordModal = false)">取消</n-button>
          <n-button type="info" :loading="passwordBtnLoading" @click="confirmPasswordChange">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showAmountModal" :show-icon="false" preset="dialog" title="金额变更">
      <n-form
        :model="amountParams"
        :rules="amountRules"
        ref="amountFormRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="当前金额">
          <n-input-number
            v-model:value="amountParams.currentAmount"
            disabled
            :show-button="false"
          />
        </n-form-item>
        <n-form-item label="操作类型" path="operationType">
          <n-radio-group v-model:value="amountParams.operationType">
            <n-space>
              <n-radio value="add">加款</n-radio>
              <n-radio value="sub">扣款</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="金额" path="changeAmount">
          <n-input-number v-model:value="amountParams.changeAmount" :show-button="false" />
        </n-form-item>
        <n-form-item label="变更后金额">
          <n-input-number
            :value="getAmountAfterChange()"
            disabled
            :show-button="false"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showAmountModal = false)">取消</n-button>
          <n-button type="info" :loading="amountBtnLoading" @click="confirmAmountChange">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, onMounted, nextTick } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, MemberListData } from './columns';
  import MemberFlow from '@/components/MemberFlow/index.vue';
  import BankCardList from '@/components/BankCardList/index.vue';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules, NButton, NCheckbox, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NInputNumber, NDatePicker, NRadio, NRadioGroup } from 'naive-ui';
  import { getUserList, editUser, addUser, editUserPwd } from '@/api/system/user';
  import { userMoneyAdd, userMoneySub } from '@/api/system/money';
  import { getAdminList } from '@/api/system/admin';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const amountFormRef = ref();
  const loading = ref(false);
  const bankCardListRef = ref();
  
  // 搜索参数
  const searchParams = ref({
    username: '',
    name: '',
    state: null,
    timeRange: null,
    page: 1,
    pageSize: 10,
  });
  
  // VIP等级选项
  const vipLevelOptions = [
    { label: 'VIP 1', value: '1' },
    { label: 'VIP 2', value: '2' },
    { label: 'VIP 3', value: '3' },
    { label: 'VIP 4', value: '4' },
    { label: 'VIP 5', value: '5' },
    { label: 'VIP 6', value: '6' },
    { label: 'VIP 7', value: '7' },
    { label: 'VIP 8', value: '8' },
    { label: 'VIP 9', value: '9' },
  ];
  
  // 管理员列表
  const adminOptions = ref([]);
  
  // 获取管理员列表
  const fetchAdminList = async () => {
    try {
      const res = await getAdminList({ page: 1, pageSize: 100 });
      if (res.code === 1) {
        adminOptions.value = res.data.list.map(admin => ({
          label: admin.username,
          value: admin.id
        }));
      }
    } catch (error) {
      console.error('获取管理员列表失败', error);
    }
  };
  fetchAdminList()
  
  // 编辑表单
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const showBankCardModal = ref(false);
  
  // 修改密码
  const showPasswordModal = ref(false);
  const passwordBtnLoading = ref(false);
  const passwordParams = reactive({
    id: 0,
    username: '',
    password: ''
  });
  
  // 金额变更
  const showAmountModal = ref(false);
  const amountBtnLoading = ref(false);
  
  // 账变记录
  const showFlowModal = ref(false);
  const selectedMemberId = ref(0);
  const amountParams = reactive({
    id: 0,
    username: '',
    currentAmount: 0,
    changeAmount: 0,
    operationType: 'add',
    name:'',
    balance: 0
  });
  const formParams = reactive({
    id: 0,
    username: '',
    name: '',
    lv: '',
    pid: '',
    remarks: '',
    score: 100,
    state: '1',
    phone: '',
  });

  // 表单验证规则
  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas: [
      {
        field: 'username',
        component: 'NInput',
        label: '用户名',
        componentProps: {
          placeholder: '请输入用户名',
        },
      },
      {
        field: 'name',
        component: 'NInput',
        label: '姓名',
        componentProps: {
          placeholder: '请输入姓名',
        },
      },
      {
        field: 'state',
        component: 'NSelect',
        label: '状态',
        defaultValue: '',
        slot: 'stateSlot',
      },
      {
        field: 'timeRange',
        component: 'NDatePicker',
        label: '注册时间',
        componentProps: {
          type: 'datetimerange',
          clearable: true,
        },
      },
    ],
  });

  const rules: FormRules = {
    username: {
      required: true,
      trigger: ['blur', 'input', 'change'],
      message: '请输入用户名',
    },
    lv: {
      required: true,
      trigger: ['blur', 'input', 'change'],
      validator: (rule, value) => {
        if (value === null || value === undefined || value === '') {
          return new Error('请输入等级');
        }
        return true;
      },
    },
    state: {
      required: true,
      type:'number',
      trigger: ['blur', 'input', 'change'],
      validator(rule, value) {
        if (!value && value !== 0) {
          return new Error('请选择状态');
        }
        return true;
      },
    },
    score: {
      type: 'number',
      trigger: ['blur', 'input', 'change'],
    },
    remarks: {
      type: 'string',
      trigger: ['blur', 'input', 'change'],
    },
  };

  // 密码修改表单验证规则
  const passwordRules: FormRules = {
    password: {
      required: true,
      trigger: ['blur', 'input', 'change'],
      message: '请输入新密码',
    },
  };

  // 金额变更规则
  const amountRules: FormRules = {
    changeAmount: {
      required: true,
      trigger: ['blur', 'input', 'change'],
      validator: (rule, value) => {
        if (!value || value <= 0) {
          return new Error('请输入大于0的金额');
        }
        return true;
      },
    },
    operationType: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择操作类型',
    },
  };
  
  // 搜索表单配置
  const actionColumn = reactive({
    width: 320,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            type: 'primary',
          },
          {
            label: '修改密码',
            onClick: handlePasswordChange.bind(null, record),
            type: 'warning',
          },
          {
            label: '账变记录',
            onClick: handleViewFlow.bind(null, record),
            type: 'info',
          },
          {
            label: '银行卡',
            onClick: handleViewBankCard.bind(null, record),
            type: 'success',
          },
        ],
      });
    },
  });

  // 加载表格数据
  const loadDataTable = async ({ page, pageSize }) => {
    try {
      loading.value = true;
      const params: any = {
        page: page,
        pageSize: pageSize,
        username: searchParams.value.username || undefined,
        name: searchParams.value.name || undefined,
        state: searchParams.value.state || undefined,
      };

      // 处理时间范围
      if (searchParams.value.timeRange && searchParams.value.timeRange.length === 2) {
        params.startTime = Math.floor(searchParams.value.timeRange[0].getTime() / 1000);
        params.endTime = Math.floor(searchParams.value.timeRange[1].getTime() / 1000);
      }

      const res = await getUserList(params);
      if (res.code === 1) {
        return {
          page: res.data.page,
          pageSize: res.data.page_size,
          pageCount: res.data.total_page,
          itemCount: res.data.total,
          list: res.data.list || [],
        }
      } else {
        message.error(res.msg || '获取数据失败');
        return {
          list: [],
          page: 1,
          pageCount: 0,
          pageSize: 10,
          itemCount: 0,
        };
      }
    } catch (error) {
      message.error('获取数据失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    } finally {
      loading.value = false;
    }
  }

  // 新增会员
  function addMember() {
    showEditModal.value = true;
    formParams.id = 0;
    formParams.username = '';
    formParams.name = '';
    formParams.lv = '1';
    formParams.pid = '';
    formParams.state = 1;
    formParams.phone = '';
    formParams.remarks = '';
    formParams.score = 100;
  }

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 确认编辑表单
  function confirmEditForm() {
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        formBtnLoading.value = true;
        
        // 如果是编辑模式且没有选择修改密码，则不提交密码字段
        const submitData = { ...formParams };
        
        if (formParams.id) {
          // 编辑会员
          editUser(submitData)
            .then((response) => {
              formBtnLoading.value = false;
              showEditModal.value = false;
              message.success('编辑成功');
              reloadTable();
            })
            .catch((error) => {
              formBtnLoading.value = false;
              message.error('编辑失败: ' + (error.message || '未知错误'));
              console.error('会员编辑失败:', error);
            });
        } else {
          // 新增会员，添加固定参数 isP = 0
          const addData = { ...submitData, isP: '0' };
          
          try {
            const res = await addUser(addData)
            if (res.code === 1) {
              formBtnLoading.value = false;
              showEditModal.value = false;
              message.success('添加成功');
              reloadTable();
            } else {
              formBtnLoading.value = false;
              message.error(res.msg || '添加失败');
            }
          } catch (error) {
            formBtnLoading.value = false;
            message.error('添加失败: ' + (error.message || '未知错误'));
            console.error('会员添加失败:', error);
          }
        }
      }
    });
  }

  // 编辑会员
  function handleEdit(record: MemberListData) {
    formParams.id = record.id;
    formParams.username = record.username;
    formParams.name = record.name;
    formParams.lv = record.lv ? record.lv.toString() : '1';
    formParams.pid = record.pid;
    formParams.state = record.state;
    formParams.phone = record.phone;
    formParams.remarks = record.remarks || '';
    formParams.score = record.score || 0;
    showEditModal.value = true;
  }
  
  // 处理密码修改
  const handlePasswordChange = (record: MemberListData) => {
    showPasswordModal.value = true;
    passwordParams.id = record.id;
    passwordParams.username = record.username;
    passwordParams.password = '';
  };
  
  // 确认密码修改
  const passwordFormRef = ref();
  async function confirmPasswordChange() {
    passwordFormRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          passwordBtnLoading.value = true;
          const params = {
            id: passwordParams.id,
            password: passwordParams.password
          };
          
          const res = await editUserPwd(params);
          
          if (res.code === 1) {
            passwordBtnLoading.value = false;
            showPasswordModal.value = false;
            message.success('密码修改成功');
          } else {
            passwordBtnLoading.value = false;
            message.error(res.msg || '密码修改失败');
          }
        } catch (error) {
          passwordBtnLoading.value = false;
          message.error('密码修改失败: ' + (error.message || '未知错误'));
          console.error('密码修改失败:', error);
        }
      }
    });
  }

  // 处理金额变更
  const handleAmountChange = (record: MemberListData) => {
    console.log('金额变更', record);
    showAmountModal.value = true;
    amountParams.id = record.id;
    amountParams.username = record.username;
    amountParams.name = record.name;
    amountParams.balance = record.balance;
    amountParams.changeAmount = 0;
  };

  // 查看账变记录
  const handleViewFlow = (record: MemberListData) => {
    console.log('查看账变记录', record);
    selectedMemberId.value = record.id;
    showFlowModal.value = true;
  };
  
  // 查看银行卡列表
  const handleViewBankCard = (record: MemberListData) => {
    console.log('查看银行卡列表', record);
    selectedMemberId.value = record.id;
    showBankCardModal.value = true;
    nextTick(() => {
      bankCardListRef.value?.reload();
    });
  };

  // 计算变更后的金额
  function getAmountAfterChange() {
    if (amountParams.operationType === 'add') {
      return amountParams.currentAmount + amountParams.changeAmount;
    } else {
      return Math.max(0, amountParams.currentAmount - amountParams.changeAmount);
    }
  }

  // 确认金额变更
  async function confirmAmountChange() {
    amountFormRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          amountBtnLoading.value = true;
          const params = {
            username: amountParams.username,
            money: amountParams.changeAmount,
            type: 1
          };

          let res;
          if (amountParams.operationType === 'add') {
            res = await userMoneyAdd(params);
          } else {
            res = await userMoneySub(params);
          }

          if (res.code === 1) {
            message.success('操作成功');
            showAmountModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败');
        } finally {
          amountBtnLoading.value = false;
        }
      }
    });
  }

  // 搜索
  function handleSubmit(values) {
    searchParams.value = {
      ...searchParams.value,
      ...values,
      page: 1,
    };
    reloadTable();
  }

  // 重置
  function handleReset() {
    searchParams.value = {
      username: '',
      name: '',
      state: null,
      timeRange: null,
      page: 1,
      pageSize: 10,
    };
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
