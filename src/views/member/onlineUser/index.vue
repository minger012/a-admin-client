<template>
  <n-card :bordered="false" class="proCard">
    <!-- 搜索表单 -->
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
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
    </BasicTable>

  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns } from './columns';
  import { useMessage } from 'naive-ui';
  import { NButton, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NInputNumber, NDatePicker, NRadio, NRadioGroup } from 'naive-ui';
  import { getOnlineUserList, forceLogout } from '@/api/system/user';
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
  });

  // 加载表格数据
  const loadTableData = async ({ page, pageSize }) => {
    try {
      loading.value = true;
      const params: any = {
        username: searchParams.value.username || undefined,
      };

      const res = await getOnlineUserList(params);
      if (res.code === 1) {
        const responseData = res.data;
        return {
          list: responseData.list || [],
        }
      } else {
        message.error(res.msg || '获取数据失败');
        return {
          list: [],
        };
      }
    } catch (error) {
      message.error('获取数据失败');
      return {
        list: []
      };
    } finally {
      loading.value = false;
    }
  };


  // 处理重置
  const handleReset = () => {
    searchParams.value = {
      username: '',
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
            label: '强制下线',
            type:'error',
            onClick: handleForceLogout.bind(null, record),
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

  // 强制用户下线
  function handleForceLogout(record) {
    window.$dialog.warning({
      title: '强制下线确认',
      content: `确定要将用户「${record.username}」强制下线吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          loading.value = true;
          const res = await forceLogout({ username: record.username });
          if (res.code === 1) {
            message.success('强制下线成功');
            actionRef.value?.reload();
          } else {
            message.error(res.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败');
        } finally {
          loading.value = false;
        }
      },
    });
  }

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
          const addData = { ...submitData };
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
