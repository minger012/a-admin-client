import { h } from 'vue';
import { NTag } from 'naive-ui';

export interface CouponListData {
  id: number;
  name: string;
  type: number;
  intro?: string;
  is_new: number;
  discount: number;
  discount_amount?: number;
  min: number;
  max: number;
  expir_type?: number;
  expir_day?: number;
  start_time: number;
  end_time: number;
  state: number;
  create_time: number;
  update_time: number;
}

// 优惠券类型选项
export const typeOptions = [
  { label: '增值券', value: 1 },
  { label: '抵扣券', value: 2 },
  { label: '团队券', value: 3 },
  { label: '自定义', value: 4 },
  { label: '固定金额', value: 5 },
];

// 状态选项
export const stateOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 1 },
  { label: '停用', value: 2 },
];

// 是否新人券选项
export const isNewOptions = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

// 优惠券类型渲染
function renderType(type: number) {
  const typeMap = {
    1: { text: '增值券', type: 'success' },
    2: { text: '抵扣券', type: 'warning' },
    3: { text: '团队券', type: 'info' },
    4: { text: '自定义', type: 'default' },
    5: { text: '固定金额', type: 'error' },
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

// 状态渲染
function renderState(state: number) {
  return h(
    NTag,
    {
      type: state === 1 ? 'success' : 'error',
      bordered: false,
    },
    {
      default: () => (state === 1 ? '正常' : '停用'),
    }
  );
}

// 是否新人券渲染
function renderIsNew(is_new: number) {
  return h(
    NTag,
    {
      type: is_new === 1 ? 'warning' : 'default',
      bordered: false,
    },
    {
      default: () => (is_new === 1 ? '新人券' : '普通券'),
    }
  );
}

export const columns = [
  {
    type: 'selection',
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '优惠券名称',
    key: 'name',
    width: 150,
  },
  {
    title: '优惠券描述',
    key: 'intro',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '是否新人券',
    key: 'is_new',
    width: 120,
    render(row) {
      return renderIsNew(row.is_new);
    },
  },
  {
    title: '优惠券类型',
    key: 'type',
    width: 120,
    render(row) {
      return renderType(row.type);
    },
  },
  {
    title: '折扣百分比',
    key: 'discount',
    width: 120,
    render(row) {
      return `${row.type != 5 ? row.discount + '%' : '-'}`;
    },
  },
  {
    title: '折扣金额',
    key: 'discount_amount',
    width: 120,
    render(row) {
      return `${row.type == 5 ? '¥' + row.discount_amount : '-'}`;
    },
  },
  {
    title: '使用最低金额',
    key: 'min',
    width: 120,
    render(row) {
      return row.min ? `¥${row.min}` : '无限制';
    },
  },
  {
    title: '使用最高金额',
    key: 'max',
    width: 120,
    render(row) {
      return row.max ? `¥${row.max}` : '无限制';
    },
  },
  {
    title: '生效时间',
    key: 'start_time',
    width: 160,
    render(row) {
      return row.expir_type == 2 ? row.start_time ? new Date(row.start_time * 1000).toLocaleString() : '-' : '-';
    },
  },
  {
    title: '过期时间',
    key: 'end_time',
    width: 160,
    render(row) {
      return row.expir_type == 2 ? row.end_time ? new Date(row.end_time * 1000).toLocaleString() : '-' : '-';
    },
  },
  {
    title: '用户券有效天数',
    key: 'expir_day',
    width: 140,
    render(row) {
      return row.expir_type == 1 ? row.expir_day + '天' : '无限制';
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
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(row) {
      return row.create_time ? new Date(row.create_time * 1000).toLocaleString() : '-';
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
];
