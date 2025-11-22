<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:RealnameListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1800"
      :striped="true"
    >
    </BasicTable>

    <!-- 审核弹窗 -->
    <AuditModal
      v-model:visible="showAuditModal"
      :realname-data="currentRealname"
      @success="handleModalSuccess"
    />
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { createColumns, RealnameListData } from './columns';
  import { getRealnameList } from '@/api/system/realname';
  import { useMessage, NButton, NSpace } from 'naive-ui';
  import AuditModal from './components/AuditModal.vue';
  const message = useMessage();
  const actionRef = ref();
  const currentRealname = ref<any>(null);

  // 创建表格列
  const columns = createColumns();

  // 弹窗状态
  const showAuditModal = ref(false);

  interface SearchFormType {
    uid?: string | number;
    status?: number;
    verify_type?: number;
    real_name?: string;
    admin_username?: string;
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
      field: 'real_name',
      component: 'NInput',
      label: '真实姓名',
      componentProps: {
        placeholder: '请输入真实姓名',
      },
    },
    {
      field: 'status',
      component: 'NSelect',
      label: '审核状态',
      componentProps: {
        placeholder: '请选择审核状态',
        options: [
          { label: '全部', value: undefined },
          { label: '待审核', value: 0 },
          { label: '审核通过', value: 1 },
          { label: '审核拒绝', value: 2 },
        ],
      },
    },
    {
      field: 'verify_type',
      component: 'NSelect',
      label: '认证类型',
      componentProps: {
        placeholder: '请选择认证类型',
        options: [
          { label: '全部', value: undefined },
          { label: '护照', value: 1 },
          { label: '驾驶证', value: 2 },
          { label: '社会安全号', value: 3 },
          { label: '身份证', value: 4 },
        ],
      },
    },
    {
      field: 'admin_username',
      component: 'NInput',
      label: '审核管理员',
      componentProps: {
        placeholder: '请输入管理员用户名',
      },
    },
    {
      field: 'timeRange',
      component: 'NDatePicker',
      label: '提交时间',
      componentProps: {
        type: 'daterange',
        clearable: true,
        shortcuts: {
          '今天': [new Date().setHours(0, 0, 0, 0), Date.now()],
          '一周内': [Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()],
          '一个月内': [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
          '三个月内': [Date.now() - 90 * 24 * 60 * 60 * 1000, Date.now()],
        },
      },
    },
  ];

  // 表格操作列配置
  const actionColumn = reactive({
    width: 100,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(NSpace, { vertical: true, size: 'small' }, {
        default: () => [
          // 只有待审核状态才显示审核按钮
          record.status === 0 ? h(NButton, {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleAudit(record),
          }, { default: () => '审核' }) : null,
        ].filter(Boolean)
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
      const res: any = await getRealnameList(params);
      const responseData = res.data;

      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      };
    } catch (error) {
      message.error('获取实名认证列表失败');
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

  // 审核实名认证
  function handleAudit(record: RealnameListData) {
    currentRealname.value = record;
    showAuditModal.value = true;
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
