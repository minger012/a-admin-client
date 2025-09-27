import { Alova } from '@/utils/http/alova/index';

// 定义请求参数接口
export interface ConsoleParams {
  sTime?: number; // 开始时间 时间戳
  eTime?: number; // 结束时间 时间戳
}

// 定义今日充值数据结构
export interface TodayOrder {
  money: number; // 金额
  uidCount: number; // 人数
  firstMoney: number; // 首充金额
  firstCount: number; // 首充人数
}

// 定义今日提现数据结构
export interface TodayWithdraw {
  money: number; // 今天提现总额
  uidCount: number; // 人数
  count: number; // 今天笔数
}

// 定义今日彩票订单数据结构
export interface TodayLotteryOrder {
  uidCount: number; // 人数
  money: number; // 今天总额
  openMoney: number; // 开奖总额
}

// 定义今日用户数据结构
export interface TodayUser {
  CreateCount: number; // 新用户
}

// 定义总数据结构
export interface TotalData {
  uidCount: number; // 总人数
  money: number; // 充值
  withdraw: number; // 提现
  orderMoney: number; // 订单总额
  orderOpenMoney: number; // 开奖总额
}

// 定义接口返回的数据结构
export interface DashboardData {
  todayOrder: TodayOrder;
  todayWithdraw: TodayWithdraw;
  todayLotteryOrder: TodayLotteryOrder;
  todayUser: TodayUser;
  totalData: TotalData;
}

// 获取主控台信息
export function getConsoleInfo(params?: ConsoleParams) {
  return Alova.Post<{
    code: number;
    msg: string;
    data: DashboardData;
  }>('/admin/index/index', params,{
    meta: { isReturnNativeResponse: true },
  });
}
