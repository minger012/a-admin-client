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
  return Alova.Post('/admin/user/list', params,{
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
  return Alova.Post('/admin/user/edit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 修改登录密码
 */
export function editUserPwd(params) {
  return Alova.Post('/admin/user/pwdEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 修改支付密码
 */
export function editUserPayPwd(params) {
  return Alova.Post('/admin/user/payPwdEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 修改提现方式
 */
export function editUserBank(params) {
  return Alova.Post('/admin/user/bankEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户充值
 */
export function userRecharge(params) {
  return Alova.Post('/admin/user/recharge', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户扣款
 */
export function userMoneySub(params) {
  return Alova.Post('/admin/user/userMoneySub', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 发优惠券
 */
export function userAddCoupon(params) {
  return Alova.Post('/admin/user/addCoupon', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

