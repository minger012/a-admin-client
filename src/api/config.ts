import { Alova } from '@/utils/http/alova/index';

// 获取配置列表
export const getConfigList = (params: {
  pageSize: string;
  page: string;
}) => {
  return Alova.Post('/admin/config/list', params, {
    localCache: null,
    meta: { isReturnNativeResponse: true },
  });
};

// 修改配置
export const editConfig = (data: {
  config: Array<{
    id: number;
    content: any;
  }>;
}) => {
  return Alova.Post('/admin/config/edit', data, {
    meta: { isReturnNativeResponse: true },
  });
};

