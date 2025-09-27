import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取在线用户数量
 */
export function getOnlineUserCount() {
  return Alova.Get('/admin/index/onlineUserCount', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
