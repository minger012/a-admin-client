<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
    <div  id="planListTable">
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row:PlanOrderItem) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        :scroll-x="2600"
        :striped="false"
        :row-class-name="rowClassName"
        :render-expand-icon="renderExpandIcon"
      >
      </BasicTable>
    </div>

    <!-- 编辑弹窗 -->
    <EditModal
      v-model:show="showEditModal"
      :data="currentRecord"
      @success="reloadTable"
    />
  </n-card>
</template>

<script lang="ts" setup>
  import { h, onMounted,onBeforeUnmount, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, PlanOrderItem } from './columns';
  import { planOrderList, planOrderDel } from '@/api/plan';
  import { useMessage, NButton, NSpace, useDialog } from 'naive-ui';
  import EditModal from './EditModal.vue';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const showEditModal = ref(false);
  const currentRecord = ref<PlanOrderItem | null>(null);

  interface SearchFormType {
    uid?: string | number;
    short_name?: string;
    order_no?: string;
    fb_id?: string;
    state?: number | string;
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
      field: 'short_name',
      component: 'NInput',
      label: '用户简称',
      componentProps: {
        placeholder: '请输入用户简称',
      },
    },
    {
      field: 'order_no',
      component: 'NInput',
      label: '订单编号',
      componentProps: {
        placeholder: '请输入订单编号',
      },
    },
    {
      field: 'fb_id',
      component: 'NInput',
      label: '联单组ID',
      componentProps: {
        placeholder: '请输入联单组ID',
      },
    },
    {
      field: 'state',
      component: 'NSelect',
      label: '投放状态',
      componentProps: {
        placeholder: '请选择投放状态',
        options: [
          { label: '待投放', value: 0 },
          { label: '匹配中', value: 1 },
          { label: '投放中', value: 2 },
          { label: '投放失败', value: 3 },
          { label: '等待结算', value: 4 },
          { label: '结算成功', value: 5 },
        ],
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
    render(record: PlanOrderItem) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleEdit(record),
          }, { default: () => '编辑' }),
          // 只有待投放状态才显示删除按钮
          record.state == 0 ? h(NButton, {
            text: true,
            type: 'error',
            size: 'small',
            onClick: () => handleDelete(record),
          }, { default: () => '删除' }) : null,
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
      const res: any = await planOrderList(params);
      
      if (res.code === 1) {
        // 转换数据结构：拍平items数组
        const tableData: PlanOrderItem[] = [];
        
        res.data.list.forEach((group: any) => {
          group.items.forEach((item: any, index: number) => {
            tableData.push({
              ...item,
              group_count: group.count,
              item_index: index + 1,
              is_group_first: index === 0,
            });
          });
        });

        return {
          list: tableData,
          page: res.data.page,
          pageCount: res.data.total_page,
          pageSize: res.data.page_size,
          itemCount: res.data.total,
        };
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
      console.log(error)
      message.error('获取用户计划列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
  }

  // 行样式设置（使用rowProps而不rowClassName）
  function rowClassName(row: PlanOrderItem) {
    return row.is_group_first ? 'tr-group-first' : 'tr-group-normal';
  }

  // 自定义展开图标
  function renderExpandIcon({ expanded }: { expanded: boolean }) {
    return h('span', { 
      class: 'expand-icon',
    }, expanded ? '−' : '+');
  }



  function reloadTable() {
    actionRef.value.reload();
  }

  // 编辑
  function handleEdit(record: PlanOrderItem) {
    currentRecord.value = record;
    showEditModal.value = true;
  }

  // 删除
  function handleDelete(record: PlanOrderItem) {
    dialog.warning({
      title: '确认删除',
      content: `确认要删除订单 ${record.order_no} 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const res: any = await planOrderDel(record.id);
          if (res.code === 1) {
            message.success('删除成功');
            reloadTable();
          } else {
            message.error(res.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  }

  // 搜索
  function handleSubmit(values) {
    searchForm.value = values;
    reloadTable();
  }

  // 重置
  function handleReset() {
    searchForm.value = {};
  }

  const initTableWidth = ()=>{
    const el:HTMLElement | null = document.getElementById('planListTable')
    if(el){
      el.style.setProperty('--plan-list-width', el.offsetWidth + 'px');
    }
  }
  onMounted(()=>{
    initTableWidth()
    window.addEventListener('resize', initTableWidth)
  })
  onBeforeUnmount(()=>{
    window.removeEventListener('resize', initTableWidth)
  })
</script>

<style lang="less" scoped>
.expanded-content {
  padding: 16px;
  background-color: #fafafa;
}

:deep(.n-data-table-tr) {
  transition: background-color 0.3s ease;
  &.tr-group-first {
    td{
      border-top:2px solid #2d8cf0;
      font-weight: bold;
      font-size: 14px;
    }
    td.td-bg{
      background-color: #e6f4ff !important;
    }
  }
  &.tr-group-normal {
    td{
      font-size: 14px;
    }
    td.td-bg{
      background-color: #f9f9f9;
    }
  }
  &.n-data-table-tr--expanded{
    td{
      background-color: #f9f9f9;
    }
  }

  .expand-icon {
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    min-width: 16px;
    height: 16px;
    border:1px solid #e7e7e7;
    transition: .3s;
    border-radius: 4px;
    font-weight: 400;
    &:hover{
      border-color:#2d8cf0;
      color:#2d8cf0;
    }
  }
}

</style>
