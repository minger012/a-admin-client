import { h } from 'vue';
import { NTag, NButton } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

export interface WithdrawalListData {
  id: number;
  uid: number;
  admin_id: number;
  fb_id: string;
  money: number;
  remarks: string | null;
  user_remarks: string | null;
  methods: string;
  currency: string;
  address: string;
  state: number; // 0待审核 1成功 2驳回
  update_time: number;
  create_time: number;
  username: string;
  admin_username?: string; // 管理员账号
}

// 状态映射
const statusMap = {
  0: '待审核',
  1: '成功',
  2: '驳回'
};

// 状态颜色映射
const statusColorMap = {
  0: 'warning',
  1: 'success',
  2: 'error'
};

// 状态选项
export const stateOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 0 },
  { label: '成功', value: 1 },
  { label: '驳回', value: 2 },
];

export const columns: BasicColumn<WithdrawalListData>[] = [
  {
    title: 'ID',
    width: 80,
    key: 'id',
  },
  {
    title: '用户ID',
    width: 100,
    key: 'uid',
  },
  {
    title: '用户简称',
    width: 120,
    key: 'username',
  },
  {
    title: 'FB_ID',
    width: 180,
    key: 'fb_id',
  },
  {
    title: '所属管理者',
    width: 120,
    key: 'admin_username',
    render(row) {
      return h('span', {}, { default: () => row.admin_username || '-' });
    },
  },
  {
    title: '提现方式',
    width: 120,
    key: 'methods',
    render(row) {
      return h(NButton, {
        text: true,
        type: 'primary',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('view-withdraw-method', { detail: row }));
        }
      }, { default: () => '查看' });
    },
  },
  {
    title: '涉及金额',
    width: 120,
    key: 'money',
    render(row) {
      return h('span', {}, { default: () => row.money.toFixed(2) });
    },
  },
  {
    title: '后台备注',
    width: 180,
    key: 'remarks',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('span', {}, { default: () => row.remarks || '-' });
    },
  },
  {
    title: '用户端备注',
    width: 180,
    key: 'user_remarks',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('span', {}, { default: () => row.user_remarks || '-' });
    },
  },
  {
    title: '状态',
    width: 100,
    key: 'state',
    fixed:"right",
    render(row) {
      return h(
        NTag,
        {
          type: statusColorMap[row.state],
          bordered: false,
        },
        {
          default: () => statusMap[row.state],
        }
      );
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 160,
    render(row) {
      return h('span', {}, { 
        default: () => row.update_time ? new Date(row.update_time * 1000).toLocaleString() : '-'
      });
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(row) {
      return h('span', {}, { 
        default: () => new Date(row.create_time * 1000).toLocaleString()
      });
    },
  },
];
