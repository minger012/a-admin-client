import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';
import { bigSmallMap, singleDoubleMap, COLUMN_TITLES } from '@/constants/common';

export interface DrawRecordData {
  id: number;
  goods_id: number;
  goods_name?: string;
  period_no: string;
  start_time: number;
  end_time: number;
  open_time: number;
  status: number;
  big_small: 'big' | 'small';
  single_double: 'single' | 'double';
  create_time: number;
}

// 状态映射
export const statusMap = {
  0: '未开奖',
  1: '已开奖',
};

// 状态类型映射
export const statusTypeMap = {
  0: 'warning',
  1: 'success',
};

export const columns: BasicColumn<DrawRecordData>[] = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '产品名称',
    key: 'goods_name',
  },
  {
    title: '期号',
    key: 'period_no',
  },
  {
    title: '开奖时间',
    key: 'open_time',
    width:160,
    render(row) {
      return row.open_time ? formatToDateTime(row.open_time * 1000) : '-';
    },
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(
        NTag,
        {
          type: statusTypeMap[row.status],
        },
        {
          default: () => statusMap[row.status],
        }
      );
    },
  },
  {
    title: COLUMN_TITLES.BIG_SMALL,
    key: 'big_small',
    render(record) {
      return h('span', {}, { default: () => bigSmallMap[record.big_small] });
    },
  },
  {
    title: COLUMN_TITLES.SINGLE_DOUBLE,
    key: 'single_double',
    render(record) {
      return h('span', {}, { default: () => singleDoubleMap[record.single_double] });
    },
  },
];
