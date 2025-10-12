import { Alova } from '@/utils/http/alova/index';

/**
 * 管理员授权码邀请统计
 */
export interface AdminWelcomeStatsData {
  // 汇总数据
  totalRegisterCount: number; // 总注册用户数
  dayAverageCount: number; // 日均注册数
  // 月份统计
  monthStats: {
    month: string; // 月份，如 "2025年9月"
    registerCount: number; // 注册人数
    percentage: number; // 占比
  }[];
  // 日期明细
  dayDetails: {
    id: number;
    date: string; // 日期
    year: number;
    month: number;
    day: number;
    week: number;
    registerCount: number; // 注册人数
  }[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/**
 * 管理员下用户产品统计
 */
export interface AdminUserProductStatsData {
  // 汇总指标
  totalOrderCount: number; // 总充值次数
  totalAmount: number; // 总充值金额
  dayAverageAmount: number; // 日均充值金额
  // 充值类型统计
  typeStats: {
    typeName: string; // 充值类型
    orderCount: number; // 充值笔数
    amount: number; // 充值金额
    percentage: number; // 占比
  }[];
  // 充值状态统计
  statusStats: {
    status: string; // 充值状态（成功/失败）
    orderCount: number; // 充值笔数
    amount: number; // 充值金额
    percentage: number; // 占比
  }[];
  // 日期明细
  dayDetails: {
    id: number;
    date: string;
    typeName: string;
    status: string;
    orderCount: number;
    amount: number;
  }[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/**
 * 管理员下用户提现统计
 */
export interface AdminUserWithdrawStatsData {
  // 汇总指标
  totalWithdrawCount: number; // 提现笔数
  totalWithdrawAmount: number; // 提现总金额
  dayAverageAmount: number; // 日均提现金额
  // 提现状态统计
  statusStats: {
    status: string; // 提现状态
    withdrawCount: number; // 提现笔数
    amount: number; // 提现金额
    percentage: number; // 占比
  }[];
  // 日期明细
  dayDetails: {
    id: number;
    date: string;
    status: string;
    withdrawCount: number;
    completedAmount: number; // 已完成提现金额
    percentage: number; // 占比
  }[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/**
 * 用户产品统计
 */
export interface UserProductStatsData {
  // 汇总指标
  totalOrderCount: number; // 总产品次数
  totalAmount: number; // 总产品金额
  // 排行榜
  topUsers: {
    userId: number;
    fbId: string;
    orderCount: number; // 托管次数
    totalAmount: number; // 托管金额
  }[];
  // 日期明细
  dayDetails: {
    id: number;
    date: string;
    userId: number;
    username: string;
    fbId: string;
    amount: number; // 充值金额
    paymentMethod: string; // 充值方式
    status: string; // 状态
    adminRemark: string; // 管理员备注
    userRemark: string; // 用户备注
    createTime: string; // 创建时间
  }[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/**
 * 用户提现统计
 */
export interface UserWithdrawStatsData {
  // 汇总指标
  totalWithdrawCount: number; // 总提现次数
  totalWithdrawAmount: number; // 总提现金额
  // 排行榜
  topUsers: {
    userId: number;
    fbId: string;
    withdrawCount: number; // 托管次数
    totalAmount: number; // 托管金额
  }[];
  // 日期明细
  dayDetails: {
    id: number;
    userId: number;
    username: string;
    fbId: string;
    amount: number; // 提现金额
    status: string; // 状态
    adminRemark: string; // 管理员备注
    userRemark: string; // 用户备注
    createTime: string; // 创建时间
  }[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/**
 * 通用请求参数
 */
export interface StatsParams {
  page: string;
  pageSize: string;
  adminId?: number; // 管理员ID
  timeType?: string; // 时间类型: '今日' | '本周' | '本月' | '自定义'
  sTime?: number; // 开始时间戳（秒）
  eTime?: number; // 结束时间戳（秒）
}

/**
 * 授权码使用统计请求参数
 */
export interface CodeUsageStatsParams {
  limit: string; // 每页记录数
  page: string; // 当前页码
  start_date?: number; // 开始时间
  end_date?: number; // 结束时间
  view_type?: 'summary' | 'detail'; // 视图类型
  admin_username?: string; // 管理员用户名
}

/**
 * @description: 管理员授权码邀请统计
 */
export function getAdminWelcomeStats(params: StatsParams) {
  return Alova.Post<{ code: number; msg: string; data: AdminWelcomeStatsData }>(
    '/admin/statistics/welcome',
    params,
    {
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 管理员下用户产品统计
 */
export function getAdminUserProductStats(params: StatsParams) {
  return Alova.Post<{ code: number; msg: string; data: AdminUserProductStatsData }>(
    '/admin/statistics/userProduct',
    params,
    {
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 管理员下用户提现统计
 */
export function getAdminUserWithdrawStats(params: StatsParams) {
  return Alova.Post<{ code: number; msg: string; data: AdminUserWithdrawStatsData }>(
    '/admin/statistics/userWithdraw',
    params,
    {
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 用户产品统计
 */
export function getUserProductStats(params: StatsParams) {
  return Alova.Post<{ code: number; msg: string; data: UserProductStatsData }>(
    '/admin/statistics/product',
    params,
    {
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 用户提现统计
 */
export function getUserWithdrawStats(params: StatsParams) {
  return Alova.Post<{ code: number; msg: string; data: UserWithdrawStatsData }>(
    '/admin/statistics/withdraw',
    params,
    {
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取授权码使用统计数据
 */
export function getCodeUsageStats(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getCodeUsageStats',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取单独的明细数据（用于明细视图的分页）
 */
export function getCodeUsageDetails(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getCodeUsageDetails',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取用户充值统计数据
 */
export function getRechargeStats(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getRechargeStats',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取充值明细数据（用于明细视图的分页）
 */
export function getRechargeDetails(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getRechargeDetails',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取用户提现统计数据
 */
export function getWithdrawStats(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getWithdrawStats',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取提现明细数据（用于明细视图的分页）
 */
export function getWithdrawDetails(params: CodeUsageStatsParams) {
  return Alova.Post(
    '/admin/index/getWithdrawDetails',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取用户充值明细统计数据
 */
export function getRechargeDetailStats(params: any) {
  return Alova.Post(
    '/admin/index/getRechargeDetailStats',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}

/**
 * @description: 获取用户提现明细统计数据
 */
export function getWithdrawDetailStats(params: any) {
  return Alova.Post(
    '/admin/index/getWithdrawDetailStats',
    params,
    {
      localCache: null, // 禁用缓存
      meta: { isReturnNativeResponse: true },
    }
  );
}
