import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { ShoppingOutlined } from '@vicons/antd';
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
    path: '/product',
    name: 'Product',
    redirect: '/product/orderManagement',
    component: Layout,
    meta: {
      title: '产品管理',
      icon: renderIcon(ShoppingOutlined),
      sort: 6,
      permissions:['*','3'],
    },
    children: [
      {
        path: 'orderManagement',
        name: 'OrderManagement',
        meta: {
          title: '注单管理',
          permissions:['*','304'],
        },
        component: () => import('@/views/product/orderManagement/index.vue'),
      },
      {
        path: 'instantOrder',
        name: 'InstantOrder',
        meta: {
          title: '即时注单',
          permissions:['*','305'],
        },
        component: () => import('@/views/product/instantOrder/index.vue'),
      },
      {
        path: 'drawRecord',
        name: 'DrawRecord',
        meta: {
          title: '开奖记录',
          permissions:['*','303'],
        },
        component: () => import('@/views/product/drawRecord/index.vue'),
      },
      {
        path: 'productPreset',
        name: 'ProductPreset',
        meta: {
          title: '产品预设值',
          permissions:['*','302'],
        },
        component: () => import('@/views/product/productPreset/index.vue'),
      },
      {
        path: 'productList',
        name: 'ProductList',
        meta: {
          title: '产品列表',
          permissions:['*','301'],
        },
        component: () => import('@/views/product/productList/index.vue'),
      },
    ],
  },
];

export default routes;
