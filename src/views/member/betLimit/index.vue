<template>
  <div>
    <n-card :bordered="false" class="proCard" title="会员加减打码量">
      <n-grid :cols="1" :x-gap="12">
        <n-gi>
          <n-card :segmented="{ content: true }" :bordered="false" size="small">
            <template #header>
              <n-space>
                <n-input
                  v-model:value="searchForm.username"
                  placeholder="请输入会员账号"
                  @keydown.enter="handleSearch"
                />
                <n-button type="primary" @click="handleSearch" :loading="searchLoading">
                  搜索
                </n-button>
                <n-button @click="resetSearch">重置</n-button>
              </n-space>
            </template>

            <div v-if="memberInfo.id">
              <n-form
                :model="formValue"
                :rules="rules"
                ref="formRef"
                label-placement="left"
                :label-width="120"
                class="py-4"
              >
                <n-form-item label="会员账号">
                  {{memberInfo.username}}
                </n-form-item>
                <n-form-item label="账号余额">
                  {{memberInfo.balance}}
                </n-form-item>
                <n-form-item label="出款所需打码量">
                  <span class="text-[#888]">会员当前打码量：</span><span class="text-red-500"> {{memberInfo.betLimit}}</span>
                </n-form-item>
                <n-form-item label="操作类型" path="type">
                  <n-radio-group v-model:value="formValue.type" name="type">
                    <n-space>
                      <n-radio :value="1">人工增加</n-radio>
                      <n-radio :value="2">人工扣除</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
                <n-form-item label="金额" path="num">
                  
                  <n-input-number
                    v-model:value="formValue.num"
                    :min="0"
                    :precision="0"
                    clearable
                    placeholder="请输入金额"
                  />
                </n-form-item>
                <n-form-item label=" ">
                  <div class="text-[#888] mt-[-30px]">增加：增加用户可提现金额 / 扣除：扣除用户可提现金额</div>
                </n-form-item>
                <n-form-item>
                  <n-button type="primary" class="ml-[100px]" @click="handleSubmit" :loading="submitLoading">
                    确认提交
                  </n-button>
                </n-form-item>
              </n-form>
            </div>
            <n-empty v-else description="请先搜索会员账号" />
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { updateWithdrawLimit } from '@/api/member/withdraw';
  import { getUserList } from '@/api/system/user';
  import { useUser } from '@/store/modules/user';
  
  const message = useMessage();
  const userStore = useUser();
  const formRef = ref(null);

  const searchLoading = ref(false);
  const submitLoading = ref(false);

  // 会员信息
  const memberInfo = reactive({
    id: 0,
    username: '',
    balance: 0,
    betLimit: 0,
  });

  // 搜索表单
  const searchForm = reactive({
    username: '',
  });

  // 操作表单
  const formValue = reactive({
    type: 1, // 默认人工增加
    num: undefined, // 金额
  });

  // 表单规则
  const rules = {
    type: {
      required: true,
      type: 'number',
      trigger: ['blur', 'change'],
      message: '请选择操作类型',
    },
    num: {
      required: true,
      trigger: ['blur', 'change'],
      validator: (_rule, value) => {
        if (!value) {
          return new Error('请输入金额');
        }
        if (value <= 0) {
          return new Error('金额必须大于0');
        }
        return true;
      },
    },
  };

  // 缓存搜索表单数据
  const cacheSearchForm = (username: string) => {
    if (username) {
      const adminName = userStore.info.username || 'unknown';
      const cacheKey = `betLimit_search_${adminName}`;
      localStorage.setItem(cacheKey, username);
    }
  };

  // 获取缓存的搜索表单数据
  const getCachedSearchForm = () => {
    const adminName = userStore.info.username || 'unknown';
    const cacheKey = `betLimit_search_${adminName}`;
    return localStorage.getItem(cacheKey) || '';
  };

  // 清除缓存的搜索表单数据
  const clearCachedSearchForm = () => {
    const adminName = userStore.info.username || 'unknown';
    const cacheKey = `betLimit_search_${adminName}`;
    localStorage.removeItem(cacheKey);
  };

  // 搜索会员信息
  const handleSearch = async () => {
    if (!searchForm.username) {
      message.warning('请输入会员账号');
      return;
    }

    // 缓存当前搜索条件
    cacheSearchForm(searchForm.username);

    try {
      searchLoading.value = true;
      // 使用getUserList接口进行查询
      const res:any = await getUserList({
        username: searchForm.username,
        page: 1,
        pageSize: 10
      });
      
      if (res.code === 1) {
        // 在返回的列表中查找是否有username完全相等的会员
        const matchedMember = res.data.list.find(item => item.username.toLowerCase() === searchForm.username.toLowerCase());
        
        if (matchedMember) {
          // 找到会员，更新会员信息
          Object.assign(memberInfo, {
            id: matchedMember.id,
            username: matchedMember.username,
            balance: Number(matchedMember.money || '0'),
            betLimit: Number(matchedMember.withdraw_limit || '0')
          });
          message.success('会员信息获取成功');
        } else {
          // 未找到完全匹配的会员
          resetMemberInfo();
          message.error('未找到该会员');
        }
      } else {
        resetMemberInfo();
        message.error(res.msg || '会员信息获取失败');
      }
    } catch (error) {
      resetMemberInfo();
      message.error('会员信息获取出错，请稍后重试');
      console.error('获取会员信息错误:', error);
    } finally {
      searchLoading.value = false;
    }
  };
  
  // 重置会员信息
  const resetMemberInfo = () => {
    Object.assign(memberInfo, {
      id: 0,
      username: '',
      balance: 0,
      betLimit: 0,
    });
  };

  // 重置搜索
  const resetSearch = () => {
    searchForm.username = '';
    resetMemberInfo();
    formValue.num = undefined;
    formValue.type = 1;
    // 清除缓存
    clearCachedSearchForm();
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!memberInfo.username) {
      message.warning('请先搜索会员信息');
      return;
    }

    formRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          submitLoading.value = true;
          const num = Number(formValue.num || '0')
          const res = await updateWithdrawLimit(memberInfo.id, num, formValue.type);
          if (res.code === 1) {
            message.success('操作成功');
            // 更新当前的打码量数值
            if (formValue.type === 1) {
              memberInfo.betLimit += num;
            } else {
              memberInfo.betLimit = Math.max(0, memberInfo.betLimit - num);
            }
            // 重置表单值
            formValue.num = undefined;
          } else {
            message.error(res.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作出错，请稍后重试');
          console.error('提交表单错误:', error);
        } finally {
          submitLoading.value = false;
        }
      }
    });
  };
  onMounted(() => {
    // 从缓存中获取上次的搜索条件
    const cachedUsername = getCachedSearchForm();
    if (cachedUsername) {
      searchForm.username = cachedUsername;
      // 自动执行搜索
      handleSearch();
    }
  });
</script>

<style scoped></style>
