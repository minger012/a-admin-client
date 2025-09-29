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
      :row-key="(row:PlanListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1200"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="addPlan">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增计划
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 编辑计划弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="formParams.id ? '编辑计划' : '新增计划'" style="width: 700px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-form-item label="计划名称" path="name">
          <n-input placeholder="请输入计划名称" v-model:value="formParams.name" />
        </n-form-item>
        <n-form-item label="产品" path="goods_id">
          <ProductSelector v-model:value="formParams.goods_id" placeholder="请选择产品" />
        </n-form-item>
        <n-form-item label="计划简介" path="intro">
          <n-input
            type="textarea"
            placeholder="请输入计划简介"
            v-model:value="formParams.intro"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
        
        <n-form-item label="主图" path="image">
          <n-upload
            :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
            :default-file-list="fileList"
            list-type="image-card"
            :max="1"
            :on-before-upload="handleBeforeUpload"
            name="image"
            :headers="{'Authorization': userStore.getToken}"
            @finish="handleUploadFinish"
            @error="handleUploadError"
            @remove="handleRemove"
          >
            上传主图
          </n-upload>
        </n-form-item>
        
        <n-form-item label="投放内容" path="content">
          <n-card>
            <n-space vertical>
              <n-button type="primary" @click="addContent">
                <template #icon>
                  <n-icon><PlusOutlined /></n-icon>
                </template>
                添加内容
              </n-button>
              <n-data-table
                :columns="contentColumns"
                :data="formParams.content || []"
                :pagination="false"
                :bordered="true"
              />
            </n-space>
          </n-card>
        </n-form-item>
        
        <n-form-item label="用户定向规则" path="orienteering">
          <n-card>
            <n-space vertical>
              <n-button type="primary" @click="addOrienteering">
                <template #icon>
                  <n-icon><PlusOutlined /></n-icon>
                </template>
                添加规则
              </n-button>
              <n-data-table
                :columns="orienteeringColumns"
                :data="formParams.orienteering || []"
                :pagination="false"
                :bordered="true"
              />
            </n-space>
          </n-card>
        </n-form-item>
        
        <n-form-item label="投放规则" path="rule">
          <n-card>
            <n-space vertical>
              <n-button type="primary" @click="addRule">
                <template #icon>
                  <n-icon><PlusOutlined /></n-icon>
                </template>
                添加规则
              </n-button>
              <n-data-table
                :columns="ruleColumns"
                :data="formParams.rule || []"
                :pagination="false"
                :bordered="true"
              />
            </n-space>
          </n-card>
        </n-form-item>
        
        <n-form-item label="状态" path="state">
          <n-select
            v-model:value="formParams.state"
            :options="[
              { label: '暂停', value: 0 },
              { label: '激活', value: 1 },
            ]"
            placeholder="请选择状态"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)" :disabled="isUploading">取消</n-button>
          <n-button 
            type="info" 
            :loading="formBtnLoading" 
            :disabled="isUploading" 
            @click="confirmEditForm"
          >
            {{ isUploading ? '图片上传中...' : '确定' }}
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
  import ProductSelector from '@/components/ProductSelector/index.vue';
  import { columns, PlanListData, stateOptions } from './columns';
  import { planList, planAdd, planEdit, planDel } from '@/api/plan';
  import { getAppEnvConfig } from '@/utils/env';
  import { PlusOutlined, DeleteOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules, NButton, NInput, NIcon, useDialog } from 'naive-ui';
  import { useUser } from '@/store/modules/user';
  import type { UploadFileInfo } from 'naive-ui';
  const {
    VITE_GLOB_API_URL_PREFIX,
  } = getAppEnvConfig();

  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const userStore = useUser();
  const dialog = useDialog();
  
  // 编辑表单
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  
  // 文件上传状态
  const isUploading = ref(false);
  const formParams:any = reactive({
    id: 0,
    name: '',
    goods_id: null,
    intro: '',
    image: '',
    content: [],
    orienteering: [],
    rule: [],
    state: 0
  });

  // 图片文件列表
  const fileList = ref<UploadFileInfo[]>([]);
  
  // 内容表格列定义
  const contentColumns = [
    {
      title: '标题',
      key: 'title',
      render: (row, index) => {
        return h(NInput, {
          value: row.title,
          onUpdateValue: (v) => {
            if (!formParams.content) formParams.content = [];
            formParams.content[index].title = v;
          },
          placeholder: '请输入标题'
        });
      }
    },
    {
      title: '内容',
      key: 'content',
      render: (row, index) => {
        return h(NInput, {
          value: row.content,
          onUpdateValue: (v) => {
            if (!formParams.content) formParams.content = [];
            formParams.content[index].content = v;
          },
          placeholder: '请输入内容'
        });
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (row, index) => {
        return h('div', { class: 'flex space-x-2' },
          h(NButton, {
            text: true,
            type: 'error',
            onClick: () => removeContent(index)
          }, {
            icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) })
          })
        );
      }
    }
  ];
  
  // 用户定向规则表格列定义
  const orienteeringColumns = [
    {
      title: '标题',
      key: 'title',
      render: (row, index) => {
        return h(NInput, {
          value: row.title,
          onUpdateValue: (v) => {
            if (!formParams.orienteering) formParams.orienteering = [];
            formParams.orienteering[index].title = v;
          },
          placeholder: '请输入标题'
        });
      }
    },
    {
      title: '内容',
      key: 'content',
      render: (row, index) => {
        return h(NInput, {
          value: row.content,
          onUpdateValue: (v) => {
            if (!formParams.orienteering) formParams.orienteering = [];
            formParams.orienteering[index].content = v;
          },
          placeholder: '请输入内容'
        });
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (row, index) => {
        return h('div', { class: 'flex space-x-2' },
          h(NButton, {
            text: true,
            type: 'error',
            onClick: () => removeOrienteering(index)
          }, {
            icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) })
          })
        );
      }
    }
  ];
  
  // 投放规则表格列定义
  const ruleColumns = [
    {
      title: '标题',
      key: 'title',
      render: (row, index) => {
        return h(NInput, {
          value: row.title,
          onUpdateValue: (v) => {
            if (!formParams.rule) formParams.rule = [];
            formParams.rule[index].title = v;
          },
          placeholder: '请输入标题'
        });
      }
    },
    {
      title: '内容',
      key: 'content',
      render: (row, index) => {
        return h(NInput, {
          value: row.content,
          onUpdateValue: (v) => {
            if (!formParams.rule) formParams.rule = [];
            formParams.rule[index].content = v;
          },
          placeholder: '请输入内容'
        });
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (row, index) => {
        return h('div', { class: 'flex space-x-2' },
          h(NButton, {
            text: true,
            type: 'error',
            onClick: () => removeRule(index)
          }, {
            icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) })
          })
        );
      }
    }
  ];

  // 表单验证规则
  const rules: FormRules = {
    name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入计划名称',
    },
    goods_id: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入产品ID',
    },
    image: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请上传主图',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'id',
      component: 'NInput',
      label: '计划ID',
      componentProps: {
        placeholder: '',
      },
    },
    {
      field: 'state',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '请选择',
        options: stateOptions,
      },
      slot: 'statusSlot',
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
    width: 150,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '修改',
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

  interface SearchFormType {
    id?: string;
    state?: number | string;
    timeRange?: [number, number];
  }
  
  const searchForm = ref<SearchFormType>({})

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 新增计划
  function addPlan() {
    // 重置基础字段
    Object.assign(formParams, {
      id: 0,
      name: '',
      goods_id: null,
      intro: '',
      image: '',
      content: [],
      orienteering: [],
      rule: [],
      state: 0
    });
    
    // 重置文件列表
    fileList.value = [];
    
    showEditModal.value = true;
  }

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
      const res:any = await planList(params)
      const responseData = res.data;
      return {
        page: responseData.page,
        pageSize: responseData.page_size,
        pageCount: responseData.total_page,
        itemCount: responseData.total,
        list: responseData.list || [],
      }
    } catch (error) {
      message.error('获取计划列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
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

  // 处理文件上传前的验证
  const handleBeforeUpload = (data: { file: UploadFileInfo }) => {
    const { file } = data;
    if (!file.file) return false;
    
    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.file.type)) {
      message.error('只能上传jpg/png/gif格式的图片');
      return false;
    }
    
    // 验证文件大小（2MB）
    if (file.file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    // 设置上传状态为正在上传
    isUploading.value = true;
    return true;
  };

  // 处理上传完成
  const handleUploadFinish = (options: any) => {
    const { file, event } = options;
    
    try {
      const response = JSON.parse(event.target.response);
      if (response.code === 1) {
        // 更新文件状态和URL
        file.url = response.data.url;
        formParams.image = response.data.url;
        message.success('上传成功');
      } else {
        message.error('上传失败: ' + response.msg || '未知错误');
        // 删除上传失败的文件
        const index = fileList.value.findIndex(f => f.id === file.id);
        if (index !== -1) {
          fileList.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('上传响应解析错误:', error);
      message.error('上传失败');
      // 删除上传失败的文件
      const index = fileList.value.findIndex(f => f.id === file.id);
      if (index !== -1) {
        fileList.value.splice(index, 1);
      }
    } finally {
      // 无论成功还是失败，重置上传状态
      isUploading.value = false;
    }
  };
  
  // 处理上传错误
  const handleUploadError = () => {
    message.error('上传失败');
    isUploading.value = false;
  };
  
  // 处理删除
  const handleRemove = () => {
    formParams.image = '';
    fileList.value = [];
  };

  // 添加投放内容
  const addContent = () => {
    if (!formParams.content) formParams.content = [];
    formParams.content.push({ title: '', content: '' });
  };
  
  // 删除投放内容
  const removeContent = (index) => {
    formParams.content.splice(index, 1);
  };
  
  // 添加用户定向规则
  const addOrienteering = () => {
    if (!formParams.orienteering) formParams.orienteering = [];
    formParams.orienteering.push({ title: '', content: '' });
  };
  
  // 删除用户定向规则
  const removeOrienteering = (index) => {
    formParams.orienteering.splice(index, 1);
  };
  
  // 添加投放规则
  const addRule = () => {
    if (!formParams.rule) formParams.rule = [];
    formParams.rule.push({ title: '', content: '' });
  };
  
  // 删除投放规则
  const removeRule = (index) => {
    formParams.rule.splice(index, 1);
  };

  // 确认编辑表单
  async function confirmEditForm(e: MouseEvent) {
    e.preventDefault();
    formBtnLoading.value = true;
    
    setTimeout(async ()=>{
      try {
        // 表单验证
        await formRef.value?.validate();
        
        // 准备提交的数据
        const submitData = {
          id: formParams.id,
          name: formParams.name,
          goods_id: formParams.goods_id,
          intro: formParams.intro,
          image: formParams.image,
          content: JSON.stringify(formParams.content || []),
          orienteering: JSON.stringify(formParams.orienteering || []),
          rule: JSON.stringify(formParams.rule || []),
          state: formParams.state
        };
        
        // 发送请求
        if (formParams.id) {
          // 编辑
          const res:any = await planEdit(submitData);
          if (res.code === 1) {
            message.success('修改成功');
            showEditModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '修改失败');
          }
        } else {
          // 新增
          const res:any = await planAdd(submitData);
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

  // 编辑计划
  function handleEdit(record: Recordable) {
    let content = [];
    let orienteering = [];
    let rule = [];
    
    try {
      content = Array.isArray(record.content) ? record.content : 
               (typeof record.content === 'string' ? JSON.parse(record.content) : []);
    } catch (error) {
      console.error('解析content失败:', error);
    }
    
    try {
      orienteering = Array.isArray(record.orienteering) ? record.orienteering : 
                    (typeof record.orienteering === 'string' ? JSON.parse(record.orienteering) : []);
    } catch (error) {
      console.error('解析orienteering失败:', error);
    }
    
    try {
      rule = Array.isArray(record.rule) ? record.rule : 
            (typeof record.rule === 'string' ? JSON.parse(record.rule) : []);
    } catch (error) {
      console.error('解析rule失败:', error);
    }
    
    // 重置表单
    Object.assign(formParams, {
      id: record.id,
      name: record.name,
      goods_id: record.goods_id,
      intro: record.intro || '',
      image: record.image || '',
      content: content,
      orienteering: orienteering,
      rule: rule,
      state: record.state !== undefined ? record.state : 0
    });
    
    // 设置图片
    fileList.value = record.image ? [{
      id: '1',
      name: '主图',
      status: 'finished',
      url: record.image
    }] : [];
    
    showEditModal.value = true;
  }

  // 删除计划
  function handleDelete(record: PlanListData) {
    message.info('正在删除...');
    planDel(record.id).then((res:any) => {
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
