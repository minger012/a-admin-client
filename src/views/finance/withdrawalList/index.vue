<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:WithdrawalListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1800"
      :striped="true"
    >
      <template #tableTitle>
        <n-space class="flex items-center">
          <n-button @click="handleExport">
            <template #icon>
              <n-icon>
                <DownloadOutlined />
              </n-icon>
            </template>
            导出
          </n-button>
        </n-space>
      </template>
    </BasicTable>
  </n-card>

  <!-- 查看提现方式详情弹窗 -->
  <n-modal v-model:show="showMethodModal" preset="card" title="提现方式详情" style="width: 500px;">
    <n-descriptions bordered :column="1">
      <n-descriptions-item label="提现方式">
        {{ methodDetail.methods }}
      </n-descriptions-item>
      <n-descriptions-item label="币种">
        {{ methodDetail.currency }}
      </n-descriptions-item>
      <n-descriptions-item label="钱包地址">
        {{ methodDetail.address }}
      </n-descriptions-item>
    </n-descriptions>
  </n-modal>

  <!-- 编辑弹窗 -->
  <n-modal v-model:show="showEditModal" preset="dialog" title="编辑提现记录" style="width: 600px;">
    <n-form
      :model="editForm"
      :rules="editRules"
      ref="editFormRef"
      label-placement="left"
      :label-width="100"
      class="py-4"
    >
      <n-form-item label="后台备注" path="remarks">
        <n-input
          v-model:value="editForm.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入后台备注"
        />
      </n-form-item>
      <n-form-item label="用户端备注" path="user_remarks">
        <n-input
          v-model:value="editForm.user_remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入用户端备注"
        />
      </n-form-item>
      <n-form-item label="状态" path="state">
        <n-radio-group v-model:value="editForm.state" :disabled="editForm.originalState !== 0">
          <n-space>
            <n-radio :value="1">成功</n-radio>
            <n-radio :value="2">驳回</n-radio>
          </n-space>
        </n-radio-group>
        <div v-if="editForm.originalState !== 0" class="text-gray-500 text-sm mt-2">
          只有待审核状态才可以修改
        </div>
      </n-form-item>
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="showEditModal = false">取消</n-button>
        <n-button type="primary" :loading="editLoading" @click="handleConfirmEdit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, onMounted, onUnmounted } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, WithdrawalListData, stateOptions } from './columns';
  import { getWithdrawList, withdrawAudit } from '@/api/member/withdraw';
  import { DownloadOutlined } from '@vicons/antd';
  import { useMessage, type FormRules, NIcon } from 'naive-ui';
  import * as XLSX from 'xlsx';

  const message = useMessage();
  const actionRef = ref();
  const editFormRef = ref();

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
      field: 'admin_username',
      component: 'NInput',
      label: '管理员账号',
      componentProps: {
        placeholder: '请输入管理员账号',
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
      field: 'state',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: stateOptions,
      },
    },
    {
      field: 'dateRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'datetimerange',
        clearable: true,
        style: { width: '100%' },
      },
    },
  ];

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 100,
    schemas,
  });

  // 搜索表单数据
  const searchForm = ref({});

  // 查看提现方式详情
  const showMethodModal = ref(false);
  const methodDetail = reactive({
    methods: '',
    currency: '',
    address: ''
  });

  // 编辑表单
  const showEditModal = ref(false);
  const editLoading = ref(false);
  const editForm = reactive({
    id: 0,
    remarks: '',
    user_remarks: '',
    state: 1,
    originalState: 0 // 用于记录原始状态
  });

  const editRules: FormRules = {
    state: {
      required: true,
      type: 'number',
      message: '请选择状态',
      trigger: ['blur', 'change'],
    },
  };

  // 表格操作列
  const actionColumn = reactive({
    width: 100,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            type: 'primary',
            onClick: handleEdit.bind(null, record),
          },
        ],
      });
    },
  });

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params: any = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };

    // 处理日期范围
    if (params.dateRange && params.dateRange.length === 2) {
      params.sTime = Math.floor(params.dateRange[0] / 1000);
      params.eTime = Math.floor(params.dateRange[1] / 1000);
      delete params.dateRange;
    }

    try {
      const res: any = await getWithdrawList(params);
      const responseData = res.data;

      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      };
    } catch (error) {
      message.error('获取提现列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
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

  function reloadTable() {
    actionRef.value.reload();
  }

  // 查看提现方式详情
  function handleViewMethod(record: WithdrawalListData) {
    Object.assign(methodDetail, {
      methods: record.methods,
      currency: record.currency,
      address: record.address
    });
    showMethodModal.value = true;
  }

  // 编辑
  function handleEdit(record: WithdrawalListData) {
    Object.assign(editForm, {
      id: record.id,
      remarks: record.remarks || '',
      user_remarks: record.user_remarks || '',
      state: record.state === 0 ? 1 : record.state,
      originalState: record.state
    });
    showEditModal.value = true;
  }

  // 确认编辑
  async function handleConfirmEdit() {
    try {
      await editFormRef.value?.validate();
      editLoading.value = true;

      const params: any = {
        id: editForm.id,
        remarks: editForm.remarks,
        user_remarks: editForm.user_remarks,
      };

      // 只有原始状态为0时才传递state
      if (editForm.originalState === 0) {
        params.state = editForm.state;
      }

      const res: any = await withdrawAudit(params);

      if (res.code === 1) {
        message.success('编辑成功');
        showEditModal.value = false;
        reloadTable();
      } else {
        message.error(res.msg || '编辑失败');
      }
    } catch (error) {
      console.error('编辑提现记录失败:', error);
      if (error !== undefined) {
        message.error('表单验证失败');
      }
    } finally {
      editLoading.value = false;
    }
  }

  // 导出
  async function handleExport() {
    let exportData: WithdrawalListData[] = [];

    try {
      const params: any = {
        page: '1',
        pageSize: '999999',
        ...searchForm.value,
      };

      if (params.dateRange && params.dateRange.length === 2) {
        params.sTime = Math.floor(params.dateRange[0] / 1000);
        params.eTime = Math.floor(params.dateRange[1] / 1000);
        delete params.dateRange;
      }

      const res: any = await getWithdrawList(params);
      exportData = res.data.list || [];
    } catch (error) {
      message.error('获取数据失败');
      return;
    }

    if (exportData.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    exportToExcel(exportData);
  }

  // 导出Excel
  function exportToExcel(data: WithdrawalListData[]) {
    const stateMap = { 0: '待审核', 1: '成功', 2: '驳回' };

    const excelData = data.map(item => ({
      'ID': item.id,
      '用户ID': item.uid,
      '用户简称': item.username,
      'FB_ID': item.fb_id,
      '所属管理者': item.admin_username || '-',
      '提现方式': item.methods,
      '币种': item.currency,
      '钱包地址': item.address,
      '涉及金额': item.money.toFixed(2),
      '后台备注': item.remarks || '-',
      '用户端备注': item.user_remarks || '-',
      '状态': stateMap[item.state] || '-',
      '更新时间': item.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-',
      '创建时间': new Date(item.create_time * 1000).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '提现列表');

    const fileName = `提现列表_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    message.success(`导出成功，共 ${data.length} 条数据`);
  }

  // 监听查看提现方式事件
  const handleViewMethodEvent = (event: any) => {
    handleViewMethod(event.detail);
  };

  onMounted(() => {
    window.addEventListener('view-withdraw-method', handleViewMethodEvent);
  });

  onUnmounted(() => {
    window.removeEventListener('view-withdraw-method', handleViewMethodEvent);
  });
</script>

<style lang="less" scoped></style>