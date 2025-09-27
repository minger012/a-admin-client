import { h } from 'vue';
import { NImage } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';

export interface ProductListData {
  id: number;
  sort: number;
  image: string;
  name: string;
  a_name?: string;
  intro: string;
  period_time: number;
  create_time: string;
  is_hot: number;
  is_home: number;
  multiple?: number;
  seal_time?: number;
  i18n?: {
    [key:string]: {
      name?: string;
      a_name?: string;
      intro?: string;
      image?: string;
    }
  };
}

export const columns: BasicColumn<ProductListData>[] = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '排序',
    key: 'sort',
  },
  {
    title: '图片',
    key: 'image',
    render(record) {
      return h(NImage, {
        width: 50,
        height: 50,
        src: record.image,
        objectFit: 'cover',
        showToolbarTooltip: true,
      });
    },
  },
  {
    title: '产品名称',
    key: 'name',
  },
  {
    title: '简介',
    key: 'intro',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '热门产品',
    key: 'is_hot',
    render(row) {
      return row.is_hot === 1 ? '是' : '否';
    },
  },
  {
    title: '首页显示',
    key: 'is_home',
    render(row) {
      return row.is_home === 1 ? '是' : '否';
    },
  },
  {
    title: '每天期数',
    key: 'period_time',
    render(row) {
      const oneDaySeconds = 24 * 60 * 60; // 86400秒
      return row.period_time ? Math.floor(oneDaySeconds / row.period_time) : 0;
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width:160,
    render(row) {
      return formatToDateTime(Number(row.create_time) * 1000);
    },
  },
];
