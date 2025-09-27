import { Alova } from '@/utils/http/alova/index';

// 获取开奖记录列表
export const getLotteryPeriodList = (params: {
  pageSize: string;
  page: string;
  goods_id?: string;
  status?: string;
}) => {
  return Alova.Post('/admin/lottery/lotteryPeriodList', params, {
    meta: { isReturnNativeResponse: true },
  });
};

// 编辑开奖期号信息
export const lotteryPeriodEdit = (params: {
  period_no: string;
  single_double?: string;
  big_small?: string;
  impose?: string;
  impose_user?: string;
}) => {
  return Alova.Post('/admin/lottery/lotteryPeriodEdit', params, {
    meta: { isReturnNativeResponse: true },
  });
};
