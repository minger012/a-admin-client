/**
 * 权限树数据
 */
export const permissionData = [
  {
    id: 1,
    pid: 0,
    label: '管理员管理',
    key: '1',
    children: [
      { id: 101, pid: 1, label: '角色管理', key: '101' },
      { id: 102, pid: 1, label: '用户管理', key: '102' },
    ],
  },
  {
    id: 2,
    pid: 0,
    label: '产品库',
    key: '2',
    children: [
      { id: 201, pid: 2, label: '产品库', key: '201' },
    ],
  },
  {
    id: 3,
    pid: 0,
    label: '计划库',
    key: '3',
    children: [
      { id: 301, pid: 3, label: '计划管理', key: '301' },
    ],
  },
  {
    id: 4,
    pid: 0,
    label: '优惠券',
    key: '4',
    children: [
      { id: 401, pid: 4, label: '优惠券库', key: '401' },
      { id: 402, pid: 4, label: '用户优惠券', key: '402' },
    ],
  },
  {
    id: 5,
    pid: 0,
    label: '授权码',
    key: '5',
    children: [
      { id: 501, pid: 5, label: '授权码管理', key: '501' },
    ],
  },
  {
    id: 6,
    pid: 0,
    label: '财务管理',
    key: '6',
    children: [
      { id: 601, pid: 6, label: '充值记录', key: '601' },
      { id: 602, pid: 6, label: '提现记录', key: '602' },
      { id: 603, pid: 6, label: '资金明细', key: '603' },
    ],
  },
  {
    id: 7,
    pid: 0,
    label: '用户计划管理',
    key: '7',
    children: [
      { id: 701, pid: 7, label: '用户计划列表', key: '701' },
    ],
  },
  {
    id: 8,
    pid: 0,
    label: '系统设置',
    key: '8',
    children: [],
  },
  {
    id: 9,
    pid: 0,
    label: '数据统计',
    key: '9',
    children: [
      { id: 901, pid: 9, label: '注册统计', key: '901' },
      { id: 902, pid: 9, label: '充值提现统计', key: '902' },
    ],
  },
  {
    id: 10,
    pid: 0,
    label: '用户管理',
    key: '10',
    children: [
      { id: 1001, pid: 10, label: '用户管理', key: '1001' },
    ],
  },
  {
    id: 11,
    pid: 0,
    label: '用户反馈',
    key: '11',
    children: [
      { id: 1101, pid: 11, label: '用户通知', key: '1101' },
    ],
  },
];

/**
 * 将权限ID字符串转换为树形结构的选中keys
 * @param authString 权限ID字符串，如 "1,101,102"
 * @returns 选中的key数组
 */
export function authStringToKeys(authString: string): string[] {
  if (!authString) return [];
  return authString.split(',');
}

/**
 * 将选中的keys转换为权限ID字符串
 * @param keys 选中的key数组
 * @returns 权限ID字符串，如 "1,101,102"
 */
export function keysToAuthString(keys: string[]): string {
  return keys.join(',');
}
