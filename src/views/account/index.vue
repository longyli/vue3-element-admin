<script setup lang="ts">

import { useUserStore } from "@/store/modules/user.store";
import handleBeforeInput from "@wangeditor-next/editor/dist/core/src/text-area/event-handlers/beforeInput";
import router from "@/router";
const loading = ref(false);
const userStore = useUserStore();
const userInfo = computed({
  get: () => userStore.userInfo
});

async function handleLoginSubmit() {
  try {
    loading.value = true
    await userStore.logout();

  } catch (error) {

  }finally {
    loading.value = true
    router.push("/ulink_comshop/pages/index/index")
  }
}

</script>

<template>
  <div class="wrapper-padded">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <a href="/" title="Back to the frontpage">Home</a>
      <span aria-hidden="true">›</span>
      <span>Account</span>
    </nav>
  </div>
  <div class="main-content page-main--wrapper">
    <div class="wrapper-padded">
      <div class="grid page-main--wrapper">
        <div class="grid__item">
          <div class="sitewide--title-wrapper">
            <h1 class="page--title m-b-30">My Account</h1>
          </div>
        </div>
        <div class="grid__item two-thirds medium-down--one-whole">
          <h4 class="account--sub-title">Order history</h4>
          <p>You haven't placed any orders yet.</p>
          <div class="pagination">
          </div>
        </div>
        <div class="grid__item one-third medium-down--one-whole" style="padding-bottom:30px;">
          <h4 class="account--sub-title">Account details</h4>
          <h5 class="account-customer-name">{{userInfo.username}}</h5>
          <p>
            <br>
            <br>
            +{{userInfo.country}} {{userInfo.telephone}}<br>
            <br>
            <br>
            Singapore<br>
          </p>
          <el-button type="primary" @click="handleLoginSubmit()" :loading="loading" class="account-section--btn m-b-30">Log out</el-button>
        </div>

      </div>
    </div>

    <div id="shopify-section-jsc-account-frequently-bought" class="shopify-section"><div class="wrapper-padded">

    </div>

    </div>


  </div>

</template>

<style scoped lang="scss">
@media (max-width: 767px) {
  .jsc-account-table td{
    border-bottom: 0;
  }
}
</style>
