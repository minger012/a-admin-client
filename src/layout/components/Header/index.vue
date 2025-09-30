<template>
  <div class="layout-header">
    <!--顶部菜单-->
    <div
      class="layout-header-left"
      v-if="navMode === 'horizontal' || (navMode === 'horizontal-mix' && mixMenu)"
    >
      <div class="logo" v-if="navMode === 'horizontal'">
        <img :src="websiteConfig.logo" v-if="websiteConfig.logo" />
        <h2 v-show="!collapsed" class="title">{{ websiteConfig.title }}</h2>
      </div>
      <AsideMenu
        :collapsed="collapsed"
        v-model:location="getMenuLocation"
        :inverted="getInverted"
        mode="horizontal"
      />
    </div>
    <!--左侧菜单-->
    <div class="layout-header-left" v-else>
      <!-- 菜单收起 -->
      <!-- <div
        class="ml-1 layout-header-trigger layout-header-trigger-min"
        @click="handleMenuCollapsed"
      >
        <n-icon size="18" v-if="collapsed">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon size="18" v-else>
          <MenuFoldOutlined />
        </n-icon>
      </div> -->
      <!-- 刷新 -->
      <div
        class="mr-1 layout-header-trigger layout-header-trigger-min"
        v-if="headerSetting.isReload"
        @click="reloadPage"
      >
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
      <!-- 面包屑 -->
      <n-breadcrumb v-if="crumbsSetting.show">
        <template
          v-for="routeItem in breadcrumbList"
          :key="routeItem.name === RedirectName ? void 0 : routeItem.name"
        >
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <n-dropdown
              v-if="routeItem.children.length"
              :options="routeItem.children"
              @select="dropdownSelect"
            >
              <span class="link-text">
                <component
                  v-if="crumbsSetting.showIcon && routeItem.meta.icon"
                  :is="routeItem.meta.icon"
                />
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span class="link-text" v-else>
              <component
                v-if="crumbsSetting.showIcon && routeItem.meta.icon"
                :is="routeItem.meta.icon"
              />
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
    <div class="layout-header-right">
      <!-- 文本链接区域 -->
      <div class="text-link-area">
        
        <div class="text-link-item" @click="router.push('/member/rechargeList')">
          <span>充值订单</span>
        </div>
        
        <div class="text-link-item" @click="router.push('/member/withdrawalList')">
          <span>提现订单</span>
          <div class="badge" v-if="withdrawCount > 0">{{ withdrawCount }}</div>
        </div>
      </div>

      <div
        class="layout-header-trigger layout-header-trigger-min"
        v-for="item in iconList"
        :key="item.icon"
      >
        <n-tooltip placement="bottom">
          <template #trigger>
            <div class="icon-wrapper">
              <n-icon size="18">
                <component :is="item.icon" v-on="item.eventObject || {}" />
              </n-icon>
              <!-- 添加消息数量标记 -->
              <div class="badge !right-[-10px] !top-[18px]" v-if="item.type === 'withdraw' && withdrawCount > 0">{{ withdrawCount }}</div>
            </div>
          </template>
          <span>{{ item.tips }}</span>
        </n-tooltip>
      </div>
      <!--切换全屏-->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="fullscreenIcon" @click="toggleFullScreen" />
            </n-icon>
          </template>
          <span>全屏</span>
        </n-tooltip>
      </div>
      <!-- 个人中心 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-dropdown trigger="hover" @select="avatarSelect" :options="avatarOptions">
          <div class="avatar">
            <n-divider vertical />
            <span>{{ username }}</span>
          </div>
        </n-dropdown>
      </div>
      <!--设置-->
      <div class="layout-header-trigger layout-header-trigger-min" @click="openSetting">
        <n-tooltip placement="bottom-end">
          <template #trigger>
            <n-icon size="18" style="font-weight: bold">
              <SettingOutlined />
            </n-icon>
          </template>
          <span>项目配置</span>
        </n-tooltip>
      </div>
    </div>
  </div>
  <!--项目配置-->
  <ProjectSetting ref="drawerSetting" />
</template>

<script lang="ts">
  import { websiteConfig } from '@/config/website.config';
  import { useProjectSetting } from '@/hooks/setting/useProjectSetting';
  import { AsideMenu } from '@/layout/components/Menu';
  import { RedirectName } from '@/router/constant';
  import { getWithdrawCount } from '@/api/member/withdraw';
  import { useScreenLockStore } from '@/store/modules/screenLock';
  import { useUserStore } from '@/store/modules/user';
  import { TABS_ROUTES } from '@/store/mutation-types';
  import { NDialogProvider, useDialog, useMessage } from 'naive-ui';
  import { computed, defineComponent, reactive, ref, toRefs, unref, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import components from './components';
  import ProjectSetting from './ProjectSetting.vue';

  export default defineComponent({
    name: 'PageHeader',
    components: { ...components, NDialogProvider, ProjectSetting, AsideMenu },
    props: {
      collapsed: {
        type: Boolean,
      },
      inverted: {
        type: Boolean,
      },
    },
    emits: ['update:collapsed'],
    setup(props, { emit }) {
      const userStore = useUserStore();
      const useLockscreen = useScreenLockStore();
      const message = useMessage();
      const dialog = useDialog();
      const { navMode, navTheme, headerSetting, menuSetting, crumbsSetting } = useProjectSetting();

      const drawerSetting = ref();

      // 音频元素
      let audioElement:any = null;
      
      const state:any = reactive({
        username: userStore?.info?.username ?? '',
        fullscreenIcon: 'FullscreenOutlined',
        navMode,
        navTheme,
        headerSetting,
        withdrawCount: 0,
        prevWithdrawCount: 0,
        hasUnreadWithdraw: false,
        notificationTimerId: null,
        crumbsSetting,
      });

      const getInverted = computed(() => {
        return ['light', 'header-dark'].includes(unref(navTheme))
          ? props.inverted
          : !props.inverted;
      });

      const mixMenu = computed(() => {
        return unref(menuSetting).mixMenu;
      });

      const getChangeStyle = computed(() => {
        const { collapsed } = props;
        const { minMenuWidth, menuWidth } = unref(menuSetting);
        return {
          left: collapsed ? `${minMenuWidth}px` : `${menuWidth}px`,
          width: `calc(100% - ${collapsed ? `${minMenuWidth}px` : `${menuWidth}px`})`,
        };
      });

      const getMenuLocation = computed(() => {
        return 'header';
      });

      const router = useRouter();
      const route = useRoute();

      const generator: any = (routerMap) => {
        return routerMap.map((item) => {
          const currentMenu = {
            ...item,
            label: item.meta.title,
            key: item.name,
            disabled: item.path === '/',
          };
          // 是否有子菜单，并递归处理
          if (item.children && item.children.length > 0) {
            // Recursion
            currentMenu.children = generator(item.children, currentMenu);
          }
          return currentMenu;
        });
      };

      const breadcrumbList = computed(() => {
        return generator(route.matched);
      });

      const dropdownSelect = (key) => {
        router.push({ name: key });
      };

      // 刷新页面
      const reloadPage = () => {
        router.push({
          path: '/redirect' + unref(route).fullPath,
        });
      };

      // 退出登录
      const doLogout = () => {
        dialog.info({
          title: '提示',
          content: '您确定要退出登录吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: () => {
            userStore.logout().then(() => {
              message.success('成功退出登录');
              // 移除标签页
              localStorage.removeItem(TABS_ROUTES);
              router
                .replace({
                  name: 'Login',
                  query: {
                    redirect: route.fullPath,
                  },
                })
                .finally(() => location.reload());
            });
          },
          onNegativeClick: () => {},
        });
      };

      // 切换全屏图标
      const toggleFullscreenIcon = () =>
        (state.fullscreenIcon =
          document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined');

      // 监听全屏切换事件
      document.addEventListener('fullscreenchange', toggleFullscreenIcon);

      // 全屏切换
      const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      };

      // 图标列表
      // 检查提现消息
      const checkWithdrawNotifications = () => {
        getWithdrawCount().then(res => {
          if (res.code === 1) {
            state.withdrawCount = res.data.count;
            // 设置是否有未读提现消息的状态
            state.hasUnreadWithdraw = state.withdrawCount > 0;
            
            // 如果有未读消息，尝试播放提醒音
            if (state.hasUnreadWithdraw) {
              tryPlayNotificationSound();
            } else {
              // 如果没有未读消息，清除通知计时器
              if (state.notificationTimerId) {
                clearInterval(state.notificationTimerId);
                state.notificationTimerId = null;
              }
            }
            
            state.prevWithdrawCount = state.withdrawCount;
          }
        }).catch(err => {
          console.error('获取提现消息数量失败:', err);
        });
      };
      
      // 初始化音频元素
      const initAudio = () => {
        if (!audioElement) {
          audioElement = new Audio('/admin/audio/new_message.mp3');
        }
      };
      
      // 已经在播放标记
      let isPlaying = false;
      
      // 尝试播放提示音
      const tryPlayNotificationSound = () => {
        // 如果已初始化音频且有未读消息，则播放
        if (!audioElement) {
          setTimeout(()=>{
            tryPlayNotificationSound()
          },300)
          return
        }
          
        // 如果没有通知计时器，创建一个
        if (!state.notificationTimerId) {
          // 立即播放一次
          playNotificationSound();
          
          // 创建计时器，定期函数只在上一次播放完成时才会再次触发
          state.notificationTimerId = setInterval(() => {
            if (!state.hasUnreadWithdraw) {
              // 如果没有未读消息，清除计时器
              clearInterval(state.notificationTimerId);
              state.notificationTimerId = null;
              return;
            }
            
            // 只有当前没有在播放时，才播放新的提醒音
            if (!isPlaying) {
              playNotificationSound();
            }
          }, 5000); // 每5秒检查一次
        }
      };
      
      // 播放提示音
      const playNotificationSound = () => {
        
        // 如果已经在播放则不重复播放
        if (isPlaying) {
          return;
        }
        
        // 停止当前播放
        audioElement.pause();
        audioElement.currentTime = 0;
        
        // 标记正在播放
        isPlaying = true;
        
        // 播放音频
        audioElement.play()
          .then(() => {
            // 添加播放结束的单次监听器
            const onEnded = () => {
              isPlaying = false; // 重置播放状态
              audioElement.removeEventListener('ended', onEnded);
            };
            
            audioElement.addEventListener('ended', onEnded);
          })
          .catch(err => {
            isPlaying = false; // 出错时也要重置播放状态
            console.error('播放提示音失败:', err);
          });
       
      };
      
      // 定时器引用
      let withdrawTimerId:any = null;
      
      
      // 启动提现消息和在线用户检查定时器
      const startTimers = () => {
        // 立即检查一次
        checkWithdrawNotifications();
        
        // 设置30秒定时器
        withdrawTimerId = setInterval(() => {
          checkWithdrawNotifications();
        }, 30000); // 30秒
      };

      const onClick = () => {
        initAudio()
      }
      
      // 在组件挂载时启动定时器并添加交互监听
      onMounted(() => {
       // startTimers();
        window.addEventListener("click",onClick)
        // 监听路由变化，重置提醒状态
        router.beforeEach((to) => {
          // 如果导航到提现页面，重置未读状态
          if (to.path.includes('/member/withdrawalList')) {
            state.hasUnreadWithdraw = false;
            if (state.notificationTimerId) {
              clearInterval(state.notificationTimerId);
              state.notificationTimerId = null;
            }
          }
          return true;
        });
      });
      
      // 在组件卸载时清除定时器
      onUnmounted(() => {
        if (withdrawTimerId) {
          clearInterval(withdrawTimerId);
          withdrawTimerId = null;
        }
        window.removeEventListener("click",onClick)
        
        if (state.notificationTimerId) {
          clearInterval(state.notificationTimerId);
          state.notificationTimerId = null;
        }
        
        // 清理音频资源
        if (audioElement) {
          audioElement.pause();
          audioElement = null;
        }
      });

      const iconList = [
        {
          icon: 'LockOutlined',
          tips: '锁屏',
          eventObject: {
            click: () => useLockscreen.setLock(true),
          },
        },
        // 添加提现消息图标
        {
          icon: 'BellOutlined',
          tips: '新用户提现',
          type: 'withdraw',
          eventObject: {
            click: () => {
              // 点击图标时跳转到提现页面并重置未读状态
              router.push('/member/withdrawalList');
              state.hasUnreadWithdraw = false;
              if (state.notificationTimerId) {
                clearInterval(state.notificationTimerId);
                state.notificationTimerId = null;
              }
            },
          },
        },
      ];
      const avatarOptions = [
        // {
        //   label: '个人设置',
        //   key: 1,
        // },
        {
          label: '退出登录',
          key: 2,
        },
      ];

      //头像下拉菜单
      const avatarSelect = (key) => {
        switch (key) {
          case 1:
            router.push({ name: 'Setting' });
            break;
          case 2:
            doLogout();
            break;
        }
      };

      function openSetting() {
        const { openDrawer } = drawerSetting.value;
        openDrawer();
      }

      function handleMenuCollapsed() {
        emit('update:collapsed', !props.collapsed);
      }

      return {
        ...toRefs(state),
        iconList,
        router,
        toggleFullScreen,
        doLogout,
        route,
        dropdownSelect,
        avatarOptions,
        getChangeStyle,
        avatarSelect,
        breadcrumbList,
        reloadPage,
        drawerSetting,
        openSetting,
        getInverted,
        getMenuLocation,
        mixMenu,
        websiteConfig,
        handleMenuCollapsed,
        RedirectName,
      };
    },
  });
</script>

<style lang="less" scoped>
  .layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    height: 64px;
    transition: all 0.2s ease-in-out;
    width: 100%;
    z-index: 11;
    border-bottom: 1px solid #efefef;
    /* 图标和计数器的样式 */
    .icon-wrapper {
      position: relative;
      display: inline-block;
    }
    
    /* 文本链接区域样式 */
    .text-link-area {
      display: flex;
      align-items: center;
      margin-right: 16px;
    }
    
    .text-link-item {
      position: relative;
      padding: 0 20px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text-color);
      transition: color 0.3s;
      display: flex;
      align-items: center;
      
      &:hover {
        color: var(--primary-color);
      }
    }
    
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
      text-align: center;
      background-color: #f5222d;
      border-radius: 8px;
      box-shadow: 0 0 0 1px #fff;
      color: #fff;
    }
    

    &-left {
      display: flex;
      align-items: center;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;
        line-height: 64px;
        overflow: hidden;
        white-space: nowrap;
        padding-left: 10px;

        img {
          width: auto;
          height: 32px;
          margin-right: 10px;
        }

        .title {
          margin-bottom: 0;
        }
      }

      ::v-deep(.ant-breadcrumb span:last-child .link-text) {
        color: #515a6e;
      }

      .n-breadcrumb {
        display: inline-block;
      }

      &-menu {
        color: var(--text-color);
      }
    }

    &-right {
      display: flex;
      align-items: center;
      margin-right: 20px;

      .avatar {
        display: flex;
        align-items: center;
        height: 64px;
      }

      > * {
        cursor: pointer;
      }
    }

    &-trigger {
      display: inline-block;
      width: 64px;
      height: 64px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      .n-icon {
        display: flex;
        align-items: center;
        height: 64px;
        line-height: 64px;
      }

      &:hover {
        background: hsla(0, 0%, 100%, 0.08);
      }

      .anticon {
        font-size: 16px;
        color: #515a6e;
      }
    }

    &-trigger-min {
      width: auto;
      padding: 0 12px;
    }
  }

  .layout-header-light {
    background: #fff;
    color: #515a6e;

    .n-icon {
      color: #515a6e;
    }

    .layout-header-left {
      ::v-deep(.n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
        color: #515a6e;
      }
    }

    .layout-header-trigger {
      &:hover {
        background: #f8f8f9;
      }
    }
  }

  .layout-header-fix {
    position: fixed;
    top: 0;
    right: 0;
    left: 200px;
    z-index: 11;
  }

  //::v-deep(.menu-router-link) {
  //  color: #515a6e;
  //
  //  &:hover {
  //    color: #1890ff;
  //  }
  //}
</style>
