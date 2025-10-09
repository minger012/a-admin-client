import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 计划列表
 */
export function planList(params) {
  return Alova.Post('/admin/plan/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 添加计划
 */
export function planAdd(params) {
  return Alova.Post('/admin/plan/add', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑计划
 */
export function planEdit(params) {
  return Alova.Post('/admin/plan/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除计划
 */
export function planDel(id) {
  return Alova.Post('/admin/plan/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 用户计划订单列表
 */
export function planOrderList(params) {
  return Alova.Post('/admin/planOrder/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑用户计划订单
 */
export function planOrderEdit(params) {
  return Alova.Post('/admin/planOrder/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除用户计划订单
 */
export function planOrderDel(id) {
  return Alova.Post('/admin/planOrder/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}
