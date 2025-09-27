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
    path: '/member',
    name: 'Member',
    redirect: '/member/memberList',
    component: Layout,
    meta: {
      title: '用户管理',
      permissions:['*','10'],
      sort: 10,
    },
    children: [
      {
        path: 'memberList',
        name: 'MemberList',
        meta: {
          title: '用户管理',
          permissions:['*','1001'],
        },
        component: () => import('@/views/member/memberList/index.vue'),
      },
      {
        path: 'onlineUser',
        name: 'onlineUser',
        meta: {
          title: '在线用户',
          permissions:['*','1002'],
        },
        component: () => import('@/views/member/onlineUser/index.vue'),
      },
    ],
  },
];

export default routes;
