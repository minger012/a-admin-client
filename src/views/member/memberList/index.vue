<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:MemberListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="2000"
      :striped="true"
    >
    </BasicTable>

    <!-- 编辑用户信息弹窗 -->
    <EditUserModal
      v-model:visible="showEditModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 修改登录密码弹窗 -->
    <EditPwdModal
      v-model:visible="showPwdModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 修改支付密码弹窗 -->
    <EditPayPwdModal
      v-model:visible="showPayPwdModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 修改提现方式弹窗 -->
    <EditBankModal
      v-model:visible="showBankModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 充值弹窗 -->
    <RechargeModal
      v-model:visible="showRechargeModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 扣款弹窗 -->
    <DeductModal
      v-model:visible="showDeductModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />

    <!-- 发送优惠券弹窗 -->
    <SendCouponModal
      v-model:visible="showCouponModal"
      :user-data="currentUser"
      @success="handleModalSuccess"
    />
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, MemberListData } from './columns';
  import { getUserList } from '@/api/system/user';
  import { useMessage, NButton, NSpace } from 'naive-ui';
  import EditUserModal from './components/EditUserModal.vue';
  import EditPwdModal from './components/EditPwdModal.vue';
  import EditPayPwdModal from './components/EditPayPwdModal.vue';
  import EditBankModal from './components/EditBankModal.vue';
  import RechargeModal from './components/RechargeModal.vue';
  import DeductModal from './components/DeductModal.vue';
  import SendCouponModal from './components/SendCouponModal.vue';

  const message = useMessage();
  const actionRef = ref();
  const currentUser = ref<any>(null);

  // 各种弹窗状态
  const showEditModal = ref(false);
  const showPwdModal = ref(false);
  const showPayPwdModal = ref(false);
  const showBankModal = ref(false);
  const showRechargeModal = ref(false);
  const showDeductModal = ref(false);
  const showCouponModal = ref(false);

  interface SearchFormType {
    uid?: string | number;
    username?: string;
    name?: string;
    short_name?: string;
    admin_username?: string;
    lang?: string;
    operate_id?: string;
    fb_id?: string | number;
    timeRange?: [number, number];
  }

  const searchForm = ref<SearchFormType>({});

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'uid',
      component: 'NInput',
      label: '用户ID',
      componentProps: {
        placeholder: '请输入用户ID',
      },
    },
    {
      field: 'fb_id',
      component: 'NInput',
      label: 'FB_ID',
      componentProps: {
        placeholder: '请输入FB_ID',
      },
    },
    {
      field: 'username',
      component: 'NInput',
      label: '用户名',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      field: 'admin_username',
      component: 'NInput',
      label: '所属管理者',
      componentProps: {
        placeholder: '请输入所属管理者',
      },
    },
    {
      field: 'name',
      component: 'NInput',
      label: '用户昵称',
      componentProps: {
        placeholder: '请输入用户昵称',
      },
    },
    {
      field: 'short_name',
      component: 'NInput',
      label: '用户简称',
      componentProps: {
        placeholder: '请输入用户简称',
      },
    },
    {
      field: 'lang',
      component: 'NInput',
      label: '语言偏好',
      componentProps: {
        placeholder: '请输入语言偏好',
      },
    },
    {
      field: 'timeRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'daterange',
        clearable: true,
        shortcuts: {
          '一周内': [Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()],
          '一个月内': [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
          '三个月内': [Date.now() - 90 * 24 * 60 * 60 * 1000, Date.now()],
        },
      },
    },
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 120,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(NSpace, { vertical: true, size: 'small' }, {
        default: () => [
          h(NButton, {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleEdit(record),
          }, { default: () => '编辑' }),
          h(NButton, {
            text: true,
            type: 'info',
            size: 'small',
            onClick: () => handleEditPwd(record),
          }, { default: () => '修改密码' }),
          h(NButton, {
            text: true,
            size: 'small',
            onClick: () => handleEditPayPwd(record),
          }, { default: () => '修改支付密码' }),
          h(NButton, {
            text: true,
            size: 'small',
            onClick: () => handleEditBank(record),
          }, { default: () => '修改提现方式' }),
          h(NButton, {
            text: true,
            type: 'success',
            size: 'small',
            onClick: () => handleRecharge(record),
          }, { default: () => '充值' }),
          h(NButton, {
            text: true,
            type: 'error',
            size: 'small',
            onClick: () => handleDeduct(record),
          }, { default: () => '扣款' }),
          h(NButton, {
            text: true,
            type: 'warning',
            size: 'small',
            onClick: () => handleSendCoupon(record),
          }, { default: () => '发优惠券' }),
        ]
      });
    },
  });

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 120,
    schemas,
  });

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params: any = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };

    // 处理时间范围
    if (params.timeRange && params.timeRange.length === 2) {
      params.sTime = Math.floor(params.timeRange[0] / 1000);
      params.eTime = Math.floor(params.timeRange[1] / 1000);
      delete params.timeRange;
    }

    try {
      const res: any = await getUserList(params);
      const responseData = res.data;

      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      };
    } catch (error) {
      message.error('获取用户列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 编辑用户信息
  function handleEdit(record: MemberListData) {
    currentUser.value = record;
    showEditModal.value = true;
  }

  // 修改登录密码
  function handleEditPwd(record: MemberListData) {
    currentUser.value = record;
    showPwdModal.value = true;
  }

  // 修改支付密码
  function handleEditPayPwd(record: MemberListData) {
    currentUser.value = record;
    showPayPwdModal.value = true;
  }

  // 修改提现方式
  function handleEditBank(record: MemberListData) {
    currentUser.value = record;
    showBankModal.value = true;
  }

  // 充值
  function handleRecharge(record: MemberListData) {
    currentUser.value = record;
    showRechargeModal.value = true;
  }

  // 扣款
  function handleDeduct(record: MemberListData) {
    currentUser.value = record;
    showDeductModal.value = true;
  }

  // 发送优惠券
  function handleSendCoupon(record: MemberListData) {
    currentUser.value = record;
    showCouponModal.value = true;
  }

  // 弹窗操作成功后的回调
  function handleModalSuccess() {
    reloadTable();
  }

  // 搜索
  function handleSubmit(values) {
    searchForm.value = values;
    reloadTable();
  }

  // 重置
  function handleReset() {
    searchForm.value = {};
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
