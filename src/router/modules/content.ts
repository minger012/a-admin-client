import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { NotificationOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/content',
    name: 'Content',
    redirect: '/content/message',
    component: Layout,
    meta: {
      title: '内容中心',
      icon: renderIcon(NotificationOutlined),
      sort: 8,
      permissions:['*','5'],
    },
    children: [
      {
        path: 'message',
        name: 'Message',
        meta: {
          title: '站内信',
          permissions:['*','501'],
        },
        component: () => import('@/views/content/message/index.vue'),
      },
      {
        path: 'announcement',
        name: 'Announcement',
        meta: {
          title: '公告',
          permissions:['*','502'],
        },
        component: () => import('@/views/content/announcement/index.vue'),
      },
      {
        path: 'activity',
        name: 'Activity',
        meta: {
          title: '活动',
          permissions:['*','503'],
        },
        component: () => import('@/views/content/activity/index.vue'),
      },
    ],
  },
];

export default routes;
