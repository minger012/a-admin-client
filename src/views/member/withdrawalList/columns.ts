import { h } from 'vue';
import { NTag, NIcon } from 'naive-ui';
import { EditOutlined } from '@vicons/antd';
import { BasicColumn } from '@/components/Table';
export interface WithdrawalListData {
  id: number;
  username: string;
  name: string;
  bank: string;
  card: string;
  k_name: string;
  fps: string;
  pix: string;
  money: number;
  before_money: number;
  type: number; // 类型1人工2会员
  remarks: string;
  state: number; // 状态1审核成功0未审核
  system_remarks: string;
  create_time: string;
  admin_name: string;
  lock: number; // 是否锁单1是0否
  audit_time?: number; // 审核时间
}

// Status mapping
const statusMap = {
  0: '未审核',
  1: '审核成功',
  2: '审核驳回'
};

// Status color mapping
const statusColorMap = {
  0: 'warning',
  1: 'success',
  2: 'error'
};

// Type mapping
const typeMap = {
  1: '人工',
  2: '会员',
};

export const columns: BasicColumn<WithdrawalListData>[] = [
  {
    title: '序号',
    width: 100,
    key: 'id',
  },
  {
    title: '账号',
    width: 120,
    key: 'username',
  },
  {
    title: '持卡人姓名',
    width: 120,
    key: 'name',
  },
  {
    title: '银行',
    width: 200,
    key: 'card',
    render(row) {
      return h('span', {
        style:{
          wordBreak: 'break-all',
        }
      }, { default: () => (row.bank || '--') });
    },
  },
  {
    title: '卡号',
    width: 200,
    key: 'card',
    render(row) {
      return h('span', {
        style:{
          wordBreak: 'break-all',
        }
      }, { default: () => row.card });
    },
  },
  
 
  {
    title: '提现金额',
    width: 120,
    key: 'money',
    render(record) {
      return h('span', {
        style:{
          color:'red'
        }
      }, { default: () => `${record.money.toFixed(2)}` });
    },
  },
  {
    title: '提现前金额',
    width: 120,
    key: 'before_money',
    render(record) {
      return h('span', {}, { default: () => `${record.before_money.toFixed(2)}` });
    },
  },
  {
    title: '提现后金额',
    width: 120,
    key: 'after_money',
    render(record) {
      const afterAmount = Number(record.before_money) - Number(record.money);
      return h('span', {}, { default: () => `${afterAmount.toFixed(2)}` });
    },
  },
  {
    title: '类型',
    width: 100,
    key: 'type',
    render(record) {
      return h('span', {}, { default: () => typeMap[record.type] || '' });
    },
  },
  {
    title: '系统备注',
    width: 200,
    key: 'system_remarks',
    render(record) {
      return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
        h('span', { 
          style: { 
            flex: 1, 
            wordBreak: 'break-word', 
            whiteSpace: 'normal', 
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          } 
        }, record.system_remarks || '--'),
        h(NIcon, { 
          size: 16,
          style: { cursor: 'pointer', marginLeft: '5px', color: '#2080f0', flexShrink: 0 },
          onClick: (e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('edit-system-remarks', { detail: record }));
          }
        }, {
          default: () => h(EditOutlined)
        })
      ]);
    },
  },
  {
    title: '状态',
    width: 100,
    key: 'state',
    render(record) {
      return h(
        NTag,
        {
          type: statusColorMap[record.state],
        },
        {
          default: () => statusMap[record.state],
        }
      );
    },
  },
  {
    title: '操作人',
    key: 'admin_name',
    width: 120,
  },
  {
    title: '备注信息',
    width: 160,
    key: 'remarks',
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render(record) {
      // Convert timestamp to formatted date if needed
      const date = new Date(record.create_time * 1000); // Convert to milliseconds
      return h('span', {}, { 
        default: () => date.toLocaleString() 
      });
    },
  },
  {
    title: '审核时间',
    key: 'audit_time',
    width: 160,
    render(record) {
      // Convert timestamp to formatted date if needed
      const date = record.audit_time ? new Date(record.audit_time * 1000) : '-'; // Convert to milliseconds
      return h('span', {}, { 
        default: () => date.toLocaleString() 
      });
    },
  },
  {
    title: '是否锁单',
    key: 'lock',
    width: 100,
    render(record) {
      return h(
        NTag,
        {
          type: record.lock === 1 ? 'error' : 'success',
        },
        {
          default: () => (record.lock === 1 ? '已锁定' : '未锁定'),
        }
      );
    },
  },
];
