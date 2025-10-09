import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

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
    expandable: (rowData: PlanOrderItem) => rowData.is_group_first,
    renderExpand: (rowData: PlanOrderItem) => {
      return h('div', { style: { padding: '16px', backgroundColor: '#f5f5f5' } }, [
        // 联单基本信息
        h('div', { style: { marginBottom: '16px' } }, [
          h('div', { style: { color: '#1890ff', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' } }, '联单基本信息'),
          h('div', { style: { backgroundColor: '#fff', padding: '12px', borderRadius: '4px' } }, [
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } }, [
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '联单编ID: '),
                h('span', { style: { fontWeight: '500' } }, rowData.fb_id)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '计划ID: '),
                h('span', { style: { fontWeight: '500' } }, rowData.plan_id)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '本组记录数: '),
                h('span', { style: { fontWeight: '500', color: '#52c41a' } }, `${rowData.item_index}`)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '联单序号: '),
                h('span', { style: { fontWeight: '500' } }, rowData.item_index)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '用户: '),
                h('span', { style: { fontWeight: '500' } }, rowData.username || '-')
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '金额范围: '),
                h('span', { style: { fontWeight: '500' } }, '-')
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '联单总数: '),
                h('span', { style: { fontWeight: '500' } }, rowData.group_count)
              ]),
              h('div', { style: { gridColumn: 'span 2' } }, [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '订单编号: '),
                h('span', { style: { fontWeight: '500' } }, rowData.order_no)
              ]),
            ])
          ])
        ]),
        
        // 控制数据
        h('div', { style: { marginBottom: '16px' } }, [
          h('div', { style: { color: '#666', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' } }, '控制数据'),
          h('div', { style: { backgroundColor: '#fff', padding: '12px', borderRadius: '4px' } }, [
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } }, [
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '控制次数: '),
                h('span', { style: { fontWeight: '500' } }, `${Math.floor(rowData.cd / 3600)}小时`)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '已绑定金额: '),
                h('span', { style: { fontWeight: '500' } }, rowData.putIn)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '利润金额: '),
                h('span', { style: { fontWeight: '500' } }, rowData.profit)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '控制金额: '),
                h('span', { style: { fontWeight: '500' } }, rowData.money)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '待绑定金额: '),
                h('span', { style: { fontWeight: '500' } }, rowData.wait_putIn)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '投放利润率: '),
                h('span', { style: { fontWeight: '500', color: rowData.rate === 0 ? '#ff4d4f' : '#52c41a' } }, `${rowData.rate}%`)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '控制进度: '),
                h('span', { style: { fontWeight: '500' } }, rowData.schedule)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '待绑定金额: '),
                h('span', { style: { fontWeight: '500' } }, rowData.wait_putIn)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '消耗利润: '),
                h('span', { style: { fontWeight: '500', color: '#ff4d4f' } }, (rowData.profit > 0 ? `-${rowData.profit}` : 0))
              ]),
              h('div', { style: { gridColumn: 'span 2' } }, [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '最后用户上报的信息: '),
                h('span', { style: { fontWeight: '500' } }, '否')
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '广告接入: '),
                h('span', { style: { fontWeight: '500' } }, rowData.form === 1 ? 'H' : '')
              ]),
            ])
          ])
        ]),
        
        // 效果数据
        h('div', [
          h('div', { style: { color: '#666', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' } }, '效果数据'),
          h('div', { style: { backgroundColor: '#fff', padding: '12px', borderRadius: '4px' } }, [
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } }, [
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '需完成: '),
                h('span', { style: { fontWeight: '500' } }, rowData.show_num)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '点击率: '),
                h('span', { style: { fontWeight: '500' } }, `${(rowData.click_rate || 0).toFixed(2)}%`)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '更新时间: '),
                h('span', { style: { fontWeight: '500' } }, new Date(rowData.update_time * 1000).toLocaleString('zh-CN'))
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '点击数: '),
                h('span', { style: { fontWeight: '500' } }, rowData.click_num)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '优惠券: '),
                h('span', { style: { fontWeight: '500' } }, '未使用')
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '点击单价: '),
                h('span', { style: { fontWeight: '500' } }, rowData.click_price)
              ]),
              h('div', [
                h('span', { style: { color: '#666', fontSize: '12px' } }, '官方确认: '),
                h('span', { style: { fontWeight: '500' } }, '否')
              ]),
            ])
          ])
        ]),
      ]);
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
    width: 200,
    render(row) {
      return h('div', [
        h('div', { class: 'text-xs text-gray-500' }, `ID: ${row.fb_id}`),
        h('div', { class: 'mt-1' }, [
          h(NTag, {
            type: 'success',
            size: 'small',
            bordered: false,
          }, {
            default: () => `${row.item_index}/${row.group_count} ${stateMap[row.state] || '未知'}`
          })
        ])
      ]);
    },
  },
  {
    title: '用户ID',
    key: 'uid',
    width: 100,
  },
  {
    title: '用户简称',
    key: 'short_name',
    width: 120,
  },
  {
    title: '订单编号',
    key: 'order_no',
    width: 200,
  },
  {
    title: '计划名称',
    key: 'plan_name',
    width: 150,
  },
  {
    title: '产品名称',
    key: 'goods_name',
    width: 150,
  },
  {
    title: '前台投放',
    key: 'form',
    width: 100,
    render(row) {
      return row.form === 1 ? '是' : '否';
    },
  },
  {
    title: '投放金额',
    key: 'money',
    width: 120,
    render(row) {
      return row.money;
    },
  },
  {
    title: '投放进度',
    key: 'schedule',
    width: 120,
    render(row) {
      return `${row.schedule}%`;
    },
  },
  {
    title: '已投放',
    key: 'putIn',
    width: 120,
    render(row) {
      return row.putIn;
    },
  },
  {
    title: '待投放',
    key: 'wait_putIn',
    width: 120,
    render(row) {
      return row.wait_putIn;
    },
  },
  {
    title: '利润',
    key: 'profit',
    width: 120,
    render(row) {
      return row.profit;
    },
  },
  {
    title: '投放利润率',
    key: 'rate',
    width: 120,
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
        bordered: false,
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
    render(row) {
      return h(NTag, {
        type: stateTypeMap[row.state] || 'default',
        bordered: false,
      }, {
        default: () => stateMap[row.state] || '未知'
      });
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 160,
    render(row) {
      return new Date(row.update_time * 1000).toLocaleString('zh-CN');
    },
  },
];
