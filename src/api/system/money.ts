import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 给用户加款
 */
export function userMoneyAdd(params) {
  return Alova.Post('/admin/order/userMoneyAdd', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 给用户扣款
 */
export function userMoneySub(params) {
  return Alova.Post('/admin/order/userMoneySub', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
