import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取提现列表
 */
export function getWithdrawList(params) {
  return Alova.Post('/admin/withdraw/list',params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除提现记录
 */
export function deleteWithdraw(id) {
  return Alova.Post('/admin/withdraw/del', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 锁定提现记录
 */
export function lockWithdraw(id) {
  return Alova.Post('/admin/withdraw/lock', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 解锁提现记录
 */
export function unlockWithdraw(id) {
  return Alova.Post('/admin/withdraw/unlock', { id }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 审核提现
 */
export function auditWithdraw(params) {
  return Alova.Post('/admin/withdraw/audit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 审核提现（编辑状态和备注）
 */
export function withdrawAudit(params) {
  return Alova.Post('/admin/withdraw/audit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑提现记录
 */
export function editWithdraw(params) {
  return Alova.Post('/admin/withdraw/edit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取待处理提现消息数量
 */
export function getWithdrawCount() {
  return Alova.Post<{
    code: number;
    msg: string;
    data: any;
  }>('/admin/index/withdrawCount', {}, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 更新提现系统备注
 */
export function updateWithdrawSystemRemarks(id: number, system_remarks: string) {
  return Alova.Post<{
    code: number;
    msg: string;
    data: any;
  }>('/admin/withdraw/withdrawSystemRemarks', {
    id,
    system_remarks
  }, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}