import { h } from 'vue';
import { NTag } from 'naive-ui';

export const columns = [
  {
    title: '账号',
    key: 'username',
    width: 120,
  },
  {
    title: '团队总人数',
    key: 'mbs_count',
    width: 120,
  },
  {
    title: '注册人数',
    key: 'mbs_count',
    width: 120,
  },
  {
    title: '充值金额',
    key: 'order_money',
    width: 120,
  },
  {
    title: '充值人数',
    key: 'order_uidCount',
    width: 120,
  },
  {
    title: '充值笔数',
    key: 'order_count',
    width: 120,
  },
  {
    title: '首充金额',
    key: 'recharge_money_first',
    width: 120,
    render(row) {
      return h('div', [
        `${row.recharge_money[0] || 0}`,
      ]);
    }
  },
  {
    title: '首充人数',
    key: 'recharge_num_first',
    width: 120,
    render(row) {
      return h('div', [
        `${row.recharge_num[0] || 0}`,
      ]);
    }
  },
  {
    title: '提现金额',
    key: 'withdraw_money',
    width: 120,
  },
  {
    title: '提现人数',
    key: 'withdraw_uidCount',
    width: 120,
  },
  {
    title: '提现笔数',
    key: 'withdraw_count',
    width: 120,
  },
  {
    title: '投注总额',
    key: 'lottery_money',
    width: 120,
  },
  {
    title: '中奖金额',
    key: 'lottery_open_money',
    width: 120,
  },
  {
    title: '投注输赢',
    key: 'lottery_win_loss',
    width: 120,
    render(row) {
      const winLoss = row.lottery_open_money - row.lottery_money;
      return h(
        NTag,
        {
          type: winLoss >= 0 ? 'success' : 'error',
        },
        { default: () => winLoss.toFixed(2) }
      );
    }
  },
  {
    title: '投注人数',
    key: 'lottery_uidCount',
    width: 120,
  },
];

export const schemas = [
  {
    field: 'username',
    component: 'NInput',
    label: '账号',
    componentProps: {
      placeholder: '请输入账号',
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'date',
    component: 'NDatePicker',
    label: '日期',
    componentProps: {
      type: 'daterange',
      clearable: true,
      shortcuts: {
        今天: [new Date(), new Date()],
        昨天: (): any => {
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          return [yesterday, yesterday];
        },
        最近一周: (): any => {
          const today = new Date();
          const lastWeek = new Date();
          lastWeek.setDate(today.getDate() - 7);
          return [lastWeek, today];
        },
        最近一个月: (): any => {
          const today = new Date();
          const lastMonth = new Date();
          lastMonth.setMonth(today.getMonth() - 1);
          return [lastMonth, today];
        },
        最近三个月: (): any => {
          const today = new Date();
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          return [threeMonthsAgo, today];
        },
      },
    },
  },
];

export const actionColumn = {
  width: 0, // 设为0可以不显示操作列
  title: '操作',
  key: 'action',
  fixed: 'right',
  render: () => {
    return h('div', {});
  },
};
