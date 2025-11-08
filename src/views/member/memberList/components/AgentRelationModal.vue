<template>
  <n-modal 
    v-model:show="showModal" 
    :show-icon="false" 
    preset="dialog" 
    title="用户代理关系" 
    style="width: 600px;"
  >
    <div class="agent-relation-content">
      <div class="relation-item">
        <span class="label">用户当前层级：</span>
        <n-tag type="info" :bordered="false">第{{ currentLevel }}级</n-tag>
      </div>

      <div class="relation-item">
        <span class="label">用户代理关系路径：</span>
      </div>

      <div class="relation-path">
        <template v-if="relationPath.length > 0">
          <template v-for="(id, index) in relationPath" :key="index">
            <n-tag 
              :type="id === userData?.id ? 'primary' : 'default'"
              :bordered="false"
              size="large"
            >
              {{ id }}{{ id === userData?.id ? '（当前用户）' : '' }}
            </n-tag>
            <span v-if="index < relationPath.length - 1" class="arrow">→</span>
          </template>
        </template>
        <n-tag v-else type="default" :bordered="false">无</n-tag>
      </div>

      <div class="tips">
        <p>* 层级路径从左至右表示从最顶层用户到当前用户的关系</p>
        <p>* 蓝色高亮的是当前用户ID</p>
      </div>
    </div>

    <template #action>
      <n-button @click="handleClose">关闭</n-button>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { useMessage } from 'naive-ui';
  import { getUserList } from '@/api/system/user';

  const message = useMessage();
  const showModal = ref(false);
  const relationPath = ref<number[]>([]);
  const currentLevel = ref(1);

  const props = defineProps<{
    visible: boolean;
    userData?: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
  }>();

  watch(() => props.visible, async (val) => {
    showModal.value = val;
    if (val && props.userData) {
      await loadAgentRelation();
    }
  });

  watch(showModal, (val) => {
    emit('update:visible', val);
  });

  // 加载代理关系
  const loadAgentRelation = async () => {
    if (!props.userData) return;

    try {
      const path: number[] = [];
      let currentId = props.userData.id;
      let currentPid = props.userData.pid;
      
      // 添加当前用户到路径
      path.unshift(currentId);
      
      // 如果没有上级，说明是顶级用户
      if (!currentPid) {
        relationPath.value = path;
        currentLevel.value = 1;
        return;
      }

      // 递归查找上级用户，构建完整路径
      let level = 1;
      const maxLevel = 10; // 防止无限循环，最多查找10层
      
      while (currentPid && level < maxLevel) {
        try {
          // 查询上级用户信息
          const res: any = await getUserList({
            uid: String(currentPid),
            page: '1',
            pageSize: '1',
          });
          
          if (res.code === 1 && res.data.list && res.data.list.length > 0) {
            const parentUser = res.data.list[0];
            path.unshift(parentUser.id);
            currentPid = parentUser.pid;
            level++;
          } else {
            break;
          }
        } catch (error) {
          console.error('查询上级用户失败:', error);
          break;
        }
      }
      
      relationPath.value = path;
      currentLevel.value = level;
    } catch (error) {
      console.error('加载代理关系失败:', error);
      message.error('加载代理关系失败');
    }
  };

  const handleClose = () => {
    showModal.value = false;
  };
</script>

<style scoped lang="less">
.agent-relation-content {
  padding: 20px 0;

  .relation-item {
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    .label {
      font-weight: 500;
      margin-right: 8px;
    }
  }

  .relation-path {
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .arrow {
      margin: 0 4px;
      color: #999;
      font-size: 16px;
    }
  }

  .tips {
    margin-top: 16px;
    font-size: 12px;
    color: #666;

    p {
      margin: 4px 0;
      line-height: 1.5;
    }
  }
}
</style>
