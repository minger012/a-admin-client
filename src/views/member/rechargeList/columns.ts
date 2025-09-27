import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

export interface RechargeListData {
  id: number;
  uid: number;
  pay_count: number;
  name: string;
  remarks: string;
  money: number;
  type: number;
  before_money: number;
  state: number;
  create_time: number;
  admin_name: string;
}

// Status mapping
const stateMap = {
  0: '未审核',
  1: '已审核',
};

// Status color mapping
const stateColorMap = {
  0: 'warning',
  1: 'success',
};

// Type mapping
const typeMap = {
  1: '后台充值',
  2: '会员',
  3: '彩金',
};

export const columns: BasicColumn<RechargeListData>[] = [
  {
    title: '序号',
    key: 'id',
    width: 80,
  },
  {
    title: '账号',
    key: 'username',
    width: 120,
  },
  {
    title: '充值笔数',
    key: 'pay_count',
    width: 100,
  },
  {
    title: '持卡人姓名',
    key: 'name',
    width: 120,
  },
  {
    title: '用户备注',
    key: 'remarks',
    width: 180,
  },
  {
    title: '充值金额',
    key: 'money',
    width: 120,
    render(record) {
      return h('span', {
        style: {
          color: 'red',
        },
      }, { default: () => `${record.money.toFixed(2)}` });
    },
  },
  {
    title: '变更前金额',
    key: 'before_money',
    width: 120,
    render(record) {
      return h('span', {}, { default: () => `${record.before_money.toFixed(2)}` });
    },
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(record) {
      return h('div', { style: { display: 'flex', alignItems: 'center' } }, {
        default: () => [
          h('span', { style: { color: 'red', marginRight: '5px', fontSize: '16px' } }, '•'),
          h('span', {}, typeMap[record.type] || '-')
        ]
      });
    },
  },
  {
    title: '充值渠道',
    key: 'channel',
    width: 120,
  },
  {
    title: '订单编号',
    key: 'order_no',
    width: 180,
  },
  {
    title: '操作人',
    key: 'admin_name',
    width: 120,
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(record) {
      return h(
        NTag,
        {
          type: stateColorMap[record.state],
        },
        {
          default: () => stateMap[record.state],
        }
      );
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width:160,
    render(record) {
      return h('span', {}, { 
        default: () => new Date(record.create_time * 1000).toLocaleString() 
      });
    },
  },
];
