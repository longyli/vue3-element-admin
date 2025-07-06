<script setup lang="ts">
import router from "@/router";
import { defineProps } from "vue";
import { useCommunityStore,useCartStore,useUserStore } from "@/store";
import { getAccessToken } from "@/utils/auth";
import handleBeforeInput from "@wangeditor-next/editor/dist/core/src/text-area/event-handlers/beforeInput";
const userStore = useUserStore();
const cartStore = useCartStore();
const communityStore = useCommunityStore();
const loadingAddCart = ref(false);
const props = defineProps({
  goods: {
    type: Object,
    default: () => {}
  },
});
// 监听props变化并更新本地副本（可选）
watch(() => props.goods, (newVal) => {
  localGoods.value = { ...newVal };
});

const localGoods = ref({ ...props.goods });



function handleAddCart(){
  if(!loadingAddCart.value){
    loadingAddCart.value = true;
    addCart(1);
  }
}
function addCart(quantity = 1) {

  userStore.check_login().then((r)=>{
    const token = getAccessToken();
    const goods_id = props.goods['actId']
    const community_id = communityStore.communityInfo.communityId

    cartStore.addCart({
      token,goods_id,community_id,quantity
    }).then((res)=>{
      debugger
      if(res.code == 1){
        localGoods.value.car_count = res['cur_count']
      }
    }).catch((error)=>{

    }).finally(
      setTimeout(function(){  loadingAddCart.value = false },1000)
    )

  }).catch((re)=>{
    setTimeout(function(){  loadingAddCart.value = false },1000)
    console.log(re)
    //router.push("/ulink_comshop/pages/user/login");
  })
}

</script>

<template>
  <div  class="boost-pfs-filter-product-item grid__item product-item-6585306677311 large--one-quarter wow fadeInUp medium--one-quarter small--one-third boost-pfs-action-list-enabled boost-pfs-action-list-single-button animated" data-id="6585306677311"  style="visibility: visible;">
    <div class="grid-view-item">
      <div class="grid-view-item-image">
        <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+localGoods.actId" title="Packham Pears" class="grid__image grid__image__match boost-pfs-action-overlay">
          <el-image
            id="collection-image-anim"
            fit="fill"
            lazy
            class="img-responsive wow fadeIn animated"
            style="width: 20vw; height: 20vw;min-width: 100%; max-height: 230px"
            :src="localGoods.skuImage"></el-image>
        </router-link>
        <div class="shop-now-wrapper">
          <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+localGoods.actId" class="shop-now-button jsc-shop-now-button"  onclick="showLLpoints(this);">Quick View</router-link>
        </div>
        <div class="boost-pfs-action-list-wrapper boost-pfs-action-extend" style="top: 261.461px; width: 230px; visibility: visible;">
          <button class="boost-pfs-quickview-btn boost-pfs-filter-button" style="display:none;" data-href="/collections/fruit/products/packham-pears-4-pieces-old?view=boost-pfs-quickview" aria-label="Quick View">
            <span>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <g id="boost-pfs-icon-quick-view" transform="scale(0.03125 0.03125)">
              <path d="M1009.004 493.256c-2.256-2.82-56.254-69.828-143.786-137.492-51.696-39.962-104.462-71.87-156.832-94.834-66.48-29.152-132.556-43.932-196.386-43.932-63.832 0-129.904 14.782-196.386 43.932-52.37 22.962-105.136 54.87-156.834 94.834-87.53 67.666-141.528 134.674-143.784 137.494l-14.996 18.742 14.998 18.744c2.256 2.82 56.252 69.828 143.784 137.492 51.696 39.962 104.462 71.87 156.834 94.834 66.48 29.152 132.554 43.932 196.386 43.932 63.83 0 129.904-14.782 196.386-43.932 52.37-22.962 105.136-54.87 156.832-94.834 87.53-67.666 141.53-134.674 143.786-137.492l14.994-18.744-14.996-18.744zM827.402 621.624c-74.24 57.196-189.226 125.374-315.402 125.374-126.18 0-241.162-68.178-315.402-125.374-55.36-42.65-97.042-85.794-118.512-109.612 52.994-58.698 229.246-235.006 433.916-235.006 126.178 0 241.162 68.178 315.402 125.374 55.366 42.654 97.050 85.8 118.522 109.622-21.474 23.82-63.158 66.968-118.524 109.622z"></path><path d="M512 309.976c-111.396 0-202.024 90.63-202.024 202.024s90.63 202.024 202.024 202.024 202.026-90.628 202.026-202.024-90.63-202.024-202.026-202.024zM512 654.018c-78.308 0-142.018-63.71-142.018-142.018s63.71-142.018 142.018-142.018 142.018 63.71 142.018 142.018c0 78.308-63.71 142.018-142.018 142.018z"></path><path d="M512 419.322c-51.102 0-92.678 41.576-92.678 92.678s41.576 92.68 92.678 92.68 92.678-41.576 92.678-92.68c0-51.104-41.574-92.678-92.678-92.678zM512 544.672c-18.014 0-32.67-14.656-32.67-32.672s14.656-32.67 32.67-32.67 32.67 14.656 32.67 32.67c0.002 18.014-14.654 32.672-32.67 32.672z"></path></g></svg>
            </span>
          </button>
        </div>
      </div>
<!--      <button class="swym-button swym-add-to-wishlist-view-product product_6585306677311 swym-icon swym-heart swym-loaded" >
        <span class="swym-tooltip swym-inject">
          <span class="swym-tooltip-text">Add to wishlist</span>
        </span>
      </button>-->
      <div class="boost-pfs-filter-product-item-label"></div>
      <div class="boost-pfs-filter-product-bottom">
        <p class="boost-pfs-filter-product-item-title" style="min-height: 14px;">
          <a href="/collections/fruit/products/packham-pears-4-pieces-old">{{localGoods.spuName_en}}</a>
        </p>

        <a class="boost-vendor-link" title="Avo &amp; Co" href="/collections/vendors?q=Avo%20%26%20Co">
          <div class="product-grid&#45;&#45;vendor-text">
            {{localGoods.spuDescribe_en}}
          </div>
        </a>
        <p class="boost-pfs-filter-product-item-vendor" style="height: 10px;"></p>
        <div class="boost-pfs-filter-product-item-wp">
          <span class="weight">
            <span class="var-weight-from 3"></span>
          </span>
          <p class="boost-pfs-filter-product-item-price">
            <span class="boost-pfs-filter-product-item-sale-price">
              $<span class="span">{{localGoods.marketPrice[0]}}</span>.{{localGoods.marketPrice[1]}}
              <s>$4.90</s> </span>
          </p>
        </div>
<!--        <div class="boost-pfs-filter-price-per-unit">
          <span class="float-l">Chilled</span>
          <span class="float-r">$1.75/piece</span>
        </div>-->
      </div>
      <div class="boost-pfs-filter-product-bottom-button" >
        <div  class="boost-pfs-addtocart-product-form" enctype="multipart/form-data" >
          <div class="boost-pfs-addtocart-wrapper boost-pfs-show" v-if="localGoods.car_count > 0 ">
            <div class="boost-otp-quantity" >
              <div class="boost-otp-quantity-minus" >
                <i aria-hidden="true" class="fa fa-minus"></i>
              </div>
              <input class="boost-otp-quantity-number" :value="localGoods.car_count" type="text" pattern="[0-9]*" min="0" disabled="">
              <div class="boost-otp-quantity-plus" >
                <i aria-hidden="true" class="fa fa-plus"></i>
              </div>
            </div>
          </div>

            <div class="boost-pfs-addtocart-wrapper boost-pfs-show" v-if="localGoods.car_count == 0 ">
            <button aria-label="Add To Cart" @click="handleAddCart" class="boost-pfs-addtocart-btn boost-pfs-addtocart-select-options">
              <span class="boost-pfs-addtocart-btn-text" v-if="!loadingAddCart">Add To Cart</span>
              <span class="boost-pfs-addtocart-btn-text" v-if="loadingAddCart">Loading...</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.boost-pfs-filter-product-item-sale-price{
  margin-right: 5px;
  color: #f26c4f;
  font-size: 15px;
  font-weight: 500;
}
.boost-pfs-filter-product-item-sale-price .span{
  color: #f26c4f;
  font-size: 19px;
  font-weight: 500;
}
.boost-pfs-filter-product-item-sale-price s{
  order: 2;
  color: #3d4246;
  font-size: 15px;
}
.boost-pfs-filter-product-bottom-button button {
  display: block;
  width: 100%;
  background-color: #b89a68!important;
  height: 40px;
  line-height: 38px;
  padding: 0;
  display: inline-block;
  text-transform: none;
  border-color: #b89a68!important;
  border-style: solid;
  -webkit-transition: all .3s ease-in-out;
  -moz-transition: all .3s ease-in-out;
  -ms-transition: all .3s ease-in-out;
  -o-transition: all .3s ease-in-out;
  transition: all .3s ease-in-out;
}
</style>
