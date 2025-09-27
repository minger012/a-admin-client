import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/list',
    component: Layout,
    meta: {
      title: '管理员管理',
      sort: 1,
      permissions:['*','1'],
    },
    children: [
      {
        path: 'role',
        name: 'admin_role',
        meta: {
          title: '角色管理',
          permissions:['*','101'],
        },
        component: () => import('@/views/system/role/role.vue'),
      },
      {
        path: 'list',
        name: 'admin_list',
        meta: {
          title: '用户管理',
          permissions:['*','102'],
        },
        component: () => import('@/views/system/admin/index.vue'),
      },
    ],
  },
];

export default routes;
