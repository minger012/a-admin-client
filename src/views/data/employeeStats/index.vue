<template>
  <div>
    <n-card :bordered="false" class="proCard" title="员工统计">
      <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
        <template #statusSlot="{ model, field }">
          <n-input v-model:value="model[field]" />
        </template>
      </BasicForm>

      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
        :loading="loading"
        :scroll-x="1800"
      >

      </BasicTable>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { useMessage } from 'naive-ui';
  import { columns, schemas, actionColumn } from './model';
  import { getStatistics } from '@/api/data/statistics';
  
  const message = useMessage();
  const actionRef = ref();

  const [register, { setProps }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 搜索参数
  const searchParams = ref({
    name: '',
    username: '',
    date: null,
    page: 1,
    pageSize: 10,
  });

  const loading = ref(false);
  
  const loadDataTable = async ({ page, pageSize }) => {
    try {
      loading.value = true;
      const params = {
        page: page,
        pageSize: pageSize,
        name: searchParams.value.name || undefined,
        username: searchParams.value.username || undefined,
      };
      
      // 处理时间范围
      if (searchParams.value.date && searchParams.value.date.length === 2) {
        params.sTime = Math.floor(searchParams.value.date[0] / 1000);
        params.eTime = Math.floor(searchParams.value.date[1] / 1000);
      }
      
      const response = await getStatistics(params);
      if (response.code === 1) {
        return {
          page: response.data.page,
          pageSize: response.data.page_size,
          pageCount: response.data.total_page,
          itemCount: response.data.total,
          list: response.data.list || [],
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          list: [],
          page: 1,
          pageCount: 0,
          pageSize: 10,
          itemCount: 0,
        };
      }
    } catch (error) {
      message.error('获取数据失败');
      return {
        list: [],
        page: 1,
        pageCount: 0,
        pageSize: 10,
        itemCount: 0,
      };
    } finally {
      loading.value = false;
    }
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function handleSubmit(values) {
    searchParams.value = {
      ...searchParams.value,
      ...values,
    };
    actionRef.value.reload();
  }

  function handleReset() {
    searchParams.value = {
      name: '',
      username: '',
      date: null,
      page: 1,
      pageSize: 10,
    };
    actionRef.value.reload();
  }


</script>

<style lang="less" scoped></style>
