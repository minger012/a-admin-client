<template>
  <n-card :bordered="false" class="proCard">
    <!-- 搜索表单 -->
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #stateSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          placeholder="请选择状态"
          :options="[
            { label: '正常', value: 1 },
            { label: '停用', value: 0 },
            { label: '禁止', value: 2 },
          ]"
          clearable
        />
      </template>
    </BasicForm>

    <!-- 表格 -->
    <BasicTable
      :columns="columns"
      :request="loadTableData"
      :row-key="(row) => row.id"
      ref="actionRef"
      :loading="loading"
       :actionColumn="actionColumn"
      :scroll-x="1090"
      :striped="true"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addCompanionUser">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增陪玩用户
        </n-button>
      </template>
    </BasicTable>

    <!-- 编辑陪玩用户弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="formParams.id ? '编辑陪玩用户' : '新增陪玩用户'">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="用户名" path="username">
          <n-input placeholder="请输入用户名" v-model:value="formParams.username" />
        </n-form-item>
        <n-form-item label="姓名" path="name">
          <n-input placeholder="请输入姓名" v-model:value="formParams.name" />
        </n-form-item>
        <n-form-item label="状态" path="state">
          <n-select
            v-model:value="formParams.state"
            :options="[
              { label: '正常', value: 1 },
              { label: '禁用', value: 0 },
            ]"
          />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input 
            type="password" 
            :placeholder="formParams.id ? '选填，不输入不会修改密码' : '请输入密码'" 
            v-model:value="formParams.password" 
          />
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input type="textarea" placeholder="请输入备注" v-model:value="formParams.remarks" />
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
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns } from './columns';
  import { useMessage } from 'naive-ui';
  import { NButton, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NInputNumber, NDatePicker, NRadio, NRadioGroup } from 'naive-ui';
  import { getUserList, addUser, editUser } from '@/api/system/user';
  import { userMoneyAdd, userMoneySub } from '@/api/system/money';
  import { formatToDateTime } from '@/utils/dateUtil';
  import { PlusOutlined } from '@vicons/antd';
  const message = useMessage();
  const formRef = ref();
  const amountFormRef = ref();
  const actionRef = ref();
  const loading = ref(false);

  // 搜索参数
  const searchParams = ref({
    username: '',
    name: '',
    state: null,
    timeRange: null,
    page: 1,
    pageSize: 10,
  });

  // 加载表格数据
  const loadTableData = async ({ page, pageSize }) => {
    try {
      loading.value = true;
      const params: any = {
        page: page,
        pageSize: pageSize,
        isP: 1,
        username: searchParams.value.username || undefined,
        name: searchParams.value.name || undefined,
        state: searchParams.value.state || undefined,
      };

      // 处理时间范围
      if (searchParams.value.timeRange && searchParams.value.timeRange.length === 2) {
        params.sTime = Math.floor(searchParams.value.timeRange[0] / 1000);
        params.eTime = Math.floor(searchParams.value.timeRange[1] / 1000);
      }

      const res = await getUserList(params);
      if (res.code === 1) {
        const responseData = res.data;
        return {
          page: responseData.page,
          pageSize: responseData.page_size,
          pageCount: responseData.total_page,
          itemCount: responseData.total,
          list: responseData.list || [],
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
  };


  // 处理重置
  const handleReset = () => {
    searchParams.value = {
      username: '',
      name: '',
      state: null,
      timeRange: null,
      page: 1,
      pageSize: 10,
    };
    actionRef.value?.reload();
  };

  // 编辑表单
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const formParams = reactive({
    id: 0,
    username: '',
    name: '',
    state: 1,
    password: '',
    remarks: '',
  });

  // 金额变更表单
  const showAmountModal = ref(false);
  const amountBtnLoading = ref(false);
  const amountParams = reactive({
    id: 0,
    username: '',
    currentAmount: 0,
    changeAmount: 0,
    operationType: 'add', // 默认为加款
  });

  // 表单验证规则
  const rules: FormRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入姓名',
    },
    state: {
      required: true,
      type: 'number',
      trigger: ['blur', 'change'],
      message: '请选择状态',
    },
    password: {
      required: false,
      validator: (rule, value) => {
        if (!formParams.id && (!value || value.trim() === '')) {
          return new Error('请输入密码');
        }
        return true;
      },
      trigger: ['blur', 'input', 'change'],
    },
  };

  const amountRules: FormRules = {
    changeAmount: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入金额',
      validator: (rule, value) => {
        if (value === null || value === undefined || value <= 0) {
          return new Error('金额必须大于0');
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
  const schemas: FormSchema[] = [
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
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 220,
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
            type:"primary"
          },
          {
            label: '金额变更',
            onClick: handleAmountChange.bind(null, record),
            type:"warning"
          },
        ],
      });
    },
  });

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 新增陪玩用户
  function addCompanionUser() {
    formParams.id = 0;
    formParams.username = '';
    formParams.name = '';
    formParams.state = 1;
    formParams.password = '';
    formParams.remarks = '';
    showEditModal.value = true;
  }

  function reloadTable() {
    actionRef.value?.reload();
  }

  // 确认编辑表单
  function confirmEditForm() {
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        formBtnLoading.value = true;
        
        // 准备提交的数据
        const submitData = { ...formParams };
        
        // 如果是编辑模式且没有输入密码，则不提交密码字段
        if (formParams.id && !formParams.password) {
          delete submitData.password;
        }
        
        
        // 固定传入isP=1表示陪玩用户
        submitData.isP = '1';
        
        if (formParams.id) {
          // 编辑陪玩用户
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
              console.error('陪玩用户编辑失败:', error);
            });
        } else {
          // 新增陪玩用户
          try {
            const res = await addUser(submitData)
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
            console.error('陪玩用户添加失败:', error);
          }
          
        }
      }
    });
  }

  // 确认金额变更
  function confirmAmountChange() {
    amountFormRef.value?.validate((errors) => {
      if (!errors) {
        amountBtnLoading.value = true;
        
        const params = {
          username: amountParams.username,
          money: amountParams.changeAmount,
          type: 1
        };
        
        // 根据操作类型选择不同的API
        const api = amountParams.operationType === 'add' ? userMoneyAdd : userMoneySub;
        
        api(params)
          .then((response) => {
            amountBtnLoading.value = false;
            showAmountModal.value = false;
            message.success(amountParams.operationType === 'add' ? '加款成功' : '扣款成功');
            reloadTable();
          })
          .catch((error) => {
            amountBtnLoading.value = false;
            message.error('操作失败: ' + (error.message || '未知错误'));
            console.error('金额变更失败:', error);
          });
      }
    });
  }

  // 编辑陪玩用户
  function handleEdit(record: CompanionUserData) {
    formParams.id = record.id;
    formParams.username = record.username;
    formParams.name = record.name
    formParams.state = record.state
    formParams.password = '';
    formParams.remarks = record.remarks; 
    showEditModal.value = true;
  }

  // 金额变更
  function handleAmountChange(record: CompanionUserData) {
    amountParams.id = record.id;
    amountParams.username = record.username;
    amountParams.currentAmount = record.money || 0; // 如果没有余额，设置为0
    amountParams.changeAmount = 0;
    amountParams.operationType = 'add'; // 默认为加款
    showAmountModal.value = true;
  }
  
  // 获取变更后的金额
  function getAmountAfterChange() {
    const changeAmount = amountParams.changeAmount || 0;
    if (amountParams.operationType === 'add') {
      return amountParams.currentAmount + changeAmount;
    } else {
      return amountParams.currentAmount - changeAmount;
    }
  }

  // 搜索
  function handleSubmit(values) {
    // 将表单值同步到searchParams
    searchParams.value = {
      ...searchParams.value,
      username: values.username || '',
      name: values.name || '',
      state: values.state,
      timeRange: values.timeRange,
    };
    reloadTable();
  }

</script>

<style lang="less" scoped></style>
