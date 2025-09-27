import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/config',
    component: Layout,
    meta: {
      title: '系统设置',
      sort: 8,
      permissions:['*','8'],
    },
    children: [
      {
        path: 'config',
        name: 'system_config',
        meta: {
          title: '系统设置',
          permissions:['*','8'],
        },
        component: () => import('@/views/system/config/index.vue'),
      },
    ],
  },
];

export default routes;
