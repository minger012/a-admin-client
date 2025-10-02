import { h } from 'vue';
import { NTag, NImage } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';

export interface RechargeListData {
  id: number;
  fb_id: string;
  uid: number;
  admin_id: number;
  remarks: string;
  user_remarks: string;
  image: string | null;
  money: number;
  type: number;
  state: number;
  virtual_state: number;
  update_time: number;
  create_time: number;
  username: string;
}

// 状态映射
const stateMap = {
  0: '失败',
  1: '成功',
};

// 状态颜色映射
const stateColorMap = {
  0: 'error',
  1: 'success',
};

// 充值方式映射
const typeMap = {
  1: '真实充值',
  2: '虚拟充值',
  3: '系统赠送',
};

// 虚拟充值退回状态映射
const virtualStateMap = {
  0: '未退回',
  1: '已退回',
};

export const columns: BasicColumn<RechargeListData>[] = [
  {
    type: 'selection',
    fixed: 'left',
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: '用户ID',
    key: 'uid',
    width: 100,
  },
  {
    title: '用户简称',
    key: 'username',
    width: 120,
  },
  {
    title: 'FB_ID',
    key: 'fb_id',
    width: 180,
  },
  {
    title: '所属管理者',
    key: 'admin_id',
    width: 120,
  },
  {
    title: '充值金额',
    key: 'money',
    width: 120,
    render(record) {
      return h('span', {
        style: {
          color: '#f5222d',
          fontWeight: 'bold',
        },
      }, { default: () => `${record.money.toFixed(2)}` });
    },
  },
  {
    title: '充值截图',
    key: 'image',
    width: 100,
    render(record) {
      if (!record.image) {
        return h('span', {}, '-');
      }
      return h(
        NImage,
        {
          width: 50,
          height: 50,
          src: record.image,
          objectFit: 'cover',
        }
      );
    },
  },
  {
    title: '充值方式',
    key: 'type',
    width: 120,
    render(record) {
      return h(NTag, {
        type: record.type === 1 ? 'success' : record.type === 2 ? 'warning' : 'info',
      }, typeMap[record.type] || '-');
    },
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(record) {
      return h(
        NTag,
        {
          type: stateColorMap[record.state],
        },
        {
          default: () => stateMap[record.state] || '-',
        }
      );
    },
  },
  {
    title: '虚拟充值退回状态',
    key: 'virtual_state',
    width: 150,
    render(record) {
      if (record.type !== 2) {
        return h('span', {}, '-');
      }
      return h(
        NTag,
        {
          type: record.virtual_state === 1 ? 'success' : 'default',
        },
        {
          default: () => virtualStateMap[record.virtual_state] || '-',
        }
      );
    },
  },
  {
    title: '后台备注',
    key: 'remarks',
    width: 180,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '用户端备注',
    key: 'user_remarks',
    width: 180,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 160,
    render(record) {
      return h('span', {}, { 
        default: () => record.update_time ? formatToDateTime(record.update_time) : '-' 
      });
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(record) {
      return h('span', {}, { 
        default: () => record.create_time ? formatToDateTime(record.create_time) : '-' 
      });
    },
  },
];
