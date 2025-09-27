import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';
export interface MemberListData {
  id: number;
  username: string;
  name: string;
  lv: string;
  pid: string;
  state: number;
  phone: string;
  password?: string;
  create_time?: string;
  last_login_time?: string;
  last_login_ip?: string;
  balance: number;
  pay_count: number;
  remarks?: string;
  score?: number;
}

// Status mapping
const stateMap = {
  0: '停用',
  1: '正常',
  2: '禁止登录',
  3: '禁止投注',
  4: '禁止提现',
  5: '禁止充值'
};

// Status type mapping for tag colors
const stateTypeMap = {
  0: 'error',
  1: 'success',
  2: 'error',
  3: 'error',
  4: 'warning',
  5: 'warning',
  6: 'warning'
};

export const columns: BasicColumn<MemberListData>[] = [
  // {
  //   title: '用户ID',
  //   key: 'id',
  //   width: 120,
  // },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '持卡人姓名',
    key: 'name',
    width: 120,
  },
  {
    title: '上级',
    key: 'admin_username',
    width: 120,
    render(record){
      return record.admin_name || record.admin_id || '-';
    }
  },
  {
    title: '首充充值次数',
    key: 'pay_count',
    width: 120,
  },
  {
    title: 'VIP等级',
    key: 'lv',
    width: 120,
    render(record) {
      return 'VIP' + record.lv;
    },
  },
  {
    title: '信誉分',
    key: 'score',
    width: 120,
  },
  {
    title: '余额',
    width: 120,
    key: 'money',
  },
  {
    title: '状态',
    key: 'state',
    width: 120,
    render(record) {
      return h(
        NTag,
        {
          type: stateTypeMap[record.state],
        },
        {
          default: () => stateMap[record.state],
        }
      );
    },
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
    key: 'remarks',
    width: 160,
  },
];
