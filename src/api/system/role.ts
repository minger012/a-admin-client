import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 角色列表
 */
export function getRoleList(params) {
  return Alova.Get('/admin/adminAuth/list', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 添加角色
 */
export function addRole(params) {
  return Alova.Post('/admin/adminAuth/add', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑角色
 */
export function editRole(params) {
  return Alova.Post('/admin/adminAuth/edit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除角色
 */
export function deleteRole(username) {
  return Alova.Post('/admin/adminAuth/del', { username }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
