<template>
  <div class="expanded-row-container">
    <div class="text-lg font-semibold mb-3">联单详细信息</div>
    <!-- 联单基本信息 -->
    <div class="section">
      <div class="section-title">联单基本信息</div>
      <div class="section-content">
        <div class="field-item">
          <span class="label">联单编ID:</span>
          <span class="value">{{ data.fb_id }}</span>
        </div>
        <div class="field-item">
          <span class="label">计划ID:</span>
          <span class="value">{{ data.plan_id }}</span>
        </div>
        <div class="field-item">
          <span class="label">本组记录数:</span>
          <span class="value">{{ data.group_count }}</span>
        </div>
        <div class="field-item">
          <span class="label">联单序号:</span>
          <span class="value">{{ data.item_index }}</span>
        </div>
        <div class="field-item">
          <span class="label">用户:</span>
          <span class="value">{{ data.username || '-' }}</span>
        </div>
        <div class="field-item">
          <NTag type="success" size="small" bordered=true>
            当前活跃
          </NTag>
          <NTag type="warning" class="ml-2" v-if="data.state == 0" size="small" bordered=true>
            未开始
          </NTag>
          <NTag type="primary" class="ml-2" v-if="data.state == 4 || data.state == 5" size="small" bordered=true>
            已完成
          </NTag>
        </div>
        <div class="field-item">
          <span class="label">联单总数:</span>
          <span class="value">{{ data.group_count }}</span>
        </div>
        <div class="field-item field-item-wide">
          <span class="label">订单编号:</span>
          <span class="value">{{ data.order_no }}</span>
        </div>
      </div>
    </div>

    <!-- 控制数据 -->
    <div class="section">
      <div class="section-title">投放数据</div>
      <div class="section-content">
        <div class="field-item">
          <span class="label">投放状态:</span>
          <span class="value">{{ stateMap[data.state] }}</span>
        </div>
        <div class="field-item">
          <span class="label">已投放金额:</span>
          <span class="value">{{ data.putIn }}</span>
        </div>
        <div class="field-item">
          <span class="label">利润金额:</span>
          <span class="value">{{ data.profit }}</span>
        </div>
        <div class="field-item">
          <span class="label">投放金额:</span>
          <span class="value">{{ data.money }}</span>
        </div>
        <div class="field-item">
          <span class="label">待投放金额:</span>
          <span class="value">{{ data.wait_putIn }}</span>
        </div>
        <div class="field-item">
          <span class="label">投放利润率:</span>
          <span class="value font-semibold" :class="data.rate === 0 ? 'error' : 'success'">{{ data.rate }}%</span>
        </div>
        <div class="field-item">
          <span class="label">投放进度:</span>
          <span class="value">{{ data.schedule }}</span>
        </div>
        <div class="field-item">
          <span class="label">广告收入:</span>
          <span class="value">{{ data.click_money }}</span>
        </div>
        <div class="field-item">
          <span class="label">实际利润率:</span>
          <span class="value text-orange-500 font-semibold">{{ data.rate }}%</span>
        </div>
        <div class="field-item field-item-wide">
          <span class="label">是否用户主动投放:</span>
          <span class="value">{{ data.form == 1 ? '是' : '否' }}</span>
        </div>
        <div class="field-item">
          <span class="label">消耗时间:</span>
          <span class="value">{{ data.cd ? data.cd * 60 : '-' }}秒</span>
        </div>
      </div>
    </div>

    <!-- 效果数据 -->
    <div class="section">
      <div class="section-title">效果数据</div>
      <div class="section-content">
        <div class="field-item">
          <span class="label">展示数:</span>
          <span class="value">{{ data.show_num }}</span>
        </div>
        <div class="field-item">
          <span class="label">点击率:</span>
          <span class="value">{{ data.click_rate }}%</span>
        </div>
        <div class="field-item">
          <span class="label">更新时间:</span>
          <span class="value">{{ formatTime(data.update_time) }}</span>
        </div>
        <div class="field-item">
          <span class="label">点击数:</span>
          <span class="value">{{ data.click_num }}</span>
        </div>
        <div class="field-item">
          <span class="label">优惠券:</span>
          <span class="value">{{ data.cid > 0 ? '已使用' : '未使用' }}</span>
        </div>
        <div class="field-item">
          <span class="label">点击单价:</span>
          <span class="value">{{ data.click_price }}</span>
        </div>
        <div class="field-item">
          <span class="label">官方派单:</span>
          <span class="value">  {{ data.form == 2 ? '是' : '否' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PlanOrderItem } from './columns';

interface Props {
  data: PlanOrderItem;
}

defineProps<Props>();

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString('zh-CN');
}
// 状态映射
const stateMap = {
  0: '待投放',
  1: '匹配中',
  2: '投放中',
  3: '投放失败',
  4: '等待结算',
  5: '结算成功',
};
</script>

<style lang="less" scoped>
.expanded-row-container {
  padding: 16px;
  max-width: calc(var(--plan-list-width) - 64px);
  width: 100%;
  box-sizing: border-box;
  border:1px solid #eee;
  border-radius: 10px;
  margin: 12px;
}

.section {
  margin-bottom: 16px;
  background-color: #fff;
  border:1px solid #eee;
  padding: 12px;
  border-radius: 4px;
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  color: #333;
  font-weight: bold;
  font-size: 14px;
  padding: 0 12px;
}

.section-content {
  padding: 12px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.field-item {
  flex: 0 0 calc(33.33% - 11px);

  &.field-item-wide {
    flex: 0 0 calc(66.66% - 8px);
  }

  .label {
    color: #333;
    font-size: 14px;
    font-weight: 600;
    margin-right: 3px;
  }

  .value {
    font-weight: 500;

    &.success {
      color: #52c41a;
    }

    &.error {
      color: #ff4d4f;
    }
  }
}
</style>
