import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 上传图片
 */
export function uploadImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  return Alova.Post('/admin/file/uploadImage', formData, {
    meta: { isReturnNativeResponse: true },
  });
}
