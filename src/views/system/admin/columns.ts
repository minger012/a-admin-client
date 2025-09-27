import { formatToDateTime } from '@/utils/dateUtil';

export interface AdminData {
  username: string;
  auth_id: number;
  state: number;
  role_name?: string; // 角色名称，可能由前端添加
}

export const columns = [
  {
    title: '管理员ID',
    key: 'id',
  },
  {
    title: '账号',
    key: 'username',
  },
  {
    title: '管理员分组',
    key: 'auth_id',
    render(row) {
      return row.role_name || `ID: ${row.auth_id}`;
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(row) {
      return row.create_time ? formatToDateTime(row.create_time * 1000) : '-';
    },
  }
 
];
