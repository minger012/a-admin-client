import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取数据中心统计数据
 */
export function getStatistics(params) {
  return Alova.Post('/admin/data/statistics', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取注册统计数据
 */
export function getRegisterStats(params) {
  return Alova.Post('/admin/data/register', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取提现统计数据
 */
export function getWithdrawStats(params) {
  return Alova.Post('/admin/data/withdraw', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
