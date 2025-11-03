export interface FeedbackListData {
  id: number;
  uid: number;
  username: string;
  subject: string;
  content: string;
  create_time: number;
  create_time_format: string;
  update_time: number;
  update_time_format: string;
}

export const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '用户ID',
    key: 'uid',
    width: 100,
  },
  {
    title: '用户名',
    key: 'username',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '反馈主题',
    key: 'subject',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '反馈内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '创建时间',
    key: 'create_time_format',
    width: 180,
  },
  {
    title: '更新时间',
    key: 'update_time_format',
    width: 180,
  },
];
