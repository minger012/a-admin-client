import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 商品列表
 */
export function goodsList(params) {
  return Alova.Post('/admin/goods/goodsList', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 添加商品
 */
export function goodsAdd(params) {
  return Alova.Post('/admin/goods/goodsAdd', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑商品
 */
export function goodsEdit(params) {
  return Alova.Post('/admin/goods/goodsEdit', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除商品
 */
export function goodsDel(id) {
  return Alova.Post('/admin/goods/goodsDel', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}
