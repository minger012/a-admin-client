import { Alova } from '@/utils/http/alova/index';

// 获取配置列表
export const getConfigList = (params: {
  pageSize: string;
  page: string;
}) => {
  return Alova.Post('/admin/config/configList', params, {
    meta: { isReturnNativeResponse: true },
  });
};

// 保存配置
export const saveConfig = (params: {
  arr: any[];
}) => {
  return Alova.Post('/admin/config/configEdit', params, {
    meta: { isReturnNativeResponse: true },
  });
};

