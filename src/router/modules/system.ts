import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { OptionsSharp } from '@vicons/ionicons5';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/admin',
    component: Layout,
    meta: {
      title: '系统设置',
      icon: renderIcon(OptionsSharp),
      sort: 1,
      permissions:['*','1'],
    },
    children: [
      {
        path: 'admin',
        name: 'system_admin',
        meta: {
          title: '管理员列表',
          permissions:['*','102'],
        },
        component: () => import('@/views/system/admin/index.vue'),
      },
      {
        path: 'role',
        name: 'system_role',
        meta: {
          title: '管理员分组',
          permissions:['*','103'],
        },
        component: () => import('@/views/system/role/role.vue'),
      },
      {
        path: 'config',
        name: 'system_config',
        meta: {
          title: '系统配置',
          permissions:['*','101'],
        },
        component: () => import('@/views/system/config/index.vue'),
      },
    ],
  },
];

export default routes;
