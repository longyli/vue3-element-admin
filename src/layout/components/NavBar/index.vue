<template>
  <div id="shopify-section-jsc-section-secmobile-header" class="shopify-section">
    <div class="jsc-sec-header large--hide medium-down--show">
      <div class="left-panel inline" style="width:calc(100% - 125px);">
        <form action="/ulink_comshop/pages/index/search" method="get" class="jsc-sec-mob-search input-group search-bar" role="search">

            <span class="input-group-btn hidden">
              <button type="submit" class="btn icon-fallback-text">
                <i class="fa fa-search"></i>
                <span class="fallback-text">Search</span>
              </button>
            </span>
          <input type="search" name="q" value="" placeholder="Search" class="input-group-field boost-pfs-search-box">
        </form>

      </div>
      <div class="right-panel inline" style="width:120px;">
        <a  class="site-nav__link" @click="handleToCart" aria-controls="CartDrawer"
           aria-expanded="false">
            <span class="icon-fallback-text">
              <i class="fa fa-shopping-cart fa-2x"></i>
              <span class="cart-item-count-header--quantity site-header__cart-indicator" v-if="cartNum>0">{{cartNum}}</span>
              <span class="cart-item-count-header cart-item-count-header--total"><span class="money">$0.00</span></span>
              <span class="fallback-text">Cart</span>
            </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import { useAppStore,useCartStore,useUserStore,useCommunityStore } from "@/store";
  import router from "@/router";

  const appStore = useAppStore();
  const userStore = useUserStore();
  const cartStore = useCartStore();
  const communityStore = useCommunityStore();
  const cartNum = computed(() => cartStore.cartNum); // 是否显示标签视图
  onMounted(() =>{
    onLoad();

  });

  function onLoad(){
    const community_id = communityStore.communityInfo.communityId
    cartStore.getCartNum(community_id);
  }
  
  function handleToCart() {

    userStore.check_login().then((res)=>{
      console.log(1)
      router.push("/ulink_comshop/pages/order/shopCart");
    }).catch((error)=>{
      console.log(2)
      router.push("/ulink_comshop/pages/user/login");
    })
  }

</script>

<style lang="scss" scoped>

</style>
