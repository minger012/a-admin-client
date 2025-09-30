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
      :scroll-x="1800"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="addCoupon">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增优惠券
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

        <n-divider title-placement="left">优惠信息</n-divider>
        <n-form-item label="优惠券类型" path="type">
          <n-select v-model:value="formParams.type" :options="typeOptions" placeholder="请选择优惠券类型" />
        </n-form-item>
        <n-form-item label="折扣百分比" path="discount">
          <n-input-number
            v-model:value="formParams.discount"
            :min="0"
            :max="100"
            :precision="0"
            placeholder="请输入折扣百分比"
            style="width: 100%"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="使用最低金额" path="min">
          <n-input-number
            v-model:value="formParams.min"
            :min="0"
            :precision="2"
            placeholder="0表示无限制"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="使用最高金额" path="max">
          <n-input-number
            v-model:value="formParams.max"
            :min="0"
            :precision="2"
            placeholder="0表示无限制"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>

        <n-divider title-placement="left">有效期设置</n-divider>
        <n-form-item label="优惠券有效期" path="timeRange">
          <n-date-picker
            v-model:value="timeRange"
            type="datetimerange"
            clearable
            style="width: 100%"
          />
        </n-form-item>
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
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { columns, CouponListData, stateOptions, typeOptions } from './columns';
  import { couponList, couponAdd, couponEdit, couponDel } from '@/api/coupon';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage, useDialog } from 'naive-ui';
  import { type FormRules } from 'naive-ui';

  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const formRef = ref();
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);

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
    discount: 0,
    min: 0,
    max: 0,
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
      min: 0,
      max: 0,
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
        
        // 处理时间
        if (timeRange.value && timeRange.value.length === 2) {
          formParams.start_time = Math.floor(timeRange.value[0] / 1000);
          formParams.end_time = Math.floor(timeRange.value[1] / 1000);
        }
        
        // 准备提交的数据
        const submitData = {
          id: formParams.id,
          name: formParams.name,
          type: formParams.type,
          intro: formParams.intro,
          is_new: formParams.is_new,
          discount: formParams.discount,
          min: formParams.min,
          max: formParams.max,
          start_time: formParams.start_time,
          end_time: formParams.end_time,
          state: formParams.state,
        };
        
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

  // 编辑优惠券
  function handleEdit(record: CouponListData) {
    Object.assign(formParams, {
      id: record.id,
      name: record.name,
      type: record.type,
      intro: record.intro || '',
      is_new: record.is_new,
      discount: record.discount,
      min: record.min,
      max: record.max,
      start_time: record.start_time,
      end_time: record.end_time,
      state: record.state,
    });
    
    // 设置时间范围
    if (record.start_time && record.end_time) {
      timeRange.value = [record.start_time * 1000, record.end_time * 1000];
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
</script>

<style lang="less" scoped></style>
