import { Alova } from '@/utils/http/alova/index';

/**
 * 获取公告列表
 */
export const getNoticeList = (params: {
  pageSize: string;
  page: string;
}) => {
  return Alova.Post('/admin/notice/list', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 添加公告
 */
export const addNotice = (params: {
  name: string;
  content: string;
  is_home: number;
}) => {
  return Alova.Post('/admin/notice/add', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 编辑公告
 */
export const editNotice = (params: {
  id: number;
  name: string;
  content: string;
  is_home: number;
}) => {
  return Alova.Post('/admin/notice/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 删除公告
 */
export const deleteNotice = (id: string) => {
  return Alova.Post('/admin/notice/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
};
