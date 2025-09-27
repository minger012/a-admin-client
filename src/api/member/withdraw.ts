import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取提现列表
 */
export function getWithdrawList(params) {
  return Alova.Post('/admin/withdraw/withdrawList',params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 删除提现记录
 */
export function deleteWithdraw(id) {
  return Alova.Post('/admin/withdraw/withdrawDel', { id }, {
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
 * @description: 审核提现新接口
 */
export function withdrawAudit(params) {
  return Alova.Post('/admin/withdraw/withdrawAudit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * 修改会员打码量
 * @param id 会员ID
 * @param num 金额
 * @param type 类型: 1-增加, 2-减少
 */
export function updateWithdrawLimit(id: number, num: number, type: number) {
  return Alova.Post<{
    code: number;
    msg: string;
    data: any;
  }>('/admin/withdraw/withdrawLimit', {
    id,
    num:type == 1 ? num : -num,
  },{
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
  }>('/admin/withdraw/withdrawCount', {}, {
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