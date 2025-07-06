<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps({
  navigat_list: {
    type: Array,
    default: () => []
  },
});

</script>

<template>


  <div class="shopify-section homepage-section--slideshow-wrapper shown-on-scroll animated fadeInUp" style="margin-top: 50px">
    <div class="wrapper-padded homepage-slider-container jsc-navigat-show" >
      <div class="col-md-12">
        <div class="swiper-container slideshow--full-width swiper-container-initialized swiper-container-horizontal">
          <div class='nav-list'>
            <div class="nav-list-item" v-for="(item, index) in navigat_list" >
              <el-image style="width: 50%;height: auto" class="nav-list-img" :src="item.thumb" ></el-image>
              <div class='nav-list-text'>{{item.navname}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>



</template>

<style scoped lang="scss">
@media (max-width: 1240px) {
  .jsc-navigat-hide {
    display: none!important
  }
}
@media (min-width: 1240px) {
  .jsc-navigat-show {
    display: none!important
  }
}

/* 导航列表 S */

.nav-list {
  position: relative;
  z-index: 1;
  display: flex;
  padding: 0 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.nav-list-item {
  width: 20%;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.nav-list-item .nav-list-img {
  width: 86px;
  height: 86px;
  margin: 0 auto;
}

.nav-list-item .nav-list-text {
  text-align: center;
  color: black;
  font-weight: 400;
  font-size: 3vw;
}

.nav-contact {
  font-size: inherit;
  line-height: inherit;
  border-radius: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}

.nav-contact::after {
  content: none;
}

.nav-list-item.nav-contact .nav-list-img {
  left: 0;
}

/* 导航列表 E */

</style>
