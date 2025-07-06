<script setup lang="ts">
  import IndexAPI from "@/api/index.api.ts";
  import { onMounted, onUnmounted } from 'vue';
  import Slider from './components/Slider.vue'
  import Navigat from './components/Navigat.vue'
  import GoodsSpuGrid from "@/components/GoodsSpuGrid/index.vue";
  import GoodsSpuGrid2 from "@/components/GoodsSpuGrid/GoodsSpuGrid.vue";

  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Zoom,Navigation, Pagination, Autoplay } from 'swiper';
  import 'swiper/css/pagination'; // 分页器样式（按需引入）
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/autoplay';

  import { useAppStore, useCommunityStore} from "@/store";
  import { getAccessToken } from "@/utils/auth";
  import router from "@/router";
  import CommunityAPI from "@/api/community.api";

  const appStore = useAppStore();
  const communityStore = useCommunityStore();
  const community = ref({});
  const open_danhead_model = ref(0);
  const loadOver = ref(false);


  const notices = computed({
    get: () => appStore.notice,
    set: (value) => appStore.notice.value = value,
  });

  const data_slider = ref([]);
  const data_navigat = ref([]);
  const data_goods_list = ref([]);


  const swiperOptions =  {
    loop: true, // 循环模式选项
    autoplay: {
      delay: 3000, // 自动切换的时间间隔（毫秒）
      disableOnInteraction: false, // 用户交互后是否停止自动播放
    }
  };

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
  onMounted(() =>{
    onLoad();

  });
  
  async function onLoad() {
    try {
      loadOver.value = false

      const token = getAccessToken();
      console.log('step1');
      let communityInfo = communityStore.communityInfo;
      let community_id = communityInfo.communityId || '';
      let options = router.params || {}; // 获取动态参数

      communityStore.getCommunityById(options.community_id).then((res) => {
        console.log(res,'step2');
        if (res.code == 0) {
          if (res.open_danhead_model == 1) {
            console.log('开启单社区step7');
            community.value = res.default_head_info;
            open_danhead_model.value = res.open_danhead_model;
            token && addhistory(res.default_head_info.communityId || '');
            communityStore.changeCommunity(res.default_head_info)
          }
          loadPage();
        }

      }).catch((error) => {
        loadPage();
      });


    } catch (error) {
      // 5. 统一错误处理
      ElMessage.warning(error);
      console.error("登录失败:", error);
    }
  }
  
  function addhistory(id = 0) {
    console.log('step13');
    let community_id = 0;
    if (id==0) {
      let community = communityStore.communityInfo;
      community_id = community.communityId;
    } else {
      community_id = id;
    }
    console.log('history community_id=' + community_id);
    const token = getAccessToken();

    community_id !==void 0 && CommunityAPI.addhistory_community({
      community_id: community_id,
      'token': token
    }).then((res) => {
      if(id!=0)
        getHistoryCommunity()

      console.log('addhistory+id', id);
    })

  }

  function getHistoryCommunity(){
    communityStore.getHistoryCommunity().then((res) => {
      console.log(res,'step14');
      if(res.code == 0){
        console.log('getHistoryCommunity');
        let history_communities = res.list;
        let isNotHistory = false;
        if (Object.keys(history_communities).length == 0 || history_communities.communityId == 0)
          isNotHistory = true;

        let resArr = history_communities && history_communities.fullAddress && history_communities.fullAddress.split('省');
        history_communities = Object.assign({}, history_communities, { address: resArr[1] })

        community.value = history_communities;
        communityStore.changeCommunity(history_communities)

        //load_goods_data();

      }
    })
  }
  function loadPage() {
    console.log('step8');
    get_index_info();
    getNavigat();

    load_goods_data();
  }
  function getNavigat() {
    IndexAPI.get_navigat().then((res) =>{
      if(res.code == 0){
        let { data } = res

        data_navigat.value = data;

      }
    })
  }
  function load_goods_data() {
    console.log('load_goods_begin ');
    let token = getAccessToken();
    let cur_community = communityStore.communityInfo;
    IndexAPI.load_index_goodslist({
      'head_id':cur_community.communityId,
      'token':token
    }).then((res) =>{
      if(res.code == 0){
        let { data } = res
        data_goods_list.value = data;

      }
    }).finally(
      setTimeout(function(){  loadOver.value = true },1000)
    )
  }
  
  function get_index_info() {
    let community = communityStore.communityInfo;
    let communityId = community && community.communityId || '';
    let token = getAccessToken();
    IndexAPI.index_info({
      communityId,token
    }).then((res) =>{
        if(res.code == 0){
            let { notice_list ,slider_list } = res
            appStore.changeNotice(notice_list)
            data_slider.value = slider_list;

        }
    })
  }

</script>

<template>
  <div class="flow-homepage" v-loading.fullscreen.lock="!loadOver">

    <Slider v-if="data_slider.length>0" :slider_list = "data_slider" />
    <Navigat :navigat_list = "data_navigat"/>

    <div class="shopify-section featured-products-wrapper" v-for="item in data_goods_list">
      <div class="jsc-featCol-section homepage-sections-wrapper homepage-sections-wrapper--white">
        <div class="wrapper-padded shown-on-scroll animated fadeInUp">
          <div class="homepage-indiv-section-wrapper grid--full homepage-featured-content-wrapper">
            <div class="homepage-featured-rich-text">
              <div class="page-width featured-products-wrapper">
                <div class="jsc-view-all-wrapper">
                  <router-link :to="'/ulink_comshop/pages/type/details?id='+item.id" class="jsc-view-all" >
                    View all
                    <i class="icon-arrow-right" aria-hidden="true"></i>
                  </router-link>
                </div>
                <div class="sitewide--title-wrapper inline jsc-test">
                  <router-link :to="'/ulink_comshop/pages/type/details?id='+item.id">
                    <h2 class="homepage-sections--title" v-html="item.name_en"> </h2>
                  </router-link>
                </div>
                <div class="jsc-view-all-wrapper-mobile">
                  <router-link :to="'/ulink_comshop/pages/type/details?id='+item.id" class="jsc-view-all" >
                    View all
                    <i class="icon-arrow-right" aria-hidden="true"></i>
                  </router-link>
                </div>
              </div>
            </div>

            <div class="grid-uniform homepage-product-grid-wrapper initFrequently flickity-enabled is-draggable jsc-flickity-initiated">
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
                <swiper-slide  v-for="item_goods in item.list"  :class="'jsc-grid-cart grid__item large--one-sixth medium--one-third small--one-third featured-product--grid-item jsc-not-freebies is-selected'">
                  <GoodsSpuGrid  :goods="item_goods"/>
                </swiper-slide>

              </swiper>
            </div>

          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped lang="scss">

.jsc-view-all {
  font-weight: 400;
  color: var(--primary-btn-bg-color);
}
</style>
