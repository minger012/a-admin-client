import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { TeamOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

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
      title: '会员管理',
      icon: renderIcon(TeamOutlined),
      permissions:['*','2'],
      sort: 5,
    },
    children: [
      {
        path: 'memberList',
        name: 'MemberList',
        meta: {
          title: '会员列表',
          permissions:['*','201'],
        },
        component: () => import('@/views/member/memberList/index.vue'),
      },
      {
        path: 'onlineUser',
        name: 'onlineUser',
        meta: {
          title: '在线用户',
          permissions:['*','208'],
        },
        component: () => import('@/views/member/onlineUser/index.vue'),
      },
      {
        path: 'companionUser',
        name: 'CompanionUser',
        meta: {
          title: '陪玩用户',
          permissions:['*','202'],
        },
        component: () => import('@/views/member/companionUser/index.vue'),
      },
      {
        path: 'rechargeList',
        name: 'RechargeList',
        meta: {
          title: '充值列表',
          permissions:['*','203'],
        },
        component: () => import('@/views/member/rechargeList/index.vue'),
      },
      {
        path: 'withdrawalList',
        name: 'WithdrawalList',
        meta: {
          title: '提现列表',
          permissions:['*','204'],
        },
        component: () => import('@/views/member/withdrawalList/index.vue'),
      },
      {
        path: 'betLimit',
        name: 'BetLimit',
        meta: {
          title: '会员加减打码量',
          permissions:['*','205'],
        },
        component: () => import('@/views/member/betLimit/index.vue'),
      },
      {
        path: 'moneyManage',
        name: 'MoneyManage',
        meta: {
          title: '会员加扣款',
          permissions:['*','206'],
        },
        component: () => import('@/views/member/moneyManage/index.vue'),
      },
      {
        path: 'bonusManage',
        name: 'BonusManage',
        meta: {
          title: '赠送彩金',
          permissions:['*','207'],
        },
        component: () => import('@/views/member/bonusManage/index.vue'),
      },
    ],
  },
];

export default routes;
