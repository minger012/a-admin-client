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
      :row-key="(row:CouponListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      v-model:checked-row-keys="checkedRowKeys"
      :scroll-x="2300"
      :striped="true"
    >
      <template #tableTitle>
        <n-space class="flex items-center">
          <n-button type="primary" @click="addCoupon">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增优惠券
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

    <!-- 编辑优惠券弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="formParams.id ? '编辑优惠券' : '新增优惠券'" style="width: 700px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-divider title-placement="left">基本信息</n-divider>
        <n-form-item label="优惠券名称" path="name">
          <n-input placeholder="请输入优惠券名称" v-model:value="formParams.name" maxlength="50" show-count />
        </n-form-item>
        <n-form-item label="优惠券描述" path="intro">
          <n-input
            type="textarea"
            placeholder="请输入优惠券的描述信息"
            v-model:value="formParams.intro"
            :autosize="{ minRows: 3, maxRows: 5 }"
            maxlength="200"
            show-count
          />
        </n-form-item>
        <n-form-item label="是否新人券" path="is_new">
          <n-radio-group v-model:value="formParams.is_new">
            <n-space>
              <n-radio :value="0">否</n-radio>
              <n-radio :value="1">是</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <div class="border-t-[2px] rounded-[10px]" :style="{borderColor: typeColorMap[formParams.type]}">
          <div class="text-sm font-bold p-4">优惠信息</div>
          <n-grid :cols="2" :x-gap="12">
            <n-form-item-gi label="优惠券类型" path="type">
              <n-select 
                v-model:value="formParams.type" 
                :options="typeOptions" 
                placeholder="请选择优惠券类型"
                @update:value="handleTypeChange"
                :render-label="renderLabel"
              >
              </n-select>
            </n-form-item-gi>
            
            <!-- 增值券、抵扣券、团队券：下拉选择 -->
            <n-form-item-gi v-if="[1, 2, 3].includes(formParams.type)" path="discount">
              <template #label>
                折扣百分比
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
                  </template>
                  增值券为正值，抵扣券和团队券为负值
                </n-tooltip>
              </template>
              <n-select
                v-model:value="formParams.discount"
                :options="discountOptions"
                placeholder="请选择折扣百分比"
                style="width: 100%"
              />
            </n-form-item-gi>

            <!-- 自定义：自定义输入百分比 -->
            <n-form-item-gi v-if="formParams.type === 4" path="discount">
              <template #label>
                折扣百分比
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
                  </template>
                  请输入折扣百分比，正数为增值，负数为抵扣
                </n-tooltip>
              </template>
              <n-input-number
                v-model:value="formParams.discount"
                :min="-100"
                :max="100"
                :precision="0"
                placeholder="请输入折扣百分比"
                style="width: 100%"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item-gi>

            <!-- 固定金额：输入折扣金额 -->
            <n-form-item-gi v-if="formParams.type === 5" label="折扣金额" path="discount_amount">
              <n-input-number
                v-model:value="formParams.discount_amount"
                :min="0"
                :precision="2"
                placeholder="请输入折扣金额"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item-gi>
            
            <n-form-item-gi path="min">
              <template #label>
                使用最低金额
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
                  </template>
                  优惠券使用的最低金额要求，0表示无限制
                </n-tooltip>
              </template>
              <n-input-number
                v-model:value="formParams.min"
                :min="0"
                :precision="2"
                placeholder="0表示无限制"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item-gi>
            
            <n-form-item-gi path="max">
              <template #label>
                使用最高金额
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
                  </template>
                  优惠券使用的最高金额限制，0表示无限制
                </n-tooltip>
              </template>
              <n-input-number
                v-model:value="formParams.max"
                :min="0"
                :precision="2"
                placeholder="0表示无限制"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item-gi>
          </n-grid>
        </div>

        <n-divider title-placement="left">有效期设置</n-divider>
        <n-form-item label="有效期类型" path="expir_type">
          <n-radio-group v-model:value="formParams.expir_type">
            <n-space>
              <n-radio :value="2">有效期范围</n-radio>
              <n-radio :value="1">有效天数</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 时间段模式 -->
        <n-form-item v-if="formParams.expir_type === 2" path="timeRange">
          <template #label>
            有效期范围
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
              </template>
              只有在此时间段内，优惠券才能被用户使用，否则无法使用
            </n-tooltip>
          </template>
          <n-date-picker
            v-model:value="timeRange"
            type="datetimerange"
            clearable
            style="width: 100%"
          />
        </n-form-item>

        <!-- 天数模式 -->
        <n-form-item v-if="formParams.expir_type === 1" path="expir_day">
          <template #label>
            有效天数
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon size="14" style="margin-left: 4px; cursor: help;" :component="QuestionCircleOutlined" />
              </template>
              普通优惠券默认有效期为90天
            </n-tooltip>
          </template>
          <n-input-number
            v-model:value="formParams.expir_day"
            :min="1"
            :max="3650"
            :precision="0"
            placeholder="请输入有效天数"
            style="width: 100%"
          >
            <template #suffix>天</template>
          </n-input-number>
          
        </n-form-item>
        <div class="text-[#999] text-[12px] pl-[120px] pb-[20px] mt-[-10px]" v-if="formParams.expir_type === 1">
          注意：此为用户收到优惠券后的有效期，从优惠券发放给用户的那一刻开始计算 (普通优惠券默认90天)
        </div>
        <n-form-item label="优惠券状态" path="state">
          <n-radio-group v-model:value="formParams.state">
            <n-space>
              <n-radio :value="1">启用</n-radio>
              <n-radio :value="2">停用</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button 
            type="info" 
            :loading="formBtnLoading" 
            @click="confirmEditForm"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, computed } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, CouponListData, stateOptions, typeOptions } from './columns';
  import { couponList, couponAdd, couponEdit, couponDel } from '@/api/coupon';
  import { PlusOutlined, QuestionCircleOutlined, DownloadOutlined } from '@vicons/antd';
  import { useMessage, useDialog } from 'naive-ui';
  import { type FormRules } from 'naive-ui';
  import * as XLSX from 'xlsx';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const formRef = ref();
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const checkedRowKeys = ref<Array<number>>([]);

  interface SearchFormType {
    id?: string | number;
    state?: number | string;
  }
  
  const searchForm = ref<SearchFormType>({});

  // 时间范围
  const timeRange = ref<[number, number] | null>(null);

  // 表单参数
  const formParams = reactive({
    id: 0,
    name: '',
    type: 1,
    intro: '',
    is_new: 0,
    discount: null,
    discount_amount: null,
    min: 0,
    max: 0,
    expir_type: 2, // 1:天数 2:时间段
    expir_day: 90,
    start_time: 0,
    end_time: 0,
    state: 1,
  });

  // 表单验证规则
  const rules: FormRules = {
    name: {
      required: true,
      message: '请输入优惠券名称',
      trigger: ['blur', 'input'],
    },
    type: {
      required: true,
      type: 'number',
      message: '请选择优惠券类型',
      trigger: ['blur', 'change'],
    },
    discount: {
      required: true,
      type: 'number',
      message: '请输入折扣百分比',
      trigger: ['blur', 'change'],
    },
    timeRange: {
      required: true,
      type: 'array',
      message: '请选择有效期',
      trigger: ['blur', 'change'],
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'id',
      component: 'NInput',
      label: 'ID',
      componentProps: {
        placeholder: '请输入优惠券ID',
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
      slot: 'statusSlot',
    },
  ];

  // 根据优惠券类型计算折扣选项
  const discountOptions = computed(() => {
    switch (formParams.type) {
      case 1: // 增值券
        return [
          { label: '+5%', value: 5 },
          { label: '+10%', value: 10 },
          { label: '+15%', value: 15 },
          { label: '+20%', value: 20 },
          { label: '+30%', value: 30 },
        ];
      case 2: // 抵扣券
        return [
          { label: '-5%', value: -5 },
          { label: '-10%', value: -10 },
          { label: '-15%', value: -15 },
          { label: '-20%', value: -20 },
          { label: '-30%', value: -30 },
        ];
      case 3: // 团队券
        return [
          { label: '-10%', value: -10 },
          { label: '-20%', value: -20 },
          { label: '-30%', value: -30 },
          { label: '-40%', value: -40 },
          { label: '-50%', value: -50 },
          { label: '-60%', value: -60 },
        ];
      default:
        return [];
    }
  });

  // 类型切换时重置折扣值
  function handleTypeChange() {
    // 重置所有折扣相关字段
    formParams.discount = null;
    formParams.discount_amount = null;
  }

  // 表格操作列配置
  const actionColumn = reactive({
    width: 200,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            type:'primary',
            onClick: handleEdit.bind(null, record),
          },
          {
            label: '删除',
            type:'error',
            onClick: (e) => {
              e.stopPropagation();
              dialog.warning({
                title: '确定删除吗？',
                content: '删除后将无法恢复',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                  handleDelete(record);
                }
              });
            }
          },
        ],
      });
    },
  });

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params:any = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };
    
    try {
      const res:any = await couponList(params)
      const responseData = res.data;
      
      return {
        list: responseData.list || [],
        page: Number(responseData.page) || 1,
        pageCount: Number(responseData.total_page) || 0,
        pageSize: Number(responseData.page_size) || 10,
        itemCount: Number(responseData.total) || 0,
      }
    } catch (error) {
      message.error('获取优惠券列表失败');
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

  // 新增优惠券
  function addCoupon() {
    // 重置表单
    Object.assign(formParams, {
      id: 0,
      name: '',
      type: 1,
      intro: '',
      is_new: 0,
      discount: 0,
      discount_amount: 0,
      min: 0,
      max: 0,
      expir_type: 2,
      expir_day: 90,
      start_time: 0,
      end_time: 0,
      state: 1,
    });
    timeRange.value = null;
    showEditModal.value = true;
  }

  // 确认编辑表单
  async function confirmEditForm() {
    formBtnLoading.value = true;
    
    setTimeout(async ()=>{
      try {
        // 表单验证
        await formRef.value?.validate();
        
        // 处理时间：只有在时间段模式才需要
        if (formParams.expir_type === 2 && timeRange.value && timeRange.value.length === 2) {
          formParams.start_time = Math.floor(timeRange.value[0] / 1000);
          formParams.end_time = Math.floor(timeRange.value[1] / 1000);
        }
        
        // 准备提交的数据
        const submitData: any = {
          id: formParams.id,
          name: formParams.name,
          type: formParams.type,
          intro: formParams.intro,
          is_new: formParams.is_new,
          min: formParams.min,
          max: formParams.max,
          expir_type: formParams.expir_type,
          state: formParams.state,
        };
        
        // 根据有效期类型添加对应字段
        if (formParams.expir_type === 1) {
          // 天数模式
          submitData.expir_day = formParams.expir_day;
        } else {
          // 时间段模式
          submitData.start_time = formParams.start_time;
          submitData.end_time = formParams.end_time;
        }
        
        // 根据类型添加折扣字段
        if (formParams.type === 5) {
          // 固定金额
          submitData.discount_amount = formParams.discount_amount;
        } else {
          // 其他类型都使用折扣百分比
          submitData.discount = formParams.discount;
        }
        
        // 发送请求
        if (formParams.id) {
          // 编辑
          const res:any = await couponEdit(submitData);
          if (res.code === 1) {
            message.success('修改成功');
            showEditModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '修改失败');
          }
        } else {
          // 新增
          const res:any = await couponAdd(submitData);
          if (res.code === 1) {
            message.success('添加成功');
            showEditModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '添加失败');
          }
        }
      } catch (error) {
        console.error('表单提交错误:', error);
        message.error('表单验证失败，请检查输入');
      } finally {
        formBtnLoading.value = false;
      }
    }, 0);
  }

  // 优惠券类型颜色映射
  const typeColorMap = {
    1: '#4caf50', // 绿色 - 增值券
    2: '#2196f3', // 蓝色 - 抵扣券
    3: '#9c27b0', // 紫色 - 团队券
    4: '#ff9800', // 橙色 - 自定义
    5: '#f44336', // 红色 - 固定金额
  };

  function renderLabel(option: any) {
    const color = typeColorMap[option.value as number] || '#999';
    
    return h(
      "div",
      {
        style: {
          display: 'flex',
          alignItems: 'center',
        }
      },
      [
        h(
          "span",
          {
            style: {
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
              marginRight: '8px',
            }
          }
        ),
        h(
          "span",
          {
            style: {
              padding: '2px 4px',
              borderRadius: '4px',
            }
          },
          option.label as string
        )
      ]
    );
  }
  // 编辑优惠券
  function handleEdit(record: CouponListData) {
    Object.assign(formParams, {
      id: record.id,
      name: record.name,
      type: record.type,
      intro: record.intro || '',
      is_new: record.is_new,
      discount: record.discount,
      discount_amount: record.discount_amount || 0,
      min: record.min,
      max: record.max,
      expir_type: record.expir_type || 2,
      expir_day: record.expir_day || 90,
      start_time: record.start_time,
      end_time: record.end_time,
      state: record.state,
    });
    
    // 设置时间范围（只在时间段模式下）
    if (formParams.expir_type === 2 && record.start_time && record.end_time) {
      timeRange.value = [record.start_time * 1000, record.end_time * 1000];
    } else {
      timeRange.value = null;
    }
    
    showEditModal.value = true;
  }

  // 删除优惠券
  function handleDelete(record: CouponListData) {
    message.info('正在删除...');
    couponDel(record.id).then((res:any) => {
      if (res.code === 1) {
        message.success('删除成功');
        reloadTable();
      } else {
        message.error(res.msg || '删除失败');
      }
    });
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
    let exportData: CouponListData[] = [];
    
    if (checkedRowKeys.value.length > 0) {
      // 导出已选中的数据
      const tableData = actionRef.value.getDataSource();
      exportData = tableData.filter((item: CouponListData) => 
        checkedRowKeys.value.includes(item.id)
      );
    } else {
      // 导出全部数据，请求接口获取
      try {
        const params: any = {
          page: '1',
          pageSize: '999999',
          ...searchForm.value,
        };
        
        const res: any = await couponList(params);
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
  function exportToExcel(data: CouponListData[]) {
    const typeMap = { 1: '增值券', 2: '抵扣券', 3: '团队券', 4: '自定义', 5: '固定金额' };
    const isNewMap = { 0: '普通券', 1: '新人券' };
    const stateMap = { 1: '启用', 2: '停用' };
    
    const excelData = data.map(item => ({
      'ID': item.id,
      '优惠券名称': item.name,
      '是否新人券': isNewMap[item.is_new] || '-',
      '优惠券类型': typeMap[item.type] || '-',
      '折扣百分比': item.type != 5 ? item.discount + '%' : '-',
      '折扣金额': item.type == 5 ? '¥' + item.discount_amount : '-',
      '使用最低金额': item.min ? '¥' + item.min : '无限制',
      '使用最高金额': item.max ? '¥' + item.max : '无限制',
      '生效时间': item.expir_type == 2 ? item.start_time ? new Date(item.start_time * 1000).toLocaleString() : '-' : '-',
      '过期时间': item.expir_type == 2 ? item.end_time ? new Date(item.end_time * 1000).toLocaleString() : '-' : '-',
      '用户券有效天数': item.expir_type == 1 ? item.expir_day + '天' : '无限制',
      '状态': stateMap[item.state] || '-',
      '创建时间': item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-',
      '更新时间': item.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '优惠券列表');
    
    const fileName = `优惠券列表_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    message.success(`导出成功，共 ${data.length} 条数据`);
  }
</script>

<style lang="less" scoped></style>
