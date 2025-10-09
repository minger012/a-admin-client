import { h } from 'vue';
import { NTag, NButton, NSpace } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

export interface MemberListData {
  id: number;
  username: string;
  phone: string;
  name: string;
  short_name: string;
  remarks: string;
  lv: number;
  pid: number | null;
  state: number;
  sign: number;
  create_time: number;
  login_count: number;
  last_login_time: number;
  last_login_ip: string;
  money: number;
  freeze_money: number;
  pledge_money: number;
  pledge_refund: number;
  lang: string;
  pay_count: number;
  score: number;
  withdraw_disabled: string;
  admin_id: number;
  fb_id: string;
  code: string | null;
  service_address: string | null;
  service_type: number | null;
  operate_id: string | null;
  ip: string | null;
  admin_name: string;
  bank: any[];
}

// Status mapping
const stateMap = {
  0: '停用',
  1: '正常',
  2: '未激活',
};

// Status type mapping for tag colors
const stateTypeMap = {
  0: 'error',
  1: 'success',
  2: 'warning',
};

export const createColumns = (handlers?: {
  onEditBank?: (record: MemberListData) => void;
}): BasicColumn<MemberListData>[] => [
  {
    title: '用户ID',
    key: 'id',
    width: 100,
    fixed: 'left',
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
    fixed: 'left',
  },
  {
    title: '用户昵称',
    key: 'name',
    width: 120,
  },
  {
    title: '用户简称',
    key: 'short_name',
    width: 120,
  },
  {
    title: '头像',
    key: 'image',
    width: 120,
    
  },
  {
    title: '手机号',
    key: 'phone',
    width: 130,
  },
  {
    title: '所属管理者',
    key: 'admin_name',
    width: 120,
  },
  {
    title: '授权码',
    key: 'code',
    width: 120,
  },
  {
    title: '上级用户ID',
    key: 'pid',
    width: 120,
  },
  {
    title: '代理管理',
    key: 'agent_management',
    width: 100,
    render(row) {
      return h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
      }, { default: () => '查看' });
    },
  },
  {
    title: '语言偏好',
    key: 'lang',
    width: 100,
  },
  {
    title: 'FB_ID',
    key: 'fb_id',
    width: 180,
  },
  {
    title: '提现方式',
    key: 'bank',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            text: true,
            type: 'primary',
            size: 'small',
          }, { default: () => `查看` }),
          h(NButton, {
            text: true,
            type: 'info',
            size: 'small',
            onClick: () => handlers?.onEditBank?.(row),
          }, { default: () => '编辑' }),
        ]
      });
    },
  },
  {
    title: '可用余额',
    key: 'money',
    width: 120,
    render(row) {
      return `¥${(row.money || 0).toFixed(2)}`;
    },
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: stateTypeMap[row.state] || 'default',
          bordered: false,
        },
        {
          default: () => stateMap[row.state] || '未知',
        }
      );
    },
  },
  {
    title: '用户视角',
    key: 'user_perspective',
    width: 120,
    render(row ) {
      return h(NSpace, { size: 'small', vertical: true }, {
        default: () => [
          h(NButton, {
            text: true,
            type: 'primary',
            size: 'small',
          }, { default: () => '广告中心' }),
          h(NButton, {
            text: true,
            type: 'info',
            size: 'small',
          }, { default: () => '计划管理' }),
        ]
      });
    },
  },
  {
    title: '用户IP',
    key: 'last_login_ip',
    width: 140,
  },
];
