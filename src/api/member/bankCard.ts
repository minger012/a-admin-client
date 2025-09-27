import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 获取会员银行卡列表
 */
export function getBankCardList(params: { pageSize: string | number; page: string | number; id: number }) {
  return Alova.Post('/admin/user/bankCardList', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 编辑会员银行卡
 */
export function editBankCard(params: { id: number; cardno: string; name: string; bank: string }) {
  return Alova.Post('/admin/user/bankCardEdit', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
