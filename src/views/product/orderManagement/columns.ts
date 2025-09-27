import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';
import { bigSmallMap, singleDoubleMap } from '@/constants/common';

export interface OrderManagementData {
  id: number;
  order_no: string;
  goods_id: number;
  period_no: string;
  username: string;
  uid: number;
  code: string;
  open_money: number;
  count: number;
  money: number;
  status: number;
  create_time: number;
  goods_name: string;
  remark?: string; // 用户备注
}

// Status mapping
export const statusMap = {
  0: '未开奖',
  1: '已中奖',
  2: '未中奖',
  3: '已撤单',
};

// Status color mapping
export const statusColorMap = {
  0: 'warning',
  1: 'success',
  2: 'error',
  3: 'info',
};


export const columns: BasicColumn<OrderManagementData>[] = [
  {
    title: '订单号',
    key: 'order_no',
    width: 150,
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '用户备注',
    key: 'remark',
    width: 150,
    render(record) {
      return h('span', {}, { default: () => record.remark || '-' });
    },
  },
  {
    title: '产品名称',
    key: 'goods_name',
    width: 150,
  },
  {
    title: '期号',
    key: 'period_no',
    width: 120,
  },
  {
    title: '匹配数据',
    key: 'code',
    width: 200,
    render(record) {
      const codes = record.code.split(',');
      return h(
        'span',
        {},
        { 
          default: () => codes.map(code => {
            // 区分大小和单双码值
            if (code === 'big' || code === 'small') {
              return bigSmallMap[code] || code;
            } else if (code === 'single' || code === 'double') {
              return singleDoubleMap[code] || code;
            } else {
              return code;
            }
          }).join(',') 
        }
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(record) {
      return h(
        NTag,
        {
          type: statusColorMap[record.status],
        },
        {
          default: () => statusMap[record.status],
        }
      );
    },
  },
  {
    title: '注数(注)',
    key: 'count',
    width: 80,
    render(record) {
      const codes = record.code.split(',');
      return codes.length
    },
  },
  {
    title: '下单总金额',
    key: 'money',
    width: 120,
    render(record) {
      return h('span', {}, { default: () => `${record.money.toFixed(2)}` });
    },
  },
  {
    title: '中奖金额',
    key: 'open_money',
    width: 120,
    render(record) {
      return h('span', {}, { default: () => `${record.open_money.toFixed(2)}` });
    },
  },
  {
    title: '盈利(实际总获利金额)',
    key: 'profit',
    width: 140,
    render(record) {
      const profit = record.open_money - record.money;
      const color = profit >= 0 ? '#18a058' : '#d03050';
      return h(
        'span',
        { style: `color: ${color}; font-weight: bold;` },
        { default: () => `${profit.toFixed(2)}` }
      );
    },
  },
];
