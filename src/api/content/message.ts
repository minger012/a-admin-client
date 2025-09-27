import { Alova } from '@/utils/http/alova/index';

/**
 * 获取站内信列表
 */
export const getMailList = (params: {
  pageSize: string;
  page: string;
}) => {
  return Alova.Post('/admin/mail/list', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 添加站内信
 */
export const addMail = (params: {
  name: string;
  content: string;
  uid: number;
}) => {
  return Alova.Post('/admin/mail/add', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 编辑站内信
 */
export const editMail = (params: {
  id: number;
  name: string;
  content: string;
  uid: number;
}) => {
  return Alova.Post('/admin/mail/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 删除站内信
 */
export const deleteMail = (id: string) => {
  return Alova.Post('/admin/mail/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
};
