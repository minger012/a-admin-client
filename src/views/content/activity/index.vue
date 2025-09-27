<template>
  <n-card :bordered="false">
    <div class="flex justify-between mb-4">
      <div>
        <n-button type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增活动
        </n-button>
      </div>
    </div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1200"
      :striped="true"
    >
    </BasicTable>
    
    <!-- 添加/编辑活动弹窗 -->
    <n-modal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 50%">
      <n-form
        :model="formValue"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="标题" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入标题" />
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input
            v-model:value="formValue.content"
            type="textarea"
            placeholder="请输入内容"
            :autosize="{ minRows: 5, maxRows: 10 }"
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
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="closeModal" :disabled="isUploading">取消</n-button>
          <n-button type="primary" @click="confirmForm" :loading="submitLoading" :disabled="isUploading">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { PlusOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { getActivityList, addActivity, editActivity, deleteActivity } from '@/api/content/activity';
  import { formatToDateTime } from '@/utils/dateUtil';
  import { getAppEnvConfig } from '@/utils/env';
  import { useUser } from '@/store/modules/user';
  import type { UploadFileInfo } from 'naive-ui';
  
  const { VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const message = useMessage();
  const actionRef = ref();
  const formRef = ref();
  const userStore = useUser();
  
  // 弹窗相关变量
  const showModal = ref(false);
  const modalTitle = ref('新增活动');
  const isEdit = ref(false);
  const submitLoading = ref(false);
  const isUploading = ref(false);
  
  // 文件列表
  const fileList = ref([]);
  
  // 表单数据和验证规则
  const formValue = reactive({
    id: null,
    name: '',
    content: '',
    image: ''
  });
  
  const rules = {
    name: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入标题'
    },
    content: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入内容'
    }
  };

  // 表格列配置
  const columns = reactive([
    {
      title: '名称',
      key: 'name',
      width: 180,
    },
    {
      title: '内容',
      key: 'content',
      width: 300,
      render(row) {
        // 过滤HTML标签
        const plainText = row.content.replace(/<\/?[^>]+(>|$)/g, '');
        return h('span', {}, plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText);
      },
    },
    {
      title: '图片',
      key: 'image',
      width: 120,
      render(row) {
        return row.image ? h('img', {
          src: row.image,
          style: 'width: 50px; height: 50px; object-fit: cover;',
        }) : h('span', {}, '无图片');
      },
    },
    {
      title: '创建时间',
      key: 'create_time',
      width: 180,
      render(row) {
        return h('span', {}, formatToDateTime(row.create_time * 1000));
      },
    }
  ]);

  // 表格操作列配置
  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction, {
        style: 'button',
        actions: [
          {
            label: '修改活动',
            onClick: handleEdit.bind(null, record),
            type: "primary"
          },
          {
            label: '删除',
            onClick: handleDelete.bind(null, record),
            type: "error"
          },
        ],
      });
    },
  });

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
        formValue.image = response.data.url;
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

  // 处理文件移除
  const handleRemove = () => {
    // 清空对应的value值
    formValue.image = '';
    return true;
  };

  // 处理上传错误
  const handleUploadError = () => {
    message.error('上传遇到网络错误');
    // 重置上传状态
    isUploading.value = false;
  };

  // 加载表格数据
  async function loadDataTable({ page, pageSize }) {
    const params = {
      page: String(page),
      pageSize: String(pageSize),
    };
    
    try {
      const res:any = await getActivityList(params);
      const responseData = res.data;
      return {
        page: responseData.page,
        pageSize: responseData.page_size,
        pageCount: responseData.total_page,
        itemCount: responseData.total,
        list: responseData.list || [],
      };
    } catch (error) {
      message.error('获取活动列表失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    }
  }

  // 新增活动
  function handleAdd() {
    // 重置表单数据
    Object.assign(formValue, {
      id: null,
      name: '',
      content: '',
      image: ''
    });
    fileList.value = [];
    isEdit.value = false;
    modalTitle.value = '新增活动';
    showModal.value = true;
  }

  // 编辑活动
  function handleEdit(record) {
    // 设置表单数据
    Object.assign(formValue, {
      id: record.id,
      name: record.name,
      content: record.content,
      image: record.image
    });
    
    // 如果有图片，设置文件列表
    fileList.value = [];
    if (record.image) {
      fileList.value.push({
        id: Date.now(),
        name: '活动图片',
        status: 'finished',
        url: record.image
      });
    }
    
    isEdit.value = true;
    modalTitle.value = '编辑活动';
    showModal.value = true;
  }

  // 删除活动
  function handleDelete(record) {
    window.$dialog.warning({
      title: '警告',
      content: '确定要删除该活动吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const res = await deleteActivity(record.id.toString());
          if (res.code === 1) {
            message.success('删除成功');
            // 刷新表格
            reloadTable();
          } else {
            message.error(res.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  }

  // 确认提交表单
  async function confirmForm() {
    try {
      await formRef.value?.validate();
      submitLoading.value = true;
      
      const params = {
        name: formValue.name,
        content: formValue.content,
        image: formValue.image
      };
      
      let res;
      if (isEdit.value) {
        res = await editActivity({ ...params, id: formValue.id });
      } else {
        res = await addActivity(params);
      }
      
      if (res.code === 1) {
        message.success(isEdit.value ? '编辑成功' : '新增成功');
        showModal.value = false;
        reloadTable();
      } else {
        message.error(res.msg || (isEdit.value ? '编辑失败' : '新增失败'));
      }
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error(isEdit.value ? '编辑失败' : '新增失败');
    } finally {
      submitLoading.value = false;
    }
  }

  function closeModal() {
    showModal.value = false;
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function onCheckedRow(rowKeys) {
    console.log('选中行', rowKeys);
  }

</script>

<style scoped></style>
