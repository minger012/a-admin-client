import { Alova } from '@/utils/http/alova/index';

/**
 * @description: 上传图片
 */
export function uploadImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  return Alova.Post('/admin/file/uploadImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    meta: { isReturnNativeResponse: true },
  });
}
