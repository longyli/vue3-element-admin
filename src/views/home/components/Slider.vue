<!--首页幻灯片-->
<script setup lang="ts">
import { defineProps } from 'vue';
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css/pagination'; // 分页器样式（按需引入）
import { Zoom, Navigation, Pagination,Autoplay } from 'swiper';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';



const props = defineProps({
  slider_list: {
    type: Array,
    default: () => []
  },
});




</script>

<template>
  <div class="shopify-section homepage-section--slideshow-wrapper shown-on-scroll animated fadeInUp">
    <div class="wrapper-padded homepage-slider-container  ">
      <div class="row">
        <div class="page-width col-md-12">
          <div class="jsc-slideshow-container row">
            <div class="jsc-left-banner col-md-12" >
              <swiper
                :autoplay="{delay: 5000, disableOnInteraction: false }"
                :style="{
                      '--swiper-navigation-color': '#fff',
                      '--swiper-pagination-color': '#fff',
                     }"
                class="swiper-wrapper align-center"
                :slides-per-view="1"
                :modules="[Pagination,Autoplay]"
                :navigation="true">
                <swiper-slide v-for="(slide, index) in slider_list" :key="index">
                  <img loading="lazy" class=" js" style="max-height: 286px"     :src="slide.image">
                </swiper-slide>
              </swiper>
            </div>
            <div class="jsc-right-banner col-md-12">
              <div class="responsive-image-wrapper  slideshow-desktop-as-mobile-image" style="">
                <img  loading="lazy" class=" js" style="max-height: 286px"     src="https://cdn.shopify.com/s/files/1/0851/5244/files/Shopify_Side_Banner_Desktop_In_Use_9_1445x.png?v=1747615536">
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

<!--  <div class="shopify-section homepage-section&#45;&#45;slideshow-wrapper shown-on-scroll animated fadeInUp">
    <div class="homepage-slider-container jsc-mobile-slideshow">
      <div class="row">
        <div class="col-md-12">
          <div class="swiper-container slideshow&#45;&#45;full-width swiper-container-initialized swiper-container-horizontal">
            <swiper  class="swiper-wrapper align-center"

                     :space-between="50">
              <swiper-slide v-for="(slide, index) in slides" :key="index">
                <img loading="lazy" class=" js" style="" alt="Sasha's Fine Foods"   sizes="100vw" :src="slide.image">
              </swiper-slide>
            </swiper>
          </div>
        </div>
      </div>
    </div>
  </div>-->

<!--  <div class="shopify-section homepage-section&#45;&#45;slideshow-wrapper shown-on-scroll animated fadeInUp">
    <div class="homepage-slider-container jsc-mobile-slideshow">
      <div class="row">
        <div class="col-md-12">
          <swiper :space-between="50" :wrapper-class="'align-center'">
            <swiper-slide v-for="(slide, index) in notifications" :key="index">
              <img loading="lazy" class=" js" style="" alt="Sasha's Fine Foods"   sizes="100vw" :src="slide.image">
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
  </div>-->
</template>

<style scoped lang="scss">
.jsc-view-all {
  font-weight: 400;
  color: var(--primary-btn-bg-color);
}
</style>
