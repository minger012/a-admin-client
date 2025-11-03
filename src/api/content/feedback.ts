import { Alova } from '@/utils/http/alova/index';

/**
 * 获取意见反馈列表
 */
export const getFeedbackList = (params: {
  page?: number;
  pageSize?: number;
  sTime?: number;
  eTime?: number;
  uid?: number;
}) => {
  return Alova.Post('/admin/feedback/list', params, {
    localCache: null, // 禁用缓存，确保获取最新数据
    meta: { isReturnNativeResponse: true },
  });
};

/**
 * 创建意见反馈
 */
export const createFeedback = (params: {
  uid: number;
  subject: string;
  content: string;
}) => {
  return Alova.Post('/admin/feedback/create', params, {
    meta: { isReturnNativeResponse: true },
  });
};
