import { Alova } from '@/utils/http/alova/index';

/**
 * 获取活动列表
 */
export const getActivityList = (params: {
  pageSize: string;
  page: string;
}) => {
  return Alova.Post('/admin/activity/list', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 添加活动
 */
export const addActivity = (params: {
  name: string;
  content: string;
  image?: string;
}) => {
  return Alova.Post('/admin/activity/add', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 编辑活动
 */
export const editActivity = (params: {
  id: number;
  name: string;
  content: string;
  image?: string;
}) => {
  return Alova.Post('/admin/activity/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 删除活动
 */
export const deleteActivity = (id: string) => {
  return Alova.Post('/admin/activity/del', { id }, {
    meta: { isReturnNativeResponse: true },
  });
};
