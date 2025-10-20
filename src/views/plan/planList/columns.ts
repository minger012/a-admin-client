import { h } from 'vue';
import { NTag, NImage } from 'naive-ui';

export interface PlanListData {
  id: number;
  name: string;
  goods_id: number;
  intro: string;
  image: string;
  content: Array<{ title: string; content: string }>;
  orienteering: Array<{ title: string; content: string }>;
  rule: Array<{ title: string; content: string }>;
  create_time: number;
  update_time: number | null;
  state: number;
}

// 状态选项
export const stateOptions = [
  { label: '未激活', value: 0 },
  { label: '激活', value: 1 },
  { label: '结束', value: 2 },
];

// 表格列定义
export const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '计划名称',
    key: 'name',
    width: 150,
  },
  {
    title: '计划编号',
    key: 'number',
    width: 150,
  },
  {
    title: '产品ID',
    key: 'goods_id',
    width: 100,
  },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render(row) {
      const stateMap = {
        0: { type: 'warning', text: '暂停' },
        1: { type: 'success', text: '激活' },
        2: { type: 'error', text: '结束' },
      };
      const state = stateMap[row.state] || { type: 'default', text: '未知' };
      return h(
        NTag,
        {
          type: state.type as 'success' | 'warning' | 'error' | 'default',
          size: 'small',
        },
        { default: () => state.text }
      );
    },
  },
  {
    title: '简介',
    key: 'intro',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return h(
        'div',
        {
          class: ' line-clamp-2',
        },
        { default: () => row.intro }
      );
    },
  },
  {
    title: '主图',
    key: 'image',
    width: 100,
    render(row) {
      return row.image
        ? h(NImage, {
            width: 60,
            height: 60,
            src: row.image,
            objectFit: 'cover',
            showToolbarTooltip: true,
          })
        : '无图片';
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 150,
    render(row) {
      return new Date(row.create_time * 1000).toLocaleString();
    },
  },
  {
    title: '更新时间',
    key: 'update_time',
    width: 150,
    render(row) {
      return row.update_time
        ? new Date(row.update_time * 1000).toLocaleString()
        : '-';
    },
  },
];
