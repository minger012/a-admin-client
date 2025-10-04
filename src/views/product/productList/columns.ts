import { h } from 'vue';
import { NImage, NTag } from 'naive-ui';
import { BasicColumn } from '@/components/Table';
import { formatToDateTime } from '@/utils/dateUtil';

export interface ProductListData {
  id: number;
  sort: number;
  state: number;
  image: string[];
  logo: string;
  name: string;
  a_name?: string;
  intro: string;
  period_time: number;
  create_time: number;
  update_time: number;
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
export const stateOptions = [
  { label: '未生效', value: 0 },
  { label: '生效', value: 1 },
  { label: '审核中', value: 2 },
  { label: '封禁', value: 3 },
];
export const stateMap:{[key:number]:string} = {
  0: '未生效',
  1: '生效',
  2: '审核中',
  3: '封禁',
};

export const columns: BasicColumn<ProductListData>[] = [
  {
    type: 'selection',
  },
  {
    title: 'ID',
    key: 'id',
    width:100,
  },
  {
    title: '产品名称',
    key: 'name',
    width:200,
  },
  {
    title: '状态',
    key: 'state',
    render(row) {
      return h(NTag, {
        type: row.state == 1 ? 'success' : row.state == 2 ? 'primary' : 'error',
        round: true,
      }, () => stateMap[row.state]);
    },
    width:120,
  },
  {
    title: '简介',
    key: 'intro',
    width: 200,
  },
  {
    title: 'Logo',
    key: 'logo',
    render(row) {
      return h(NImage, {
        width: 50,
        height: 50,
        src: row.logo,
        objectFit: 'cover',
        showToolbarTooltip: true,
      });
    },
    width:120,
  },
  {
    title: '图片',
    key: 'image',
    render(record) {
      return h(NImage, {
        width: 50,
        height: 50,
        src: record.image && record.image[0],
        objectFit: 'cover',
        showToolbarTooltip: true,
      });
    },
    width:120,
  },
  {
    title: '创建时间',
    key: 'create_time',
    width:160,
    render(row) {
      return row.create_time ? formatToDateTime(Number(row.create_time) * 1000) : '-';
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width:160,
    render(row) {
      return row.update_time ? formatToDateTime(Number(row.update_time) * 1000) : '-';
    },
  },
];
