import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 管理员列表
 */
export function getAdminList(params) {
  return Alova.Post('/admin/admin/adminList', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 添加管理员
 */
export function addAdmin(params) {
  return Alova.Post('/admin/admin/adminAdd', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑管理员
 */
export function editAdmin(params) {
  return Alova.Post('/admin/admin/adminEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除管理员
 */
export function deleteAdmin(username) {
  return Alova.Post('/admin/admin/adminDel', { username }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
