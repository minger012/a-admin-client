import { h } from 'vue';
import { NTag } from 'naive-ui';
import ExpandedRow from './ExpandedRow.vue';

export interface PlanOrderItem {
  id: number;
  uid: number;
  admin_id: number;
  plan_name: string;
  plan_id: number;
  goods_name: string;
  goods_id: number;
  cid: number;
  order_no: string;
  fb_id: string;
  form: number;
  money: number;
  schedule: number;
  putIn: number;
  wait_putIn: number;
  profit: number;
  remarks: string | null;
  show_num: number;
  click_num: number;
  click_price: number;
  click_money: number;
  click_rate: number;
  rate: number;
  cd: number;
  min: number;
  max: number;
  state: number;
  create_time: number;
  start_time: number;
  update_time: number;
  username: string;
  short_name: string;
  
  // 扩展字段
  group_count: number;
  item_index: number;
  is_group_first: boolean;
}

// 状态映射
const stateMap = {
  0: '待投放',
  1: '匹配中',
  2: '投放中',
  3: '投放失败',
  4: '等待结算',
  5: '结算成功',
};

// 状态颜色映射
const stateTypeMap = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'error',
  4: 'default',
  5: 'success',
};

export const columns: any[] = [
  {
    type: 'expand' as const,
    renderExpand: (rowData: PlanOrderItem) => {
      return h(ExpandedRow, { data: rowData });
    }
  },
  {
    title: '计划ID',
    key: 'plan_id',
    width: 100,
  },
  {
    title: '联单组',
    key: 'fb_id',
    width: 280,
    className:'td-bg',
    render(row) {
      return h('div', [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', `ID: ${row.fb_id}`),
          h(NTag, {
            type: 'primary',
            size: 'small',
            bordered: true,
          }, {
            default: () => `共${row.group_count}条`
          })
        ]),
        h('div', { class: 'mt-1' }, [
          h(NTag, {
            type: 'success',
            size: 'small',
            bordered: true,
          }, {
            default: () => `${row.item_index}/${row.group_count}`
          }),
          row.state == 4 || row.state == 5 ?
          h(NTag, {
            type: 'primary',
            size: 'small',
            bordered: true,
            style: { marginLeft: '8px' },
          }, {
            default: () => `已完成`
          }) : null
        ])
      ]);
    },
  },
  {
    title: '用户ID',
    key: 'uid',
    width: 100,
    className:'td-bg',
  },
  {
    title: '用户简称',
    key: 'short_name',
    width: 120,
    className:'td-bg',
  },
  {
    title: '订单编号',
    key: 'order_no',
    width: 240,
    className:'td-bg',
  },
  {
    title: '计划名称',
    key: 'plan_name',
    width: 180,
    className:'td-bg',
  },
  {
    title: '产品名称',
    key: 'goods_name',
    width: 180,
    className:'td-bg',
  },
  {
    title: '前台投放',
    key: 'form',
    width: 100,
    className:'td-bg',
    render(row) {
      return row.form === 1 ? '是' : '否';
    },
  },
  {
    title: '投放金额',
    key: 'money',
    width: 100,
    className:'td-bg',
    render(row) {
      return row.money;
    },
  },
  {
    title: '投放进度',
    key: 'schedule',
    width: 100,
    className:'td-bg',
    render(row) {
      return `${row.schedule}%`;
    },
  },
  {
    title: '已投放',
    key: 'putIn',
    width: 100,
    className:'td-bg',
    render(row) {
      return row.putIn;
    },
  },
  {
    title: '待投放',
    key: 'wait_putIn',
    width: 100,
    className:'td-bg',
    render(row) {
      return row.wait_putIn;
    },
  },
  {
    title: '利润',
    key: 'profit',
    width: 100,
    className:'td-bg',
    render(row) {
      return row.profit;
    },
  },
  {
    title: '投放利润率',
    key: 'rate',
    width: 120,
    className:'td-bg',
    render(row) {
      // 根据利润率值设置颜色
      let type: any = 'default';
      if (row.rate >= 80) {
        type = 'success';  // 高利润率 - 绿色
      } else if (row.rate >= 50) {
        type = 'info';     // 中等利润率 - 蓝色
      } else if (row.rate >= 20) {
        type = 'warning';  // 低利润率 - 黄色
      } else {
        type = 'error';    // 极低利润率 - 红色
      }
      
      return h(NTag, {
        type,
        bordered: true,
        size:'small',
      }, {
        default: () => `${row.rate}%`
      });
    },
  },
  {
    title: '投放状态',
    key: 'state',
    width: 110,
    fixed:'right',
    className:'td-bg',
    render(row) {
      return h(NTag, {
        type: stateTypeMap[row.state] || 'default',
        size:'small',
        bordered: true,
      }, {
        default: () => stateMap[row.state] || '未知'
      });
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 160,
    className:'td-bg',
    render(row) {
      return new Date(row.update_time * 1000).toLocaleString('zh-CN');
    },
  },
];
