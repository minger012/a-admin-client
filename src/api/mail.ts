import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 用户通知列表
 */
export function mailList(params) {
  return Alova.Post('/admin/mail/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 发送通知
 */
export function mailSend(params) {
  return Alova.Post('/admin/mail/send', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 删除通知
 */
export function mailDelete(id: number) {
  return Alova.Post('/admin/mail/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
}
