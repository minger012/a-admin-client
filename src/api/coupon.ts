import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 优惠券列表
 */
export function couponList(params) {
  return Alova.Post('/admin/coupon/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 添加优惠券
 */
export function couponAdd(params) {
  return Alova.Post('/admin/coupon/add', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑优惠券
 */
export function couponEdit(params) {
  return Alova.Post('/admin/coupon/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除优惠券
 */
export function couponDel(id) {
  return Alova.Post('/admin/coupon/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 用户优惠券列表
 */
export function userCouponList(params) {
  return Alova.Post('/admin/userCoupon/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}
