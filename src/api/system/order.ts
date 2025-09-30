import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取充值列表
 */
export function getOrderList(params) {
  return Alova.Post('/admin/order/list', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}


/**
 * @description: 删除充值记录
 */
export function deleteOrder(id) {
  return Alova.Post('/admin/order/del', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
