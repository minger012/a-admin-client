import { h } from 'vue';
import { NTag } from 'naive-ui';

export interface UserCouponListData {
  id: number;
  uid: string;
  user_name?: string;
  cid: number;
  fb_id: string;
  name: string;
  state: number;
  end_time: number;
  update_time?: number;
  create_time: number;
}

// 状态选项
export const stateOptions = [
  { label: '全部', value: '' },
  { label: '未使用', value: 1 },
  { label: '已使用', value: 2 },
];

// 状态渲染
function renderState(state: number) {
  return h(
    NTag,
    {
      type: state === 1 ? 'warning' : 'success',
      bordered: false,
    },
    {
      default: () => (state === 1 ? '未使用' : '已使用'),
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
    width: 120,
  },
  {
    title: '用户简称',
    key: 'user_name',
    width: 150,
    render(row) {
      return row.user_name || '-';
    },
  },
  {
    title: '优惠券ID',
    key: 'cid',
    width: 100,
  },
  {
    title: 'FB_ID',
    key: 'fb_id',
    width: 150,
  },
  {
    title: '优惠券名称',
    key: 'name',
    width: 180,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(row) {
      return renderState(row.state);
    },
  },
  {
    title: '过期时间',
    key: 'end_time',
    width: 160,
    render(row) {
      return row.end_time ? new Date(row.end_time * 1000).toLocaleString() : '-';
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 160,
    render(row) {
      return row.update_time ? new Date(row.update_time * 1000).toLocaleString() : '-';
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(row) {
      return row.create_time ? new Date(row.create_time * 1000).toLocaleString() : '-';
    },
  },
];
