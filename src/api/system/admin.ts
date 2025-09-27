import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 管理员列表
 */
export function getAdminList(params) {
  return Alova.Post('/admin/admin/list', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 添加管理员
 */
export function addAdmin(params) {
  return Alova.Post('/admin/admin/add', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑管理员
 */
export function editAdmin(params) {
  return Alova.Post('/admin/admin/edit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除管理员
 */
export function deleteAdmin(username) {
  return Alova.Post('/admin/admin/del', { username }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
