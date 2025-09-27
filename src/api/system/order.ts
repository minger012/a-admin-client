import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取充值列表
 */
export function getOrderList(params) {
  return Alova.Post('/admin/order/orderList', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取彩票注单列表
 */
export function getLotteryOrderList(params) {
  return Alova.Post('/admin/order/lotteryOrderList', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除充值记录
 */
export function deleteOrder(id) {
  return Alova.Post('/admin/order/orderDel', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 撤销彩票注单
 */
export function cancelLotteryOrder(id) {
  return Alova.Post('/admin/order/lotteryOrderCancel', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑彩票注单
 */
export function editLotteryOrder(params) {
  return Alova.Post('/admin/order/lotteryOrderEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
