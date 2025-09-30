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

/**
 * @description: 资金明细列表
 */
export function flowList(params) {
  return Alova.Post('/admin/flow/list', params, {
    meta: { isReturnNativeResponse: true },
  });
}

/**
 * @description: 编辑资金明细备注
 */
export function flowEdit(params) {
  return Alova.Post('/admin/flow/edit', params, {
    meta: { isReturnNativeResponse: true },
  });
}
