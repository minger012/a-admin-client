<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #statusSlot="{ model, field }">
        <n-select v-model:value="model[field]" :options="stateOptions" />
      </template>
    </BasicForm>

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:CodeListData) => row.id"
      ref="actionRef"
      :scroll-x="1200"
      :striped="true"
      v-model:checked-row-keys="checkedRowKeys"
    >
      <template #tableTitle>
        <n-space class="flex items-center">
          <n-button type="primary" @click="addCode">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增授权码
          </n-button>
          <n-button @click="handleExport">
            <template #icon>
              <n-icon>
                <DownloadOutlined />
              </n-icon>
            </template>
            导出
          </n-button>
          <span class="text-gray-500" v-if="checkedRowKeys.length > 0">
            已选 {{ checkedRowKeys.length }} 项
          </span>
          <n-button v-if="checkedRowKeys.length > 0" text type="primary" @click="handleClearSelection">
            清除
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 新增授权码弹窗 -->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新增授权码" style="width: 500px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-form-item label="授权码" path="code">
          <n-input placeholder="自动生成的授权码" v-model:value="formParams.code" disabled />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showAddModal = false)">取消</n-button>
          <n-button 
            type="info" 
            :loading="formBtnLoading" 
            @click="confirmAddForm"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, CodeListData, stateOptions } from './columns';
  import { codeList, codeAdd } from '@/api/code';
  import { PlusOutlined, DownloadOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules } from 'naive-ui';
  import * as XLSX from 'xlsx';

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const showAddModal = ref(false);
  const formBtnLoading = ref(false);
  const checkedRowKeys = ref<Array<number>>([]);
  interface SearchFormType {
    state?: number | string;
    username?: string;
    timeRange?: [number, number];
  }
  
  const searchForm = ref<SearchFormType>({});

  // 表单参数
  const formParams = reactive({
    code: '',
  });

  // 表单验证规则
  const rules: FormRules = {
    code: {
      required: true,
      message: '请生成授权码',
      trigger: ['blur', 'input'],
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'state',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: stateOptions,
        clearable: true,
      },
      slot: 'statusSlot',
    },
    {
      field: 'username',
      component: 'NInput',
      label: '所属管理者',
      componentProps: {
        placeholder: '请输入所属管理者',
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

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 100,
    schemas,
  });
  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params:any = {
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
      const res:any = await codeList(params)
      const responseData = res.data;
      
      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      }
    } catch (error) {
      message.error('获取授权码列表失败');
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

  // 生成8位随机数字授权码
  function generateRandomCode() {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  // 新增授权码
  function addCode() {
    // 重置表单
    formParams.code = generateRandomCode();
    showAddModal.value = true;
  }

  // 确认添加授权码
  async function confirmAddForm(e: MouseEvent) {
    e.preventDefault();
    formBtnLoading.value = true;
    
    try {
      // 表单验证
      await formRef.value?.validate();
      
      // 发送请求
      const res:any = await codeAdd({ code: formParams.code });
      if (res.code === 1) {
        message.success('添加成功');
        showAddModal.value = false;
        reloadTable();
      } else {
        message.error(res.msg || '添加失败');
      }
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error('表单验证失败，请检查输入');
    } finally {
      formBtnLoading.value = false;
    }
  }

  // 搜索
  function handleSubmit(values) {
    searchForm.value = values;
    reloadTable();
  }

  // 重置
  function handleReset() {
    reloadTable();
  }

  // 清除选中
  function handleClearSelection() {
    checkedRowKeys.value = [];
  }

  // 导出到Excel
  async function handleExport() {
    let exportData: CodeListData[] = [];
    
    if (checkedRowKeys.value.length > 0) {
      // 导出已选中的数据
      const tableData = actionRef.value.getDataSource();
      exportData = tableData.filter((item: CodeListData) => 
        checkedRowKeys.value.includes(item.id)
      );
    } else {
      // 导出全部数据，请求接口获取
      try {
        const params: any = {
          page: '1',
          pageSize: '999999', // 最大值
          ...searchForm.value,
        };
        
        // 处理时间范围
        if (params.timeRange && params.timeRange.length === 2) {
          params.sTime = Math.floor(params.timeRange[0] / 1000);
          params.eTime = Math.floor(params.timeRange[1] / 1000);
          delete params.timeRange;
        }
        
        const res: any = await codeList(params);
        exportData = res.data.list || [];
      } catch (error) {
        message.error('获取数据失败');
        return;
      }
    }
    
    if (exportData.length === 0) {
      message.warning('没有数据可导出');
      return;
    }
    
    exportToExcel(exportData);
  }

  // 导出Excel文件
  function exportToExcel(data: CodeListData[]) {
    // 处理数据
    const excelData = data.map(item => ({
      'ID': item.id,
      '授权码': item.code,
      '状态': item.state === 0 ? '未使用' : '已使用',
      '所属管理者': item.username || '-',
      '更新时间': item.update_time ? new Date(item.update_time * 1000).toLocaleString() : '',
      '创建时间': item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '',
    }));
    
    // 创建worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 创建workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '授权码列表');
    
    // 生成文件名（带时间戳）
    const fileName = `授权码列表_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    
    // 导出文件
    XLSX.writeFile(workbook, fileName);
    
    message.success(`导出成功，共 ${data.length} 条数据`);
  }
</script>

<style lang="less" scoped></style>
