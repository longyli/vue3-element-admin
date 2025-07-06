<script setup lang="ts">
  import CommunityAPI, { type CommunityInfo } from "@/api/community.api.ts";
  import GoodsAPI from "@/api/goods.api";
  import { onMounted, onUnmounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useAppStore, useCommunityStore} from "@/store";
  import { useRoute } from "vue-router";
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Zoom,Navigation, Pagination, Autoplay } from 'swiper';
  import 'swiper/css/pagination'; // 分页器样式（按需引入）
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/autoplay';
  import router from "@/router";
  import { getAccessToken } from "@/utils/auth";
  import GoodsSpuGrid from "@/components/GoodsSpuGrid/index.vue";

  const appStore = useAppStore();
  const communityStore = useCommunityStore();
  const data_community  =ref({});
  const data_buy_type  =ref('');
  const data_currentOptions = ref();
  const data_show_goods_preview = ref();
  const data_goods = ref({});
  const data_prevImgArr = ref([])
  const loadOver = ref(true);
  const loadingAddCart = ref(false);
  const data_quantity = ref(1);
  const route = useRoute();
  const data_goods_image_list = ref([])
  const data_actPrice0 = ref('')
  const data_actPrice1 = ref('')
  const data_marketPrice0 = ref('')
  const data_marketPrice1 = ref('')
  const data_description = ref('')
  const data_like_goods_list = ref([])
  const breakpointSettings = {
    320: {
      slidesPerView: 3,
      spaceBetween: 10
    },
    480: {
      slidesPerView: 4,
      spaceBetween: 20
    },
    1024: {
      slidesPerView: 6,
      spaceBetween: 30
    }
  };
  // 监听路径参数变化
  watch(
    () => route.params.id,
    (newId, oldId) => {
      console.log("ID 变化:", newId, oldId);

    },
  );

  onMounted(() =>{

    // 当前本地社区
    let currentCommunity = communityStore.communityInfo;
    let currentCommunity_id = (currentCommunity && currentCommunity.communityId) || '';
    loadOver.value = false
    const options = route.query;
    let buy_type = options.type || '';

    if (options.share_id != 'undefined' && options.share_id > 0) {
      appStore.changeShareId(options.share_id)
    }

    if (options.community_id != 'undefined' && options.community_id > 0 && buy_type!='integral') {
      // 存在分享社区进行比较
      if (currentCommunity_id) {
        console.log('step3 本地社区存在')
        this.paramHandle(options, currentCommunity);
      } else {
        // 当前本地社区不存在
        let community = {};
        community.communityId = options.community_id;

        communityStore.getCommunityInfo().then((res) => {
          console.log('step1 分享来的社区', res);
          paramHandle(options, res);
        }).catch((param)=>{
          console.log('step4 新人')
          if(Object.keys(param) != '')  communityStore.addhistory(param, true);
        });

      }
    }else{
      communityStore.getCommunityInfo(0).then((ret) => {
        console.log('没有分享社区直接访问', ret)
        if (ret.open_danhead_model == 1) {
          let default_head_info = ret.default_head_info;
          console.log('default_head_info', default_head_info)
          communityStore.addhistory(default_head_info)
          communityStore.changeCommunity(default_head_info)
          data_community.value = default_head_info;

          get_goods_details(options.id, default_head_info, '');
        }else{
          communityStore.getCommunityInfo().then(res=>{
            if(res) {
              data_community.value = res;
              get_goods_details(options.id, '', res.communityId);
            } else {
              data_community.value = currentCommunity;
              get_goods_details(options.id, '', currentCommunity_id);
            }
          })
        }
      })
    }



  });

  function paramHandle (options, currentCommunity=""){
    console.log(options,'step2')

    let { id, community_id } = options;
    CommunityAPI.get_community_info(community_id)
      .then((res) => {
        if (res.code == 0) {
          let shareCommunity = res.data;
          console.log(shareCommunity)
          let currentCommunityId = currentCommunity.communityId;
          //单社区
          if (res.open_danhead_model == 1) {
            let default_head_info = res.data.default_head_info;
            addhistory(default_head_info);
            communityStore.changeCommunity(default_head_info)
            data_community.value = default_head_info
            get_goods_details(id, default_head_info, '');
          } else {
            if (currentCommunityId == community_id || shareCommunity=='') {
              console.log('step5 分享与本地相同')
              communityStore.changeCommunity(default_head_info)
              data_community.value = default_head_info
              get_goods_details(id, default_head_info, '');
            } else {
              get_goods_details(options.id, '', currentCommunityId, 1);
            }
          }
        }
      })
      .catch((error) => {
        ElMessageBox.alert(error, 'Hint', {
          confirmButtonText: 'OK',
          callback: (action: Action) => {
            router.replace("/ulink_comshop/pages/index/index")
          },
        })
      });

  }
  function get_goods_details(id, communityInfo='', currentCommunity_id, laterShowCanBuy=0) {

    if(!id) {
      loadOver.value = true
      ElMessageBox.alert('Parameter error', 'Hint', {
        confirmButtonText: 'OK',
        callback: (action: Action) => {
          router.replace("/ulink_comshop/pages/index/index")
        },
      })
      return false;
    }
    let token = getAccessToken();
    if(communityInfo)
      currentCommunity_id = communityInfo.communityId;

    GoodsAPI.get_goods_detail({
      token,
      id,
      'community_id':currentCommunity_id
    }).then((res)=>{
      setTimeout(function(){  loadOver.value = true },1000);
      let { goods, is_can_headsales } = res.data;
      // 商品不存在
      if (!goods || goods.nogoods || Object.keys(goods) == '') {
        ElMessageBox.alert('This product does not exist. ', 'Hint', {
          confirmButtonText: 'OK',
          callback: (action: Action) => {
            router.replace("/ulink_comshop/pages/index/index")
          },
        })
        return false;
      }
      goods_guess_like(goods.id);
      if(is_can_headsales==0 && data_buy_type!='integral') {
        if(laterShowCanBuy==0) {
          //that.canBuyTip();
        }
      }

      // 幻灯片预览数组
      let goods_images = res.data.goods_image || '';
      let prevImgArr = [];
      if (Object.prototype.toString.call(goods_images) == '[object Array]' && goods_images.length > 0) {
        goods_images.forEach(function (item) { prevImgArr.push(item.image); })
      }
      data_prevImgArr.value = prevImgArr;

      data_goods_image_list.value.splice(0, data_goods_image_list.length, prevImgArr[0]);
      //群分享
      let isopen_community_group_share = res.isopen_community_group_share || 0;
      let group_share_info = res.group_share_info;

      // 关联商品
      let relative_goods_list = res.relative_goods_list || [];
      let relative_goods_list_arr = [];
      if (Object.prototype.toString.call(relative_goods_list) == '[object Object]' && Object.keys(relative_goods_list).length > 0) {
        Object.keys(relative_goods_list).forEach(function (item) {
          relative_goods_list_arr.push(relative_goods_list[item]);
        })
      } else {
        relative_goods_list_arr = relative_goods_list;
      }

      // 会员
      let { is_need_subscript, need_subscript_template, is_open_vipcard_buy, modify_vipcard_name, is_vip_card_member, modify_vipcard_logo, is_member_level_buy, is_only_hexiao, hexiao_arr, is_hide_details_count } = res;
      let goodsPrice = goods.price || 0;
      let goodsCardPrice = goods.card_price || 0;
      goods.feePrice = (goodsPrice - goodsCardPrice).toFixed(2);

      // 佣金
      let { is_commiss_mb, commiss_mb_money, is_goods_head_mb, goods_head_money } = res.data;

      let hx_len = Object.keys(hexiao_arr).length;
      data_currentOptions.value = res.options;

      //开启全屏视频
      let showCoverVideo = false;
      if(goods.video && res.is_open_goods_full_video==1) {
        showCoverVideo = true
      }

      let goodsImg = res.data.goods_image || [];

      data_show_goods_preview.value = res.show_goods_preview || 0;
      let is_close_details_time = res.is_close_details_time || 0;

      data_goods.value = goods;
      console.log(data_goods.value.actPrice[0])
      data_actPrice0.value = goods.actPrice[0] || ''
      data_actPrice1.value = goods.actPrice[1] || ''
      data_marketPrice0.value = goods.marketPrice[0] || ''
      data_marketPrice1.value = goods.marketPrice[1] || ''
      data_description.value = goods.description;
    })


  }
  
  function goods_guess_like(id) {
    const token = getAccessToken();
    const head_id = communityStore.communityInfo.communityId;

    GoodsAPI.goods_guess_like({
      token,head_id,id,
      is_random:1,
      pageNum:1,

    }).then((res) =>{
      if(res.code == 0){
        data_like_goods_list.value = res.list;
      }
    })
  }

  function handleGoodsImageThumbnail(image) {
    data_goods_image_list.value.splice(0, data_goods_image_list.length, image);
  }
  function updQuantity(e,val){
    console.log(val)
    console.log(e)
      if(data_quantity.value+val > 0){
        data_quantity.value = data_quantity.value+val;
      }
  }
  
  

</script>

<template>

  <div class="wrapper-padded" >
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <a href="/" title="Back to the frontpage">Home</a>
      <span aria-hidden="true">›</span>
      <span class="text-link">Product Details</span>
      <span aria-hidden="true">›</span>
      <span class="text-link">Woodland Bronze Free Range Turkey</span>
    </nav>
  </div>

  <div class="wrapper main-content page-main--wrapper"  v-loading.fullscreen.lock="!loadOver">


    <div id="shopify-section-template--14811414528063__product-form" class="shopify-section">
      <link href="//cdn.shopify.com/s/files/1/0851/5244/t/87/assets/plyr.min.css?v=145002914688102062981700714195"
            rel="stylesheet" type="text/css" media="all">
      <link
        href="//cdn.shopify.com/s/files/1/0851/5244/t/87/assets/shopify-model-viewer-ui.min.css?v=51288748339611295601700714195"
        rel="stylesheet" type="text/css" media="all">

      <div itemscope="" class="jsc-prod-temp">
        <div class="product-media-templates">
        </div>
        <div class="wrapper-padded product-form-vue main-page-container jsc-product-template">
          <div class="product-single-wrapper">
            <div class="grid product-single product-sticky-wrapper variant-swatches-enabled">
              <div class="grid__item large--six-twelfths context mobile--no-top-margin">
                <div class="product-images-container">
                  <div class="product-medias product-medias__with-thumbnails product-medias__with-thumbnails--right">
                    <div class="product-medias__main">
                      <div class="jsc-pfs-product-item-label">
                        <span class="jsc-new-label jsc-pfs-label save variant-percentage"></span>
                      </div>
                      <div class="swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-autoheight">

                        <swiper
                          ref="basicSwiperRef"
                          :modules="[Navigation, Pagination]"
                          :navigation="true"
                          :pagination="{ el: '.custom-pagination-basic', clickable: true }">
                          <swiper-slide v-for="(item, index) in data_goods_image_list" :key="index">
                            <div   class="product-medias__media">
                              <img :src="item"  loading="lazy">
                            </div>
                          </swiper-slide>
                        </swiper>
                        <div class="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets"></div>
                        <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span></div>
                    </div>
                    <div class="product-medias__thumbnails" >
                      <a @click="handleGoodsImageThumbnail(img)"  class="product-medias__thumbnail" v-for="(img , index) in data_prevImgArr">
                        <div class="responsive-image-wrapper">
                          <el-image class="product-medias__thumbnail__image product-medias__thumbnail--image fadeIn wow js animated"  :src="img" fit="cover" />

                        </div>
                      </a>

                    </div>
                  </div>
                </div>
              </div>
              <div class="grid__item large--six-twelfths product-sticky" style="top: 103px;">
                <div>
                  <div class="product-details-wrapper">
                    <div itemprop="offers" itemscope="itemscope" itemtype="http://schema.org/Offer"
                         class="product-details--form-wrapper product-details--form-wrapper---in-stock">
                      <meta itemprop="priceCurrency" content="SGD">
                      <div  class="jsc-pdp-form form-vertical">
                        <form method="post" action="/cart/add" id="AddToCartForm" accept-charset="UTF-8"
                              enctype="multipart/form-data" class="shopify-product-form">

                          <h1 itemprop="name" class="product-details-product-title">{{data_goods.goodsname_en}}</h1>
                          <div class="product__meta--sku-vendor">
<!--                            <div class="product__meta&#45;&#45;vendor">
                              <h4>Hogan's Farm</h4>
                            </div>-->
                            <div class="jsc-pdp-weight-wrap">
                              {{data_goods.subtitle}}
                            </div>
                          </div>
<!--                          <div data-option-index="0" class="swatch clearfix">
                            <div class="swatch-items-wrapper clearfix jsc-option-selected">
                              <div class="swatch-element 4-00kg-4-49kg available jsc-option-selected">
                                <input  type="radio" name="option-1" value="4.00kg - 4.49kg" checked="checked" class="visually-hidden">
                                <label>4.00kg - 4.49kg</label>
                              </div>
                              <div  class="swatch-element 4-50kg-5-00kg soldout jsc-option-selected">
                                <input type="radio" name="option-1" value="4.50kg - 5.00kg" onclick="showperunit('39903354191935')"
                                 class="visually-hidden">
                                <label>4.50kg - 5.00kg</label>
                              </div>
                            </div>
                          </div>-->

                          <div class="jsc-qty-selector swatches-wrapper col-md-6 col-sm-12 col-xs-12"><label
                            for="Quantity" class="quantity-selector product-sub-label hide">Quantity</label>
                            <div class="js-qty">
                              <button type="button" aria-label="-" @click="updQuantity(this, -1);"
                                      class="js-qty__adjust js-qty__adjust--minus icon-fallback-text p-l-20"><i
                                aria-hidden="true" class="fa fa-minus"></i> <span class="fallback-text">−</span>
                              </button>
                              <input type="text" :value="data_quantity" min="1" aria-label="quantity" pattern="[0-9]*"
                                     name="quantity" id="Quantity" class="js-qty__num">
                              <button type="button" aria-label="+" @click="updQuantity(this, 1);"
                                      class="js-qty__adjust js-qty__adjust--plus icon-fallback-text p-r-20"><i
                                aria-hidden="true" class="fa fa-plus"></i> <span class="fallback-text">+</span></button>
                            </div>

                          </div>
<!--                          <span class="visually-hidden">Sale price</span>-->
                          <p id="ComparePrice" class="sale-price">
                            <span class="money"> $ {{data_marketPrice0}}.{{data_marketPrice0}}</span>
                          </p>
<!--                          <span class="visually-hidden">Regular price</span>-->
                          <span id="ProductPrice"  class="h2">
                            <span class="money" >
                              $ {{data_actPrice0}}.{{data_actPrice1}}
                            </span>
                          </span>
                          <div class="jsc-per-unit-pdp-wrap">
                            <span class="jsc-per-unit-pdp">{{data_goods.subtitle_en}}</span>
                          </div>

                          <div class="paymentButtonsWrapper">
                            <div >
                                <button type="submit" aria-label="Add to cart" name="add" id="AddToCart"
                                      onclick="chkShipping();" class="btn jsc-atcbutton" style="display: inline-block;">
                                        <span class="sr-only" v-if="loadingAddCart">loading...</span>
                                        <span class="js" v-if="!loadingAddCart">Add to cart</span>
                                </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div class="pdp-icons text-left"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>


    </div>
    <div id="shopify-section-template--14811414528063__product-description" class="shopify-section">


      <div class="jsc-wrapsection wrapper-padded product-description-container">
        <div class="jsc-desc-wrappper">
          <ul class="jsc-tabs desc-tab-styling">

            <li class="nav-tabs-item">
            <span   class="nav-tab  nav-tab-active ">
              Description
            </span>
            </li>

          </ul>

          <div id="description" class="tab-content  tab-content-active " >
            <p v-html="data_description"></p>
          </div>

        </div>

        <div id="bundler-target-element"></div>
      </div>


    </div>
    <div id="shopify-section-template--14811414528063__product-recommendations" class="shopify-section" v-if="data_like_goods_list.length>0">
      <div class="product-recommendations">
        <div class="product-page-related-products product-sticker-stop">
          <div class="wrapper-padded">
            <div class="sitewide--title-wrapper">
              <h2 class="page--title">You may also like</h2>
            </div>

            <div class="product-recommendations__slideshow grid-uniform">
              <div class="initRecommendation flickity-enabled is-draggable jsc-flickity-initiated" tabindex="0">

                <swiper
                  ref="{swiperRef}"
                  :breakpoints="breakpointSettings"
                  :class="'flickity-slider'"
                  :style="{
                      '--swiper-navigation-color': '#fff',
                      '--swiper-pagination-color': '#fff',
                     }"
                  :navigation="true"
                  :modules="[Zoom, Navigation, Pagination,Autoplay]">
                  <swiper-slide  v-for="item_goods in data_like_goods_list"  :class="'jsc-grid-cart grid__item large--one-sixth medium--one-third small--one-third featured-product--grid-item jsc-not-freebies is-selected'">
                    <GoodsSpuGrid  :goods="item_goods"/>
                  </swiper-slide>

                </swiper>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>


  </div>
</template>


<style scoped lang="scss">

@media only screen and (min-width: 768px) {
  #recently-viewed-products .grid__item.swiper-slide {
    width: 16.666%;
  }
}

@media only screen and (min-width: 481px) and (max-width: 767px) {
  #recently-viewed-products .grid__item.swiper-slide {
    width: 25%;
  }
}

@media only screen and (max-width: 480px) {
  #recently-viewed-products .grid__item.swiper-slide {
    width: 50%;
  }
}
</style>
