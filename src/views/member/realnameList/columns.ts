import { h } from 'vue';
import { NTag, NImage, NImageGroup } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

export interface RealnameListData {
  id: number;
  uid: number;
  real_name: string;
  verify_type: number;
  front_image: string;
  back_image: string;
  status: number;
  reject_reason: string;
  admin_id: number;
  audit_time: number;
  create_time: number;
  update_time: number;
  username: string;
  admin_username: string;
}

// 认证类型映射
const verifyTypeMap = {
  1: '护照',
  2: '驾驶证',
  3: '社会安全号',
  4: '身份证',
};

// 审核状态映射
const statusMap = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝',
};

// 审核状态颜色映射
const statusTypeMap = {
  0: 'warning',
  1: 'success',
  2: 'error',
};

export const createColumns = (): BasicColumn<RealnameListData>[] => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '用户ID',
      key: 'uid',
      width: 100,
    },
    {
      title: '用户名',
      key: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      key: 'real_name',
      width: 120,
    },
    {
      title: '认证类型',
      key: 'verify_type',
      width: 120,
      render(row) {
        return verifyTypeMap[row.verify_type] || '未知';
      },
    },
    {
      title: '证件照片',
      key: 'images',
      width: 200,
      render(row) {
        return h(NImageGroup, null, {
          default: () => [
            row.front_image ? h(NImage, {
              src: row.front_image,
              objectFit: 'cover',
              style: { marginRight: '8px',width: '60px',height: '40px' }
            }) : null,
            row.back_image ? h(NImage, {
              src: row.back_image,
              objectFit: 'cover',
              style: { marginRight: '8px',width: '60px',height: '40px' }
            }) : null,
          ].filter(Boolean)
        });
      },
    },
    {
      title: '审核状态',
      key: 'status',
      width: 100,
      render(row) {
        return h(
          NTag,
          {
            type: statusTypeMap[row.status],
          },
          {
            default: () => statusMap[row.status] || '未知',
          }
        );
      },
    },
    {
      title: '拒绝原因',
      key: 'reject_reason',
      width: 150,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '审核管理员',
      key: 'admin_username',
      width: 120,
    },
    {
      title: '提交时间',
      key: 'create_time',
      width: 180,
      render(row) {
        if (!row.create_time) return '-';
        const date = new Date(row.create_time * 1000);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
    },
    {
      title: '审核时间',
      key: 'audit_time',
      width: 180,
      render(row) {
        if (!row.audit_time) return '-';
        const date = new Date(row.audit_time * 1000);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
    },
  ];
};
