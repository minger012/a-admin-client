import { h } from 'vue';
import { NTag } from 'naive-ui';
import { formatToDateTime } from '@/utils/dateUtil';

export interface RoleData {
  id: number;
  name: string;
  auth: string;
  desc: string;
  create_time?: number;
}

export const columns = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: '角色名称',
    key: 'name',
  },
  {
    title: '说明',
    key: 'desc',
  },
  {
    title: '创建时间',
    key: 'create_time',
    width:160,
    render(row) {
      return row.create_time ? formatToDateTime(new Date(row.create_time * 1000)) : '-';
    },
  },
];
