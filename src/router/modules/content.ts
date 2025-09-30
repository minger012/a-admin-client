import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/content',
    name: 'Content',
    redirect: '/content/message',
    component: Layout,
    meta: {
      title: '用户反馈',
      sort: 11,
      permissions:['*','11'],
    },
    children: [
      {
        path: 'message',
        name: 'Message',
        meta: {
          title: '用户通知',
          permissions:['*','1101'],
        },
        component: () => import('@/views/content/message/index.vue'),
      },
    ],
  },
];

export default routes;
