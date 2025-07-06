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

  function  handleAddCart(){
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
  <div class="grid-view-item">
    <div class="grid-view-item-image">

      <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+localGoods.actId" title="English Sliced Ham" class="grid__image grid__image__match" tabindex="-1">
        <div class="responsive-image-wrapper" style="">
          <<el-image
          id="collection-image-anim"
          fit="fill"
          class="img-responsive wow fadeIn animated"
          style="width: 20vw; height: 20vw;min-width: 100%; max-height: 230px"
          :src="localGoods.skuImage"></el-image>
        </div>
      </router-link>

      <div class="shop-now-wrapper">
        <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+localGoods.actId" class="shop-now-button jsc-shop-now-button"   >
          Quick View
        </router-link>
      </div>

    </div>

    <div class="grid-view-item--desc-wrapper">
      <div>

        <div class="product-grid--title" style="max-height: 35px">
          <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+localGoods.actId" v-html="localGoods.spuName_en"></router-link>
        </div>

        <div class="product-grid--vendor-text hide-mobile">
          {{localGoods.spuDescribe_en}}
        </div>
        <div class="product-grid--vendor-text hide-desktop"> {{localGoods.spuDescribe_en}}</div>
        <div class="jsc--weight-price-container">
          <div class="jsc-product-grid--weight">
<!--            <span class="var-weight-from 3">250g</span>-->
          </div>
          <div class="product-grid--price">
            <span class="visually-hidden" >Regular price</span>
            <span class="money sale-price">
                $<span class="span">{{localGoods.marketPrice[0]}}</span>.{{localGoods.marketPrice[1]}}
              </span>
            <span class="money line--through " style="padding-left: 8px">${{localGoods.marketPrice[0]}}.{{localGoods.marketPrice[1]}}</span>
          </div>
        </div>
<!--        <div class="hide-mobile jsc&#45;&#45;price-per-unit">
          <span class="float-r">$4.64/100g</span>
          <span class="float-l">Frozen</span>
        </div>-->

      </div>
    </div>


    <div class="quick-add-wrapper is-singular">

      <button  class="quick-add-button" type="submit" @click="handleAddCart" :data-actid = "localGoods.actId" v-if="localGoods.car_count == 0">
        <span class="sr-only" v-if="loadingAddCart">loading...</span>
        <span class="js" v-if="!loadingAddCart">Add to cart</span>
      </button>


      <div class=" js-qty" v-else >
        <button type="button" class="js-qty__adjust js-qty__adjust--minus icon-fallback-text" >
          <i class="fa fa-minus" aria-hidden="true"></i>
          <span class="fallback-text">−</span>
        </button>
        <input type="text" class="js-qty__num" :value="localGoods.car_count"   disabled="">
        <button type="button" class="js-qty__adjust js-qty__adjust--plus icon-fallback-text" :data-actid = "localGoods.actId"  >
          <i class="fa fa-plus" aria-hidden="true"></i>
          <span class="fallback-text">+</span>
        </button>
      </div>

    </div>

  </div>
</template>

<style  >
@import '@/styles/section-featured-collection.css';
.money{
  font-size: 14px;
  font-weight: 500;
}
.money .span{
  font-size: 18px;
}
</style>
