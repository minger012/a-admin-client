<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
     
    </BasicForm>
  </n-card>
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row:ProductListData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1200"
      :striped="true"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="addProduct">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增产品
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <!-- 编辑产品弹窗 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑产品" style="width: 700px;">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="140"
        class="py-4"
      >
        <n-form-item label="产品名称" path="name">
          <n-input placeholder="请输入产品名称" v-model:value="formParams.name" />
        </n-form-item>
        <n-form-item label="产品类型" path="type_name">
          <n-input placeholder="请输入产品类型" v-model:value="formParams.type_name" />
        </n-form-item>
        <n-form-item label="公司" path="company">
          <n-input placeholder="请输入公司名称" v-model:value="formParams.company" />
        </n-form-item>
        <n-form-item label="简介" path="intro">
          <n-input
            type="textarea"
            placeholder="请输入产品简介"
            v-model:value="formParams.intro"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
        <n-form-item label="状态" path="state">
          <n-select
            v-model:value="formParams.state"
            :options="[
              { label: '未生效', value: 0 },
              { label: '生效', value: 1 },
              { label: '审核中', value: 2 },
              { label: '封禁', value: 3 },
            ]"
            placeholder="请选择状态"
          />
        </n-form-item>
        
        <n-form-item label="Logo" path="logo">
          <n-upload
            :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
            :default-file-list="logoFileList"
            list-type="image-card"
            :max="1"
            :on-before-upload="(file) => handleBeforeUpload(file, 'logo')"
            name="image"
            :headers="{'Authorization': userStore.getToken}"
            @finish="(e) => handleUploadFinish(e, 'logo')"
            @error="handleUploadError"
            @remove="() => handleRemove('logo')"
          >
            上传Logo
          </n-upload>
        </n-form-item>
        
        <n-form-item label="产品图片" path="image">
          <n-upload
            :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
            :default-file-list="fileList"
            list-type="image-card"
            :max="1"
            :on-before-upload="(file) => handleBeforeUpload(file, 'image')"
            name="image"
            :headers="{'Authorization': userStore.getToken}"
            @finish="(e) => handleUploadFinish(e, 'image')"
            @error="handleUploadError"
            @remove="() => handleRemove('image')"
          >
            上传产品图片
          </n-upload>
        </n-form-item>
        
        <n-form-item label="Google Play 链接" path="google_play">
          <n-input placeholder="请输入" v-model:value="formParams.google_play" />
        </n-form-item>
        
        <n-form-item label="App Store 链接" path="app_store">
          <n-input placeholder="请输入" v-model:value="formParams.app_store" />
        </n-form-item>
        
        <n-form-item label="应用信息" path="app_info">
            <n-space vertical>
              <n-button type="primary" @click="addAppInfo">
                <template #icon>
                  <n-icon><PlusOutlined /></n-icon>
                </template>
                添加信息
              </n-button>
              <n-data-table
                size="small"
                :columns="appInfoColumns"
                :data="formParams.app_info || []"
                :pagination="false"
                :bordered="true"
              />
            </n-space>
        </n-form-item>
        
        <n-form-item label="排序" path="sort">
          <n-input-number
            v-model:value="formParams.sort"
            :min="0"
            placeholder="请输入排序"
          />
        </n-form-item>
        
        <!-- <n-form-item label="是否热门" path="is_hot">
          <n-switch v-model:value="formParams.is_hot" :checked-value="1" :unchecked-value="0" />
          <span class="text-[#666] ml-[10px]">是否设为热门产品</span>
        </n-form-item>
        
        <n-form-item label="是否首页显示" path="is_home">
          <n-switch v-model:value="formParams.is_home" :checked-value="1" :unchecked-value="0" />
          <span class="text-[#666] ml-[10px]">是否在首页显示</span>
        </n-form-item> -->
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
  import { columns, ProductListData, stateOptions } from './columns';
  import { goodsList, goodsAdd, goodsEdit, goodsDel } from '@/api/goods';
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
    name: '', // 中文名称
    company: '', // 公司名称
    type_name: '', // 产品类型
    category: '', // 分类
    intro: '', // 产品简介
    logo: '', // Logo
    image: '', // 产品图片
    google_play: '', // 谷歌商店链接
    app_store: '', // 苹果商店链接
    app_info: [], // 应用信息
    sort: 0, // 排序
    state: 1, // 状态
    is_hot: 0, // 是否热门
    is_home: 0 // 是否首页显示
  });

  // 产品图片文件列表
  const fileList = ref<UploadFileInfo[]>([]);
  // Logo图片文件列表
  const logoFileList = ref<UploadFileInfo[]>([]);
  
  // 应用信息表格列定义
  const appInfoColumns = [
    {
      title: '标题',
      key: 'title',
      render: (row, index) => {
        return h(NInput, {
          value: row.title,
          onUpdateValue: (v) => {
            if (!formParams.app_info) formParams.app_info = [];
            formParams.app_info[index].title = v;
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
            if (!formParams.app_info) formParams.app_info = [];
            formParams.app_info[index].content = v;
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
            onClick: () => removeAppInfo(index)
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
      message: '请输入产品名称',
    },
    company: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入公司名称',
    },
    type_name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入产品类型名称',
    },
    intro: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入产品简介',
    },
    logo: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请上传Logo',
    },
    image: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请上传产品图片',
    },
    state: {
      required: true,
      type:'number',
      trigger: ['blur', 'change'],
      message: '请选择状态',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'id',
      component: 'NInput',
      label: '产品ID',
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
    }
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

  const searchForm = ref({})

  const [register] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 新增产品
  function addProduct() {
    // 重置基础字段
    Object.assign(formParams, {
      id: 0,
      name: '',
      company: '',
      type_name: '',
      category: '',
      intro: '',
      logo: '',
      image: '',
      google_play: '',
      app_store: '',
      app_info: [],
      sort: 0,
      state: 1, // 默认生效
      is_hot: 0,
      is_home: 0
    });
    
    // 重置所有文件列表
    fileList.value = [];
    logoFileList.value = [];
    
    showEditModal.value = true;
  }

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params = {
      page: String(page),
      pageSize: String(pageSize),
      ...searchForm.value,
    };
    try {
      const res:any = await goodsList(params)
      const responseData = res.data;
      return {
        page: responseData.page,
        pageSize: responseData.page_size,
        pageCount: responseData.total_page,
        itemCount: responseData.total,
        list: responseData.list || [],
      }
    } catch (error) {
      message.error('获取产品列表失败');
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
  const handleBeforeUpload = (data: { file: UploadFileInfo }, type: 'image' | 'logo' = 'image') => {
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
  const handleUploadFinish = (options: any, type: 'image' | 'logo' = 'image') => {
    const { file, event } = options;
    
    try {
      const response = JSON.parse(event.target.response);
      if (response.code === 1) {
        // 更新文件状态和URL
        file.url = response.data.url;
        formParams[type] = response.data.url;
        message.success('上传成功');
      } else {
        message.error('上传失败: ' + response.msg || '未知错误');
        // 删除上传失败的文件
        const fileListRef = type === 'image' ? fileList : logoFileList;
        const index = fileListRef.value.findIndex(f => f.id === file.id);
        if (index !== -1) {
          fileListRef.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('上传响应解析错误:', error);
      message.error('上传失败');
      // 删除上传失败的文件
      const fileListRef = type === 'image' ? fileList : logoFileList;
      const index = fileListRef.value.findIndex(f => f.id === file.id);
      if (index !== -1) {
        fileListRef.value.splice(index, 1);
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
  const handleRemove = (type: 'image' | 'logo' = 'image') => {
    formParams[type] = '';
    if (type === 'image') {
      fileList.value = [];
    } else {
      logoFileList.value = [];
    }
  };

  // 添加应用信息
  const addAppInfo = () => {
    if (!formParams.app_info) formParams.app_info = [];
    formParams.app_info.push({ title: '', content: '' });
  };
  
  // 删除应用信息
  const removeAppInfo = (index) => {
    formParams.app_info.splice(index, 1);
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
          company: formParams.company,
          type_name: formParams.type_name,
          category: formParams.category,
          intro: formParams.intro,
          logo: formParams.logo,
          image: formParams.image,
          google_play: formParams.google_play,
          app_store: formParams.app_store,
          app_info: JSON.stringify(formParams.app_info || []),
          sort: formParams.sort,
          state: formParams.state,
          is_hot: formParams.is_hot,
          is_home: formParams.is_home
        };
        
        // 发送请求
        if (formParams.id) {
          // 编辑
          const res:any = await goodsEdit(submitData);
          if (res.code === 1) {
            message.success('修改成功');
            showEditModal.value = false;
            reloadTable();
          } else {
            message.error(res.msg || '修改失败');
          }
        } else {
          // 新增
          const res:any = await goodsAdd(submitData);
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

  // 编辑产品
  function handleEdit(record: Recordable) {
    // 重置表单
    Object.assign(formParams, {
      id: record.id,
      name: record.name,
      company: record.company || '',
      type_name: record.type_name || '',
      category: record.category || '',
      intro: record.intro || '',
      logo: record.logo || '',
      image: record.image || '',
      google_play: record.google_play || '',
      app_store: record.app_store || '',
      app_info: record.app_info || [],
      sort: record.sort || 0,
      state: record.state !== undefined ? record.state : 1,
      is_hot: record.is_hot || 0,
      is_home: record.is_home || 0
    });
    
    // 设置产品图片
    fileList.value = record.image ? [{
      id: '1',
      name: '产品图片',
      status: 'finished',
      url: record.image
    }] : [];
    
    // 设置Logo图片
    logoFileList.value = record.logo ? [{
      id: '2',
      name: 'Logo',
      status: 'finished',
      url: record.logo
    }] : [];
    
    showEditModal.value = true;
  }

  // 删除产品
  function handleDelete(record: ProductListData) {
    message.info('正在删除...');
    goodsDel({ id: record.id }).then(() => {
      message.success('删除成功');
      reloadTable();
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
