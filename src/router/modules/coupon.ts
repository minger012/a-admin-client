import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { GiftOutlined } from '@vicons/antd';

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
    path: '/coupon',
    name: 'Coupon',
    redirect: '/coupon/couponList',
    component: Layout,
    meta: {
      title: '优惠券',
      icon: GiftOutlined,
      sort: 4,
      permissions: ['*', '4'],
    },
    children: [
      {
        path: 'couponList',
        name: 'CouponList',
        meta: {
          title: '优惠券库',
          permissions: ['*', '401'],
        },
        component: () => import('@/views/coupon/couponList/index.vue'),
      },
      {
        path: 'userCoupon',
        name: 'UserCoupon',
        meta: {
          title: '用户优惠券',
          permissions: ['*', '402'],
        },
        component: () => import('@/views/coupon/userCoupon/index.vue'),
      },
    ],
  },
];

export default routes;
