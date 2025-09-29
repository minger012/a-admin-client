import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 授权码列表
 */
export function codeList(params) {
  return Alova.Post('/admin/code/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 添加授权码
 */
export function codeAdd(params) {
  return Alova.Post('/admin/code/add', params, {
    meta: { isReturnNativeResponse: true },
  });
}
