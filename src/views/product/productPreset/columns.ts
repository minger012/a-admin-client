import { h } from 'vue';
import { NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { bigSmallMap, singleDoubleMap, COLUMN_TITLES } from '@/constants/common';
import { formatToDateTime } from '@/utils/dateUtil';

export interface ProductPresetData {
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

export const columns: BasicColumn<ProductPresetData>[] = [
  {
    title: 'ID',
    width:100,
    key: 'id',
  },
  {
    title: '产品ID',
    width:100,
    key: 'goods_id',
  },
  {
    title: '产品名称',
    key: 'goods_name',
    width:160,
  },
  {
    title: '期号',
    width:160,
    key: 'period_no',
  },
  {
    title: '开始时间',
    width:160,
    key: 'start_time',
    render(record) {
      return record.start_time ? formatToDateTime(record.start_time * 1000) : '-';
    },
  },
  {
    title: '结束时间',
    width:160,
    key: 'end_time',
    render(record) {
      return record.end_time ? formatToDateTime(record.end_time * 1000) : '-';
    },
  },
  {
    title: '开奖时间',
    key: 'open_time',
    width:160,
    render(record) {
      return record.open_time ? formatToDateTime(record.open_time * 1000) : '-';
    },
  },
  {
    title: COLUMN_TITLES.BIG_SMALL,
    width:100,
    key: 'big_small',
    render(record) {
      return h('span', {}, { default: () => bigSmallMap[record.big_small] });
    },
  },
  {
    title: COLUMN_TITLES.SINGLE_DOUBLE,
    width:100,
    key: 'single_double',
    render(record) {
      return h('span', {}, { default: () => singleDoubleMap[record.single_double] });
    },
  },
  {
    title: '状态',
    width:100,
    key: 'status',
    render(record) {
      const statusMap = {
        0: '未开奖',
        1: '已开奖'
      };
      const statusColorMap = {
        0: 'warning',
        1: 'success'
      };
      return h(
        NTag,
        {
          type: statusColorMap[record.status],
        },
        {
          default: () => statusMap[record.status] || '未知',
        }
      );
    },
  },
];
