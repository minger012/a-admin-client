<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #statusSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          :options="[
            { label: '全部', value: '' },
            { label: '未审核', value: 0 },
            { label: '已通过', value: 1 },
            { label: '已拒绝', value: 2 },
          ]"
        />
      </template>
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:WithdrawalListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="2400"
      :striped="true"
    >
      <template #toolbar>
        <div class="text-right">充值总额：<NTag type="warning">{{ totalMoney }}</NTag></div>
      </template>
     
    </BasicTable>

    <!-- 新增提现弹窗 -->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新增提现">
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
        <n-form-item label="持卡人姓名" path="cardholderName">
          <n-input placeholder="请输入持卡人姓名" v-model:value="formParams.cardholderName" />
        </n-form-item>
        <n-form-item label="银行" path="bank">
          <n-input placeholder="请输入银行" v-model:value="formParams.bank" />
        </n-form-item>
        <n-form-item label="卡号" path="cardNumber">
          <n-input placeholder="请输入卡号" v-model:value="formParams.cardNumber" />
        </n-form-item>
        <n-form-item label="提现金额" path="withdrawalAmount">
          <n-input-number
            v-model:value="formParams.withdrawalAmount"
            :show-button="false"
            placeholder="请输入提现金额"
          />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select
            v-model:value="formParams.type"
            :options="[
              { label: '银行卡', value: '银行卡' },
              { label: '支付宝', value: '支付宝' },
              { label: '微信', value: '微信' },
            ]"
            placeholder="请选择类型"
          />
        </n-form-item>
        <n-form-item label="备注信息" path="remarkInfo">
          <n-input
            type="textarea"
            placeholder="请输入备注信息"
            v-model:value="formParams.remarkInfo"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showAddModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmAddForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showAuditModal" :show-icon="false" preset="dialog" title="提现审核">
      <n-form
        :model="auditParams"
        :rules="auditRules"
        ref="auditFormRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="用户名">
          <n-input v-model:value="auditParams.username" disabled />
        </n-form-item>
        <n-form-item label="提现金额">
          <n-input-number
            v-model:value="auditParams.withdrawalAmount"
            disabled
            :show-button="false"
          />
        </n-form-item>
        <n-form-item label="审核结果" path="state">
          <n-radio-group v-model:value="auditParams.state">
            <n-space>
              <n-radio value="1">通过</n-radio>
              <n-radio value="2">拒绝</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="系统备注" path="system_remarks">
          <n-input
            type="textarea"
            placeholder="请输入系统备注"
            v-model:value="auditParams.system_remarks"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showAuditModal = false)">取消</n-button>
          <n-button type="primary" :loading="auditBtnLoading" @click="confirmAudit">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    
    <!-- 编辑系统备注弹窗 -->
    <n-modal v-model:show="showSysRemarksModal" :show-icon="false" preset="dialog" title="编辑系统备注">
      <n-form
        :model="sysRemarksParams"
        ref="sysRemarksFormRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="用户名">
          <n-input v-model:value="sysRemarksParams.username" disabled />
        </n-form-item>
        <n-form-item label="系统备注" path="system_remarks">
          <n-input
            type="textarea"
            placeholder="请输入系统备注"
            v-model:value="sysRemarksParams.system_remarks"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showSysRemarksModal = false)">取消</n-button>
          <n-button type="info" :loading="sysRemarksBtnLoading" @click="confirmUpdateSysRemarks">确定</n-button>
        </n-space>
      </template>
    </n-modal>
<!-- 查看提现详情 -->
    <n-modal v-model:show="showViewModal" preset="card" style="width: 800px" title="提现详情">
      <n-descriptions bordered :column="2" class="py-4">
        <!-- 左侧信息 -->
        <n-descriptions-item label="用户名">
          {{ viewData.username }}
        </n-descriptions-item>
        <n-descriptions-item label="持卡人姓名">
          {{ viewData.name }}
        </n-descriptions-item>
        <n-descriptions-item label="银行">
          {{ viewData.bank || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="卡号">
          {{ viewData.card || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="类型">
          {{ viewData.type === 1 ? '人工' : viewData.type === 2 ? '会员' : '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="viewData.state === 1 ? 'success' : viewData.state === 2 ? 'error' : 'warning'">
            {{ viewData.state === 1 ? '已通过' : viewData.state === 2 ? '已拒绝' : '未审核' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="锁单状态">
          <n-tag :type="viewData.lock === 1 ? 'error' : 'success'">
            {{ viewData.lock === 1 ? '已锁定' : '未锁定' }}
          </n-tag>
        </n-descriptions-item>

        <!-- 右侧信息 -->
        <n-descriptions-item label="提现金额">
          {{ viewData.money ? viewData.money.toFixed(2) : '0.00' }}
        </n-descriptions-item>
        <n-descriptions-item label="提现前金额">
          {{ viewData.before_money ? viewData.before_money.toFixed(2) : '0.00' }}
        </n-descriptions-item>
        <n-descriptions-item label="提现后金额">
          {{ viewData.before_money && viewData.money ? (viewData.before_money - viewData.money).toFixed(2) : '0.00' }}
        </n-descriptions-item>
        <n-descriptions-item label="备注">
          {{ viewData.remarks || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="系统备注">
          {{ viewData.system_remarks || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="操作人">
          {{ viewData.admin_name || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="创建时间" :span="2">
          {{ viewData.create_time ? new Date(viewData.create_time * 1000).toLocaleString() : '无' }}
        </n-descriptions-item>
      </n-descriptions>
      <template #action>
        <n-space>
          <n-button @click="() => (showViewModal = false)">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, onMounted, onUnmounted } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, WithdrawalListData } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules, NButton, NPopconfirm } from 'naive-ui';
  import { 
    getWithdrawList, 
    deleteWithdraw, 
    lockWithdraw, 
    unlockWithdraw, 
    auditWithdraw, 
    withdrawAudit,
    updateWithdrawSystemRemarks 
  } from '@/api/member/withdraw';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const auditFormRef = ref();
  const sysRemarksFormRef = ref();
  
  // 定义搜索参数对象
  const searchParams = reactive({
    username: '',
    admin_name: '',
    type: '',
    state: '',
    timeRange: [] as Date[],
    mMoney: null as number | null,
    bMoney: null as number | null,
    page: 1,
    pageSize: 10
  });

  // 新增表单
  const showAddModal = ref(false);
  const formBtnLoading = ref(false);
  const formParams = reactive({
    username: '',
    cardholderName: '',
    bank: '',
    cardNumber: '',
    withdrawalAmount: 0,
    type: '',
    remarkInfo: '',
  });

  // 审核表单
  const showAuditModal = ref(false);
  const auditBtnLoading = ref(false);
  const auditParams = reactive({
    id: 0,
    username: '',
    withdrawalAmount: 0,
    state: 1,
    system_remarks: '',
  });

  // 编辑系统备注相关
  const showSysRemarksModal = ref(false);
  const sysRemarksBtnLoading = ref(false);
  const sysRemarksParams = reactive({
    id: 0,
    username: '',
    system_remarks: ''
  });

  // 查看详情相关
  const showViewModal = ref(false);
  const viewData = reactive({});
  
  // 注册系统备注编辑事件
  const handleEditSystemRemarks = (event) => {
    const record = event.detail;
    sysRemarksParams.id = record.id;
    sysRemarksParams.username = record.username;
    sysRemarksParams.system_remarks = record.system_remarks || '';
    showSysRemarksModal.value = true;
  };
  
  onMounted(() => {
    window.addEventListener('edit-system-remarks', handleEditSystemRemarks);
  });
  
  onUnmounted(() => {
    window.removeEventListener('edit-system-remarks', handleEditSystemRemarks);
  });

  // 表单验证规则
  const rules: FormRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    cardholderName: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入持卡人姓名',
    },
    bank: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入银行',
    },
    cardNumber: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入卡号',
    },
    withdrawalAmount: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入提现金额',
    },
    type: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择类型',
    },
  };

  const auditRules: FormRules = {
    state: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择审核结果',
    },
    system_remarks: {
      required: false,
      trigger: ['blur', 'input'],
      message: '请输入系统备注',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'admin_name',
      component: 'NInput',
      label: '操作人',
      componentProps: {
        placeholder: '请输入操作人',
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
      field: 'type',
      component: 'NSelect',
      label: '类型',
      componentProps: {
        placeholder: '请选择类型',
        options: [
          { label: '全部', value: '' },
          { label: '人工', value: 1 },
          { label: '会员', value: 2 },
        ],
        clearable: true,
      },
    },
    {
      field: 'timeRange',
      component: 'NDatePicker',
      label: '时间范围',
      componentProps: {
        type: 'daterange',
        clearable: true,
        format: 'yyyy-MM-dd',
      },
    },
    {
      field: 'mMoney',
      component: 'NInputNumber',
      label: '最小金额',
      componentProps: {
        placeholder: '请输入最小金额',
        clearable: true,
      },
    },
    {
      field: 'bMoney',
      component: 'NInputNumber',
      label: '最大金额',
      componentProps: {
        placeholder: '请输入最大金额',
        clearable: true,
      },
    },
    {
      field: 'state',
      component: 'NSelect',
      label: '状态',
      defaultValue: '',
      slot: 'statusSlot',
      componentProps: {
        placeholder: '请选择状态',
      },
    },
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 140,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      // 未审核状态
      if (record.state === 0) {
        return h(TableAction, {
          style: 'button',
          actions: [
            // {
            //   label: '查看',
            //   onClick: handleView.bind(null, record),
            // },
            {
              label: '审核',
              onClick: handleAudit.bind(null, record),
              type:"primary"
            },
            // {
            //   label: '锁定',
            //   onClick: handleLock.bind(null, record),
            //   style: record.lock === 1 ? 'display: none' : '',
            // },
            // {
            //   label: '解锁',
            //   onClick: handleUnlock.bind(null, record),
            //   style: record.lock === 0 ? 'display: none' : '',
            // },
            {
              label: '删除',
              onClick: handleDelete.bind(null, record),
              type:"error"
            },
          ],
        });
      } else {
        // 已审核状态，不可删除
        return h(TableAction, {
          style: 'button',
          actions: [
            {
              label: '查看',
              onClick: () => handleView(record),
            },
          ],
        });
      }
    },
  });

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 新增提现
  function addWithdrawal() {
    formParams.username = '';
    formParams.cardholderName = '';
    formParams.bank = '';
    formParams.cardNumber = '';
    formParams.withdrawalAmount = 0;
    formParams.type = '';
    formParams.remarkInfo = '';
    showAddModal.value = true;
  }
  const totalMoney = ref('')
  // 加载表格数据
  async function loadDataTable(res) {
    // 合并分页信息到搜索参数对象
    searchParams.page = res.page || 1;
    searchParams.pageSize = res.pageSize || 10;
    
    // 使用searchParams构造请求参数
    const params = {};
    
    // 页码和分页大小转为字符串
    params.page = String(searchParams.page);
    params.pageSize = String(searchParams.pageSize);
    
    // 用户名和操作人
    if (searchParams.username) {
      params.username = searchParams.username;
    }
    
    if (searchParams.admin_name) {
      params.admin_name = searchParams.admin_name;
    }
    
    // 类型
    if (searchParams.type !== '') {
      params.type = parseInt(searchParams.type);
    }
    
    // 处理时间范围
    if (searchParams.timeRange && searchParams.timeRange.length === 2) {
      // 确保timeRange元素是Date对象
      const startDate = searchParams.timeRange[0] instanceof Date ? searchParams.timeRange[0] : new Date(searchParams.timeRange[0]);
      const endDate = searchParams.timeRange[1] instanceof Date ? searchParams.timeRange[1] : new Date(searchParams.timeRange[1]);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        params.sTime = Math.floor(startDate.getTime() / 1000);
        params.eTime = Math.floor(endDate.getTime() / 1000);
      }
    }
    
    // 处理金额范围
    if (searchParams.mMoney !== null && searchParams.mMoney !== undefined) {
      params.mMoney = parseFloat(String(searchParams.mMoney));
    }
    
    if (searchParams.bMoney !== null && searchParams.bMoney !== undefined) {
      params.bMoney = parseFloat(String(searchParams.bMoney));
    }
    
    // 状态
    if (searchParams.state !== '') {
      params.state = searchParams.state;
    }

    try {
      // 获取提现列表数据
      const res = await getWithdrawList(params);
      if (res.code === 1) {
        totalMoney.value = res.data.money
        return {
          list: res.data.list || [],
          page: res.data.page,
          pageCount: res.data.total_page,
          pageSize: res.data.page_size,
          itemCount: res.data.total || 0,
        };
      } else {
        message.error(res.msg || '获取提现列表数据失败');
        return {
          list: [],
          page: 1,
          pageCount: 1,
          pageSize: 10,
          itemCount: 0,
        };
      }
    } catch (error) {
      console.error('获取提现列表数据失败:', error);
      message.error('获取提现列表数据失败');
      return {
        list: [],
        page: 1,
        pageCount: 1,
        pageSize: 10,
        itemCount: 0,
      };
    }
  }

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  // 确认新增表单
  function confirmAddForm() {
    formRef.value?.validate((errors) => {
      if (!errors) {
        formBtnLoading.value = true;
        setTimeout(() => {
          formBtnLoading.value = false;
          showAddModal.value = false;
          message.success('新增提现成功');
          reloadTable();
        }, 500);
      }
    });
  }

  // 确认审核
  async function confirmAudit() {
    // 直接提交处理，跳过表单验证
    auditBtnLoading.value = true;
    try {
      // 使用新的withdrawAudit API
      const res = await withdrawAudit({
        id: auditParams.id,
        state: Number(auditParams.state),
        system_remarks: auditParams.system_remarks
      });
      
      if (res.code === 1) {
        showAuditModal.value = false;
        message.success('审核操作成功');
        reloadTable();
      } else {
        message.error(res.msg || '审核操作失败');
      }
    } catch (error) {
      console.error('审核提现失败:', error);
      message.error('审核提现失败');
    } finally {
      auditBtnLoading.value = false;
    }
  }

  // 审核提现
  function handleAudit(record: WithdrawalListData) {
    auditParams.id = record.id;
    auditParams.username = record.username;
    auditParams.withdrawalAmount = record.money;
    auditParams.state = '1';
    auditParams.system_remarks = '';
    showAuditModal.value = true;
  }

  // 锁定提现
  async function handleLock(record: WithdrawalListData) {
    try {
      message.loading('锁定中...');
      const res = await lockWithdraw(record.id);
      
      if (res.code === 1) {
        message.success('锁定成功');
        reloadTable();
      } else {
        message.error(res.msg || '锁定失败');
      }
    } catch (error) {
      console.error('锁定提现失败:', error);
      message.error('锁定提现失败');
    }
  }

  // 解锁提现
  async function handleUnlock(record: WithdrawalListData) {
    try {
      message.loading('解锁中...');
      const res = await unlockWithdraw(record.id);
      
      if (res.code === 1) {
        message.success('解锁成功');
        reloadTable();
      } else {
        message.error(res.msg || '解锁失败');
      }
    } catch (error) {
      console.error('解锁提现失败:', error);
      message.error('解锁提现失败');
    }
  }

  // 查看提现详情
  function handleView(record: WithdrawalListData) {
    // 复制一份记录数据到viewData
    Object.assign(viewData, JSON.parse(JSON.stringify(record)));
    showViewModal.value = true;
  }

  // 删除提现记录
  async function handleDelete(record: WithdrawalListData) {
    try {
      const res = await deleteWithdraw(record.id);
      if (res.code === 1) {
        message.success('删除成功');
        reloadTable();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除提现记录失败:', error);
      message.error('删除提现记录失败');
    }
  }
  
  // 确认更新系统备注
  async function confirmUpdateSysRemarks() {
    sysRemarksBtnLoading.value = true;
    try {
      const res = await updateWithdrawSystemRemarks(
        sysRemarksParams.id,
        sysRemarksParams.system_remarks
      );
      
      if (res.code === 1) {
        showSysRemarksModal.value = false;
        message.success('系统备注更新成功');
        reloadTable(); // 重新加载表格数据
      } else {
        message.error(res.msg || '系统备注更新失败');
      }
    } catch (error) {
      console.error('更新系统备注失败:', error);
      message.error('更新系统备注失败');
    } finally {
      sysRemarksBtnLoading.value = false;
    }
  }

  // 搜索
  function handleSubmit(values) {
    // 将表单值同步到搜索参数对象
    Object.assign(searchParams, values);
    reloadTable();
  }

  // 重置
  function handleReset() {
    // 重置搜索参数
    searchParams.username = '';
    searchParams.admin_name = '';
    searchParams.type = '';
    searchParams.state = '';
    searchParams.timeRange = [];
    searchParams.mMoney = null;
    searchParams.bMoney = null;
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
