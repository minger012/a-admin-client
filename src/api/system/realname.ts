import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取实名认证列表
 */
export function getRealnameList(params) {
  return Alova.Post('/admin/Realname/list', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 审核实名认证
 */
export function auditRealname(params) {
  return Alova.Post('/admin/Realname/audit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取实名认证详情
 */
export function getRealnameDetail(params) {
  return Alova.Post('/admin/Realname/detail', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
