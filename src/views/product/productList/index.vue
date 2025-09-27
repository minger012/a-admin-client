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
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑产品">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <n-tabs v-model:value="activeTab" type="line" animated>
          <!-- 中文标签页 -->
          <n-tab-pane name="zh" tab="中文">
            <n-form-item label="产品名称" path="name">
              <n-input placeholder="请输入产品名称" v-model:value="formParams.name" />
            </n-form-item>
            <n-form-item label="产品名称缩写" path="a_name">
              <n-input placeholder="请输入产品名称缩写" v-model:value="formParams.a_name" />
            </n-form-item>
            <n-form-item label="描述" path="intro">
              <n-input
                type="textarea"
                placeholder="请输入描述"
                v-model:value="formParams.intro"
              />
            </n-form-item>
            <n-form-item label="图片" path="image">
              <n-upload
                :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
                :default-file-list="fileList"
                list-type="image-card"
                :max="1"
                :on-before-upload="handleBeforeUpload"
                name="image"
                :headers="{
                  'Authorization': userStore.getToken
                }"
                @finish="handleUploadFinish"
                @error="handleUploadError"
                @remove="handleRemove"
              >
                上传图片
              </n-upload>
            </n-form-item>
          </n-tab-pane>

          <!-- 其他语言标签页 -->
          <n-tab-pane v-for="lang in languageOptions" :key="lang.value" :name="lang.value" :tab="lang.label">
            <n-form-item :label="`产品名称 (${lang.label})`" :path="`i18n.${lang.value}.name`">
              <n-input :placeholder="`请输入${lang.label}产品名称`" v-model:value="formParams.i18n[lang.value].name" />
            </n-form-item>
            <n-form-item :label="`产品名称缩写 (${lang.label})`" :path="`i18n.${lang.value}.a_name`">
              <n-input :placeholder="`请输入${lang.label}产品名称缩写`" v-model:value="formParams.i18n[lang.value].a_name" />
            </n-form-item>
            <n-form-item :label="`描述 (${lang.label})`" :path="`i18n.${lang.value}.intro`">
              <n-input
                type="textarea"
                :placeholder="`请输入${lang.label}描述`"
                v-model:value="formParams.i18n[lang.value].intro"
              />
            </n-form-item>
            <n-form-item :label="`图片 (${lang.label})`" :path="`i18n.${lang.value}.image`">
              <n-upload
                :action="VITE_GLOB_API_URL_PREFIX+'/admin/file/uploadImage'"
                :default-file-list="i18nFileList[lang.value]"
                list-type="image-card"
                :max="1"
                :on-before-upload="handleBeforeUpload"
                name="image"
                :headers="{
                  'Authorization': userStore.getToken
                }"
                @finish="(options) => handleI18nUploadFinish(options, lang.value)"
                @error="handleUploadError"
                @remove="() => handleI18nRemove(lang.value)"
              >
                上传图片
              </n-upload>
            </n-form-item>
          </n-tab-pane>
        </n-tabs>
        <n-form-item label="每期时间" path="period_time">
          <n-input-number
            v-model:value="formParams.period_time"
            :min="1"
            :max="1000"
            placeholder="请输入每期时间"
          />
          <span class="text-[#666] ml-[10px]">秒</span>
        </n-form-item>
        <n-form-item label="封单时间" path="seal_time">
          <n-input-number
            v-model:value="formParams.seal_time"
            :min="0"
            :max="1000"
            placeholder="请输入封单时间"
          />
          <span class="text-[#666] ml-[10px]">秒</span>
        </n-form-item>
        <n-form-item label="排序" path="sort">
          <n-input-number
            v-model:value="formParams.sort"
            :min="0"
            :max="999"
            placeholder="请输入排序"
          />
        </n-form-item>
        <n-form-item label="中奖赔率" path="multiple">
          <n-input-number
            v-model:value="formParams.multiple"
            :min="0"
            :step="0.1"
            :precision="2"
            placeholder="请输入中奖赔率，默认1.5"
          />
        </n-form-item>

        <n-form-item label="热门产品" path="is_hot">
          <n-switch v-model:value="formParams.is_hot" :checked-value="1" :unchecked-value="0" />
          <span class="text-[#666] ml-[10px]">是否设为热门产品</span>
        </n-form-item>
        <n-form-item label="首页显示" path="is_home">
          <n-switch v-model:value="formParams.is_home" :checked-value="1" :unchecked-value="0" />
          <span class="text-[#666] ml-[10px]">是否在首页显示</span>
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
  import { columns, ProductListData } from './columns';
  import { goodsList, goodsAdd, goodsEdit, goodsDel } from '@/api/goods';
  import { getAppEnvConfig } from '@/utils/env';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { type FormRules, NButton, NTabs, NTabPane } from 'naive-ui';
  import { useUser } from '@/store/modules/user';
  import type { UploadFileInfo } from 'naive-ui';
  const {
    VITE_GLOB_API_URL_PREFIX,
  } = getAppEnvConfig();
  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const userStore = useUser();
  
  // 编辑表单
  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  // 文件上传状态
  const isUploading = ref(false);
  const formParams = reactive({
    id: 0,
    name: '', // 中文名称
    a_name: '', // 中文名称缩写
    intro: '', // 中文描述
    image: '', // 中文图片
    period_time: '',
    seal_time: '',
    sort: 0,
    multiple: 1.5, // 默认赔率1.5
    is_hot: 0,
    is_home: 0,
    i18n: {
      'en-us': { name: '', a_name: '', intro: '', image: '' },
      'es-es': { name: '', a_name: '', intro: '', image: '' },
      'ja-jp': { name: '', a_name: '', intro: '', image: '' },
      'th-th': { name: '', a_name: '', intro: '', image: '' }
    }
  });

  // 中文图片文件列表
  const fileList = ref<UploadFileInfo[]>([]);
  
  // 多语言图片文件列表 
  const i18nFileList = reactive({
    en: [] as UploadFileInfo[],
    es: [] as UploadFileInfo[],
    ja: [] as UploadFileInfo[],
    th: [] as UploadFileInfo[]
  });

  // 当前选中的语言标签
  const activeTab = ref('zh');
  
  // 语言选项
  const languageOptions = [
    { label: '英文', value: 'en-us' },
    { label: '西班牙语', value: 'es-es' },
    { label: '日语', value: 'ja-jp' },
    { label: '泰语', value: 'th-th' }
  ];

  // 表单验证规则
  const rules: FormRules = {
    name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入产品名称',
    },
    a_name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入产品名称缩写',
    },
    intro: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入描述',
    },
    period_time: {
      required: true,
      type:'number',
      trigger: ['blur', 'change'],
      message: '请输入每期时间',
    },
    seal_time: {
      required: true,
      type:'number',
      trigger: ['blur', 'change'],
      message: '请输入封单时间',
    },
    sort: {
      required: false,
      type:'number',
      trigger: ['blur', 'change'],
      message: '请输入排序',
    },
    image: {
      required: false,
      trigger: ['blur', 'change'],
      message: '请上传图片',
    },
    multiple: {
      required: false,
      type: 'number',
      trigger: ['blur', 'change'],
      message: '请输入中奖赔率',
    },
  };

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'NInput',
      label: '产品名称',
      componentProps: {
        placeholder: '请输入产品名称',
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
            popConfirm: {
              title: '确定删除吗？',
              confirm: handleDelete.bind(null, record),
            },
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

  // 新增产品
  function addProduct() {
    // 重置基础字段
    Object.assign(formParams, {
      id: 0,
      name: '',
      a_name: '',
      intro: '',
      period_time: '',
      seal_time: '',
      sort: 0,
      image: '',
      is_hot: 0,
      is_home: 0,
      multiple: 1.5, // 默认赔率
      // 初始化多语言数据
      i18n: {
        'en-us': { name: '', a_name: '', intro: '', image: '' },
        'es-es': { name: '', a_name: '', intro: '', image: '' },
        'ja-jp': { name: '', a_name: '', intro: '', image: '' },
        'th-th': { name: '', a_name: '', intro: '', image: '' }
      }
    });
    
    // 重置所有文件列表
    fileList.value = [];
    Object.keys(i18nFileList).forEach(lang => {
      i18nFileList[lang] = [];
    });
    
    // 默认选中中文选项卡
    activeTab.value = 'zh';
    showEditModal.value = true;
  }

  // 加载表格数据
  async function loadDataTable({ page, pageSize, ...rest }) {
    const params = {
      page: String(page),
      pageSize: String(pageSize),
      ...rest,
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

  // 处理上传完成 (中文)
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
  
  // 处理多语言上传完成
  const handleI18nUploadFinish = (options: any, lang: string) => {
    const { file, event } = options;
    
    try {
      const response = JSON.parse(event.target.response);
      if (response.code === 1) {
        // 更新文件状态和URL
        file.url = response.data.url;
        formParams.i18n[lang].image = response.data.url;
        message.success('上传成功');
      } else {
        message.error('上传失败: ' + response.msg || '未知错误');
        // 删除上传失败的文件
        const index = i18nFileList[lang].findIndex(f => f.id === file.id);
        if (index !== -1) {
          i18nFileList[lang].splice(index, 1);
        }
      }
    } catch (error) {
      console.error('上传响应解析错误:', error);
      message.error('上传失败');
      // 删除上传失败的文件
      const index = i18nFileList[lang].findIndex(f => f.id === file.id);
      if (index !== -1) {
        i18nFileList[lang].splice(index, 1);
      }
    } finally {
      // 无论成功还是失败，重置上传状态
      isUploading.value = false;
    }
  };

  // 处理文件移除 (中文)
  const handleRemove = () => {
    // 清空对应的value值
    formParams.image = '';
    return true;
  };

  // 处理多语言文件移除
  const handleI18nRemove = (lang: string) => {
    // 清空对应语言的图片值
    formParams.i18n[lang].image = '';
    return true;
  };

  // 处理上传错误
  const handleUploadError = () => {
    message.error('上传遇到网络错误');
    // 重置上传状态
    isUploading.value = false;
  };

  // 确认编辑/新增表单
  function confirmEditForm() {
    // 检查是否是表单验证错误
    const chineseFields = ['name', 'a_name', 'intro'];
    
    for (const field of chineseFields) {
      if (!formParams[field]) {
        activeTab.value = 'zh';
        break;
      }
    }
    
    setTimeout(async ()=>{
      try {
        // 表单验证
        await formRef.value?.validate();
        formBtnLoading.value = true;
        
        // 构建提交数据
        const payload = {
          id: formParams.id || undefined,
          // 保留中文作为主要字段
          name: formParams.name,
          a_name: formParams.a_name,
          intro: formParams.intro,
          image: formParams.image,
          period_time: formParams.period_time,
          seal_time: formParams.seal_time,
          sort: formParams.sort,
          multiple: formParams.multiple,
          is_hot: formParams.is_hot,
          is_home: formParams.is_home,
          // 其他语言放在i18n字段中
          i18n: formParams.i18n,
        };
        
        // 提交请求
        if (formParams.id) {
          const res:any = await goodsEdit(payload);
          if(res.code == 1){
            message.success('编辑成功');
            showEditModal.value = false;
            reloadTable();
          }else{
            message.error(res.msg || '编辑失败');
          }
        } else {
          const res2:any = await goodsAdd(payload);
          if(res2.code == 1){
            message.success('新增成功');
            showEditModal.value = false;
            reloadTable();
          }else{
            message.error(res2.msg || '新增失败');
          }
        }
      } finally {
        formBtnLoading.value = false;
      }
    })
  }

  // 编辑产品
  function handleEdit(record: ProductListData) {
    // 重置 formParams 中的基本字段
    Object.assign(formParams, {
      id: record.id,
      // 中文字段
      name: record.name || '',
      a_name: record.a_name || '',
      intro: record.intro || '',
      image: record.image || '',
      period_time: record.period_time > 0 ? Number(record.period_time) : 0,
      seal_time: record.seal_time && record.seal_time > 0 ? Number(record.seal_time) : 0,
      sort:  record.sort > 0 ? Number(record.sort) : 0,
      multiple: record.multiple ? Number(record.multiple) : 1.5, // 获取中奖赔率，如果为空则使用默认值1.5
      is_hot: record.is_hot,
      is_home: record.is_home,
    });
    
    // 处理多语言数据 - 确保即使 i18n 为空也能正常工作
    let i18nData = {};
    
    // 处理record.i18n是字符串的情况
    if (record.i18n && typeof record.i18n === 'string') {
      try {
        i18nData = JSON.parse(record.i18n);
      } catch (e) {
        console.error('解析i18n JSON失败:', e);
        i18nData = {};
      }
    } else if (record.i18n && typeof record.i18n === 'object') {
      i18nData = record.i18n;
    }
    
    // 初始化所有语言的默认结构
    formParams.i18n = {
      'en-us': { name: '', a_name: '', intro: '', image: '' },
      'es-es': { name: '', a_name: '', intro: '', image: '' },
      'ja-jp': { name: '', a_name: '', intro: '', image: '' },
      'th-th': { name: '', a_name: '', intro: '', image: '' }
    };
    
    // 如果有有效的i18n数据，合并到默认结构中
    if (Object.keys(i18nData).length > 0) {
      Object.keys(formParams.i18n).forEach(lang => {
        if (i18nData[lang]) {
          formParams.i18n[lang] = {
            name: i18nData[lang].name || '',
            a_name: i18nData[lang].a_name || '',
            intro: i18nData[lang].intro || '',
            image: i18nData[lang].image || ''
          };
        }
      });
    }
    
    // 设置中文图片文件列表
    fileList.value = record.image ? [{ id: `zh-${Date.now()}`, url: record.image, status: 'finished', name: '图片' }] : [];
    
    // 设置其他语言的图片文件列表 - 修复图片不显示问题
    Object.keys(i18nFileList).forEach(lang => {
      const langImage = formParams.i18n[lang]?.image;
      if (langImage) {
        i18nFileList[lang] = [{ 
          id: `${lang}-${Date.now()}`,
          url: langImage, 
          status: 'finished', 
          name: `${lang}图片` 
        }];
      } else {
        i18nFileList[lang] = [];
      }
    });
    showEditModal.value = true;
  }

  // 删除产品
  function handleDelete(record: ProductListData) {
    message.info('正在删除...');
    goodsDel({ id: String(record.id) }).then(() => {
      message.success('删除成功');
      reloadTable();
    });
  }

  // 搜索
  function handleSubmit(values) {
    console.log(values);
    reloadTable();
  }

  // 重置
  function handleReset() {
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
