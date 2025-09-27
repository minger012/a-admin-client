/**
 * 权限树数据
 */
export const permissionData = [
  {
    id: 1,
    pid: 0,
    label: '系统配置',
    key: '1',
    children: [
      { id: 101, pid: 1, label: '系统配置列表', key: '101' },
      { id: 102, pid: 1, label: '管理员管理', key: '102' },
      { id: 103, pid: 1, label: '管理员分组', key: '103' },
    ],
  },
  {
    id: 2,
    pid: 0,
    label: '会员管理',
    key: '2',
    children: [
      { id: 201, pid: 2, label: '会员列表', key: '201' },
      { id: 208, pid: 2, label: '在线用户', key: '208' },
      { id: 202, pid: 2, label: '陪玩用户', key: '202' },
      { id: 203, pid: 2, label: '充值列表', key: '203' },
      { id: 204, pid: 2, label: '提现列表', key: '204' },
      { id: 205, pid: 2, label: '会员加减打码量', key: '205' },
      { id: 206, pid: 2, label: '会员加扣款', key: '206' },
      { id: 207, pid: 2, label: '赠送彩金', key: '207' },
    ],
  },
  {
    id: 3,
    pid: 0,
    label: '产品管理',
    key: '3',
    children: [
      { id: 301, pid: 3, label: '产品列表', key: '301' },
      { id: 302, pid: 3, label: '产品预设置', key: '302' },
      { id: 303, pid: 3, label: '开奖记录', key: '303' },
      { id: 304, pid: 3, label: '注单管理', key: '304' },
      { id: 305, pid: 3, label: '即时注单', key: '305' },
    ],
  },
  {
    id: 4,
    pid: 0,
    label: '数据中心',
    key: '4',
    children: [
      { id: 401, pid: 4, label: '员工统计', key: '401' },
      { id: 402, pid: 4, label: '团队统计', key: '402' },
    ],
  },
  {
    id: 5,
    pid: 0,
    label: '内容管理',
    key: '5',
    children: [
      { id: 501, pid: 5, label: '站内信', key: '501'},
      { id: 502, pid: 5, label: '公告', key: '502' },
      { id: 503, pid: 5, label: '活动', key: '503' },
    ],
  }
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
