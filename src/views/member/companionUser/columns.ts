import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';

export interface CompanionUserData {
  id: number;
  username: string;
  name: string;
  state: number;
  create_time: number;
  update_time: number;
  last_login_time: number;
  last_login_ip: string;
  balance: number;
  remark: string;
}

// 状态映射
const stateMap = {
  0: '停用',
  1: '正常',
  2: '禁止',
};

// 状态样式映射
const stateTypeMap = {
  0: 'warning',
  1: 'success',
  2: 'error',
};

export const columns: BasicColumn<CompanionUserData>[] = [
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '姓名',
    key: 'name',
    width: 120,
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: stateTypeMap[row.state],
        },
        {
          default: () => stateMap[row.state],
        }
      );
    },
  },
  {
    title: '余额',
    key: 'money',
    width: 120,
  },
  {
    title: '注册时间',
    key: 'create_time',
    width: 160,
    render(row) {
      return row.create_time ? formatToDateTime(row.create_time * 1000) : '-';
    },
  },
  {
    title: '最后登录时间',
    key: 'last_login_time',
    width: 160,
    render(row) {
      return row.last_login_time ? formatToDateTime(row.last_login_time * 1000) : '-';
    },
  },
  {
    title: '最后登录IP',
    key: 'last_login_ip',
    width: 160,
  },
  {
    title: '备注',
    key: 'remark',
    width: 160,
    render(record) {
      return h('span', {}, { default: () => `--` });
    },
  },
  {
    title: 'IP',
    key: 'ip',
    width: 160,
  },
];
