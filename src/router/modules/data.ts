import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 *
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/data',
    name: 'Data',
    redirect: '/data/employeeStats',
    component: Layout,
    meta: {
      title: '数据统计',
      sort: 9,
      permissions:['*','9'],
    },
    children: [
      {
        path: 'employeeStats',
        name: 'EmployeeStats',
        meta: {
          title: '注册统计',
          permissions:['*','901'],
        },
        component: () => import('@/views/data/employeeStats/index.vue'),
      },
      {
        path: 'teamStats',
        name: 'TeamStats',
        meta: {
          title: '充值提现统计',
          permissions:['*','902'],
        },
        component: () => import('@/views/data/teamStats/index.vue'),
      },
    ],
  },
];

export default routes;
