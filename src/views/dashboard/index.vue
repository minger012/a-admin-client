<template>
  <n-card :bordered="false" class="proCard">
    <n-tabs type="line" animated>
      <n-tab-pane name="welcome" tab="管理员授权码邀请统计">
        <AdminWelcomeStats />
      </n-tab-pane>
      <n-tab-pane name="adminProduct" tab="管理员下用户充值统计">
        <AdminUserRechargeStats />
      </n-tab-pane>
      <n-tab-pane name="adminWithdraw" tab="管理员下用户提现统计">
        <AdminUserWithdrawStats />
      </n-tab-pane>
      <n-tab-pane name="userProduct" tab="用户充值统计">
        <UserRechargeStats />
      </n-tab-pane>
      <n-tab-pane name="userWithdraw" tab="用户提现统计">
        <UserWithdrawStats />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script lang="ts" setup>
  import AdminWelcomeStats from './components/AdminWelcomeStats.vue';
  import AdminUserRechargeStats from './components/AdminUserRechargeStats.vue';
  import AdminUserWithdrawStats from './components/AdminUserWithdrawStats.vue';
  import UserRechargeStats from './components/UserRechargeStats.vue';
  import UserWithdrawStats from './components/UserWithdrawStats.vue';
</script>

<style lang="less" scoped></style>
