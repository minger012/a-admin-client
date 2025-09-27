import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return Alova.Get<InResult>('/admin_info', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return Alova.Post<InResult>(
    '/admin/login/login',
    params,
    {
      meta: {
        isReturnNativeResponse: true,
      },
    }
  );
}

/**
 * @description: 用户修改密码
 */
export function changePassword(params, uid) {
  return Alova.Post(`/user/u${uid}/changepw`, { params });
}

/**
 * @description: 用户登出
 */
export function logout(params) {
  return Alova.Post('/login/logout', {
    params,
  });
}

/**
 * @description: 获取会员列表
 */
export function getUserList(params) {
  return Alova.Post('/admin/user/userList', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取在线会员列表
 */
export function getOnlineUserList(params) {
  return Alova.Post('/admin/user/onlineUserList', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 强制用户下线
 */
export function forceLogout(params) {
  return Alova.Post('/admin/user/forceLogout', params,{
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑会员信息
 */
export function editUser(params) {
  return Alova.Post('/admin/user/userEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
/**
 * @description: 修改会员密码
 */
export function editUserPwd(params) {
  return Alova.Post('/admin/user/userPwdEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}


/**
 * @description: 新增会员信息
 */
export function addUser(params) {
  return Alova.Post('/admin/user/userAdd', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

