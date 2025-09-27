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
      {
        path: 'announcement',
        name: 'Announcement',
        meta: {
          title: '公告',
          permissions:['*','1102'],
        },
        component: () => import('@/views/content/announcement/index.vue'),
      },
      {
        path: 'activity',
        name: 'Activity',
        meta: {
          title: '活动',
          permissions:['*','1103'],
        },
        component: () => import('@/views/content/activity/index.vue'),
      },
    ],
  },
];

export default routes;
