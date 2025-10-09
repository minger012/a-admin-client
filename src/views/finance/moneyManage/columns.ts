import { h } from 'vue';
import { NTag } from 'naive-ui';

export interface FlowListData {
  id: number;
  uid: number;
  username?: string;
  fb_id?: string;
  admin_username?: string;
  money: number;
  type: number;
  cha: number;
  order_no?: string;
  coupon_id?: number;
  coupon_money?: number;
  remarks?: string;
  update_time: number;
  create_time: number;
}

// 交易类型选项
export const typeOptions = [
  { label: '全部', value: '' },
  { label: '充值', value: 1 },
  { label: '提现', value: 2 },
  { label: '广告结算', value: 3 },
  { label: '广告投放', value: 4 },
  { label: '后台扣除', value: 5 },
  { label: '投资失败', value: 6 },
  { label: '提现失败', value: 7 },
];

// 资金方向选项
export const chaOptions = [
  { label: '全部', value: '' },
  { label: '增加', value: 1 },
  { label: '减少', value: 2 },
];

// 交易类型渲染
function renderType(type: number) {
  const typeMap = {
    1: { text: '充值', type: 'success' },
    2: { text: '提现', type: 'warning' },
    3: { text: '广告结算', type: 'success' },
    4: { text: '广告投放', type: 'warning' },
    5: { text: '后台扣除', type: 'error' },
    6: { text: '投资失败', type: 'error' },
    7: { text: '提现失败', type: 'error' },
  };
  
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

// 资金方向渲染
function renderCha(cha: number) {
  return h(
    NTag,
    {
      type: cha > 0 ? 'success' : 'error',
      bordered: false,
    },
    {
      default: () => (cha > 0 ? '增加' : '减少'),
    }
  );
}

export const columns = [
  {
    type: 'selection',
    fixed: 'left',
  },
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
    title: '用户简称',
    key: 'username',
    width: 120,
  },
  {
    title: 'FB_ID',
    key: 'fb_id',
    width: 120,
  },
  {
    title: '所属管理者',
    key: 'admin_username',
    width: 120,
  },
  {
    title: '交易金额',
    key: 'money',
    width: 120,
    render(row) {
      return `${row.cha}`;
    },
  },
  {
    title: '交易类型',
    key: 'type',
    width: 120,
    render(row) {
      return renderType(row.type);
    },
  },
  {
    title: '资金方向',
    key: 'cha',
    width: 100,
    render(row) {
      return renderCha(row.cha);
    },
  },
  {
    title: '计划订单编号',
    key: 'order_no',
    width: 150,
  },
  {
    title: '用户优惠券ID',
    key: 'coupon_id',
    width: 120,
  },
  {
    title: '优惠金额',
    key: 'coupon_money',
    width: 120,
    render(row) {
      return row.coupon_money ? `${row.coupon_money} 元` : '-';
    },
  },
  {
    title: '备注',
    key: 'remarks',
    width: 200,
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
