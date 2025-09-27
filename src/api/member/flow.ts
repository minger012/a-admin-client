import { Alova } from '@/utils/http/alova/index';

// 获取会员账变流水记录
export const getFlowList = (params: {
  pageSize: string | number;
  page: string | number;
  id: number; // 玩家id
}) => {
  return Alova.Post('/admin/user/flowList', params, {
    meta: { isReturnNativeResponse: true },
  });
};
