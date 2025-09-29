import { h } from 'vue';
import { NTag } from 'naive-ui';

export interface CodeListData {
  id: number;
  code: string;
  admin_id: number;
  username?: string;
  create_time: number;
  update_time: number;
  state: number;
}

export const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '授权码',
    key: 'code',
    width: 150,
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.state === 0 ? 'info' : 'success',
          bordered: false,
        },
        {
          default: () => (row.state === 0 ? '未使用' : '已使用'),
        }
      );
    },
  },
  {
    title: '所属管理者',
    key: 'username',
    width: 150,
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 180,
    render(row) {
      return row.update_time ? new Date(row.update_time * 1000).toLocaleString() : '';
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 180,
    render(row) {
      return row.create_time ? new Date(row.create_time * 1000).toLocaleString() : '';
    },
  },
];

export const stateOptions = [
  { label: '全部', value: '' },
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
];
