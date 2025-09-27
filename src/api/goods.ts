import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 商品列表
 */
export function goodsList(params) {
  return Alova.Post('/admin/goods/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 添加商品
 */
export function goodsAdd(params) {
  return Alova.Post('/admin/goods/add', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑商品
 */
export function goodsEdit(params) {
  return Alova.Post('/admin/goods/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除商品
 */
export function goodsDel(id) {
  return Alova.Post('/admin/goods/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}
