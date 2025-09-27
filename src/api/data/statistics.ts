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
