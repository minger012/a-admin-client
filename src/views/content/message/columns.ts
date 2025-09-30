import { h } from 'vue';
import { NTag } from 'naive-ui';

export interface MailListData {
  id: number;
  uid: number;
  type: number;
  title: string;
  content: string;
  read_time?: number;
  update_time: number;
  create_time: number;
}

// 通知类型选项
export const typeOptions = [
  { label: '全部', value: '' },
  { label: '系统公告', value: 1 },
  { label: '系统维护', value: 2 },
  { label: '活动通知', value: 3 },
];

// 发送类型选项
export const sendTypeOptions = [
  { label: '发送所有用户', value: 1 },
  { label: '发送指定用户', value: 2 },
];

// 通知类型映射
const typeMap = {
  1: { text: '系统公告', type: 'info' },
  2: { text: '系统维护', type: 'warning' },
  3: { text: '活动通知', type: 'success' },
};

// 通知类型渲染
function renderType(type: number) {
  const info = typeMap[type] || { text: '未知', type: 'default' };
  
  return h(
    NTag,
    {
      type: info.type,
      bordered: false,
    },
    {
      default: () => info.text,
    }
  );
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
    title: '通知类型',
    key: 'type',
    width: 120,
    render(row) {
      return renderType(row.type);
    },
  },
  {
    title: '通知标题',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '通知内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '阅读时间',
    key: 'read_time',
    width: 180,
    render(row) {
      return row.read_time ? new Date(row.read_time * 1000).toLocaleString() : '未读';
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 180,
    render(row) {
      return row.update_time ? new Date(row.update_time * 1000).toLocaleString() : '-';
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 180,
    render(row) {
      return row.create_time ? new Date(row.create_time * 1000).toLocaleString() : '-';
    },
  },
];
