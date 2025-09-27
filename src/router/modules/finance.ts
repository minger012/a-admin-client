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
    path: '/finance',
    name: 'Finance',
    redirect: '/finance/rechargeList',
    component: Layout,
    meta: {
      title: '财务管理',
      permissions:['*','6'],
      sort: 8,
    },
    children: [
      {
        path: 'rechargeList',
        name: 'RechargeList',
        meta: {
          title: '充值记录',
          permissions:['*','601'],
        },
        component: () => import('@/views/finance/rechargeList/index.vue'),
      },
      {
        path: 'withdrawalList',
        name: 'WithdrawalList',
        meta: {
          title: '提现列表',
          permissions:['*','602'],
        },
        component: () => import('@/views/finance/withdrawalList/index.vue'),
      },
      {
        path: 'moneyManage',
        name: 'MoneyManage',
        meta: {
          title: '资金明细',
          permissions:['*','603'],
        },
        component: () => import('@/views/finance/moneyManage/index.vue'),
      },
    ],
  },
];

export default routes;
