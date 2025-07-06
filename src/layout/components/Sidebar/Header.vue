<script setup lang="ts">
import logo from '@/assets/images/logo-header.png'
import LangSelect from "@/components/LangSelect/index.vue";
import IndexAPI from "@/api/index.api.ts";
import { onMounted } from 'vue'
import { useUserStore,useCartStore } from "@/store";
import router from "@/router";

const userStore = useUserStore();
const cartStore = useCartStore();

const  navList = ref([]);
const drawer = ref(false);
const searchDrawer = ref(false);
const loading = ref(false);
const cartNum = computed(() => cartStore.cartNum); // 是否显示标签视图
function handleMdFocus(event) {
  event.expansion = true
}
function handleMdBlur(event) {
  event.expansion = false
}

function handleToCart() {

  userStore.check_login().then((res)=>{
    router.push("/ulink_comshop/pages/order/shopCart");
  }).catch((error)=>{
    router.push("/ulink_comshop/pages/user/login");
  })
}

async function handleAccount(){
  try {
    //获取用户信息
    await userStore.getUserInfo();
    router.push('/ulink_comshop/pages/user/me');
  } catch (error) {
    // console.error("登录失败:", error);
    router.push('/ulink_comshop/pages/user/login');
  }
}
onMounted(() => {
  // 示例：获取数据
  fetchNavData()

})

function fetchNavData() {
  loading.value = true;
  IndexAPI.get_web_menu_list()
    .then((data) => {
        if(data.code == 0){
          navList.value=data.data
        }
    })
    .finally(() => (loading.value = false));
}

</script>

<template>
  <el-drawer style="--el-drawer-padding-primary:0px;right:-767px" append-to-body lock-scroll class="drawer drawer--right drawer--cart" direction="rtl" v-model="searchDrawer" :show-close="false" :with-header="false">
    <div class="drawer__header sitewide--title-wrapper">
      <div class="drawer__close js-drawer-close">
        <button type="button" class="icon-fallback-text" @click="searchDrawer = false">
          <span class="fallback-text">Close cart</span>
        </button>
      </div>
      <div class="drawer__title h2 page--title"> <span>Search</span></div>
    </div>
    <div id="SearchContainer">
      <div class="search-drawer">
        <div class="input-group">
              <span class="input-group-btn">
                <button type="submit" tabindex="0" class="btn icon-fallback-text"><i class="fa fa-search"></i>
                  <span class="fallback-text">Search</span>
                </button>
              </span>
          <div class="search-input-group">
            <form action="/ulink_comshop/pages/index/search" method="get" >
              <input type="search" name="q" id="boost-pfs-search-box-0" placeholder="Search" >
            </form>
          </div>
        </div>
        <div class="wrapper-padded">
          <div id="search-results" class="grid-uniform" style="display: none !important">
            <div></div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>

  <div id="shopify-section-header" :class="['shopify-section', 'header-section', 'sticky-header', 'sticked','sticky-header-transformed', drawer ? 'js-drawer-open js-drawer-open-left' : '' , 'sticked']">
    <div class="header-section--wrapper" data-wetheme-section-type="header" data-wetheme-section-id="header"
         data-header-sticky="true">
      <div id="NavDrawerOverlay" class="drawer-overlay"></div>
      <div id="NavDrawer" class="drawer drawer--left">

        <div class="mobile-nav__logo-title">
          <div class="mobile-nav__grow">

          </div>
          <a class="mobile-menu--close-btn" aria-label="Close menu" role="button" @click="drawer = false" tabindex="-1"></a>
        </div>

        <div class="jsc-search-mob-drawer mobile-nav__top">
          <span class="mobile-nav__search">
            <div  method="get" class="input-group search-bar" role="search">
             <input type="search" name="q" value="" placeholder="Search" class="input-group-field boost-pfs-search-box"
                    aria-label="When autocomplete results are available use up and down arrows to review and enter to select"
                    autocomplete="off" id="boost-pfs-search-box-0" data-search-box="boost-pfs-search-box-0" role="combobox"
                    aria-expanded="false" aria-autocomplete="list" aria-owns="boost-pfs-search-suggestion-0"
                    data-already-init="true">
             <span class="input-group-btn hidden">
               <button type="submit" class="btn icon-fallback-text" tabindex="-1"  >
                 <i class="fa fa-search"></i>
                 <span class="fallback-text">Search</span>
               </button>
             </span>
            </div>
          </span>
        </div>

        <!-- begin mobile-nav -->
        <ul class="mobile-nav">

          <li class="mobile-nav__item">
            <div class="mobile-nav__has-sublist">
              <router-link  to="/ulink_comshop/pages/index/index" @click="drawer = false">
                <img class="text-center" style="width:30px;height:auto;margin-top: 5px;" src="/images/Home_Icons-02.webp">
              </router-link>
              <div class="mobile-nav-account float-r">
                <router-link to="/ulink_comshop/pages/user/me" title="Account" @click="drawer = false">
                  <i class="fa fa-user fa-lg"></i>
                </router-link>
              </div>
            </div>
          </li>
          <li class="jsc-main-menu mobile-nav__item" aria-haspopup="true" v-for="nav in navList">
            <div :class="['mobile-nav__has-sublist',nav.expansion ? 'mobile-nav--expanded': '' ]">
              <router-link  :to="nav.href" class="mobile-nav__link"  @click="drawer = false" v-html="nav.text"></router-link>
              <div class="mobile-nav__toggle">
                <button type="button" class="icon-fallback-text" v-if="nav.subNav && !nav.expansion"  aria-label="See more"
                        tabindex="-1" @click="handleMdFocus(nav)">
                  <i class="icon-arrow-right" aria-hidden="true"></i>
                </button>
                <button type="button" class="icon-fallback-text"  v-if="nav.subNav && nav.expansion" @click="handleMdBlur(nav)"  aria-label="Close menu"
                        tabindex="-1">
                  <i class="icon-arrow-down" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <ul class="mobile-nav__sublist">
              <li class="mobile-nav__item " v-for="subNav in nav.subNav">
                <router-link  :to="subNav.href" class="mobile-nav__link"  @click="drawer = false" v-html="subNav.text">
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
        <!-- //mobile-nav -->
      </div>


      <header class="jsc-christmas site-header medium--hide small--hide logo_above" >
        <div class="site-header__wrapper site-header__wrapper--logo-above site-header__wrapper--with-menu">
          <div class="site-header__wrapper__left">
            <img src="/images/Tagline.webp" alt=""
                 style="width:auto; max-height: 45px">
          </div>

          <div class="site-header__wrapper__center">
            <div class="site-header__logowrapper">
              <div class="site-header__logo h1 site-title"  >
                <router-link to="/ulink_comshop/pages/index/index" itemprop="url" class="site-header__logo-image">
                  <div class="responsive-image-wrapper" style="">
                    <img loading="lazy" class=" js" style="" alt="Sasha's Fine Foods" itemprop="logo" width="246"
                         height="82"
                         :src="logo">
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <div class="site-header__wrapper__right top-links">
            <ul class="site-header__links top-links--icon-links">
              <li>
                <a  class="search-button" aria-label="Search" >
                  <LangSelect  style="color: white;font-size: 20px" />
                </a>

              </li>

              <li>
                <a @click="searchDrawer = true" class="search-button" aria-label="Search" >
                  <i class="fa fa-search fa-lg"></i>
                </a>
              </li>

              <li>
                <a  @click="handleAccount"  title="Log in" class="log-in-button">
                  <i class="fa fa-user fa-lg"></i>
                </a>
              </li>
              <li>
                <a  class="site-header__cart-toggle" @click="handleToCart">
                  <i class="fa fa-shopping-cart fa-lg"></i>
                  <span class="jsc-cart-count header--supporting-text" v-if="cartNum>0">{{cartNum}}</span>
                  <span class="header--supporting-text"><span
                      class="cart-item-count-header cart-item-count-header--total hide"><span
                      class="money">$0.00</span></span></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="site-header__nav-standalone">

          <div class="js site-header__nav top-links" id="top_links_wrapper">
            <ul class="jsc-main-nav-wrap site-nav mega-menu-wrapper js" id="AccessibleNav" role="navigation">
              <li class="jsc-home-menu m-r-10 site-nav--has-dropdown">
                <router-link to="/ulink_comshop/pages/index/index">
                <img class="text-center" style="width:20px;height:auto"
                     src="/images/Home_Icons-02.webp">
                </router-link>
              </li>

              <li v-for="nav in navList"  :class="['site-nav--has-dropdown',nav.expansion ? 'nav-hover': '']" aria-haspopup="true" v-on:mouseenter="handleMdFocus(nav)"
                  v-on:mouseleave="handleMdBlur(nav)">
                <router-link  :to="nav.href" class="site-nav__link" >
                  <div class="site-nav--link-wrapper">
                    <span class="site-nav--link-text" v-html="nav.text">
                    </span>
                    <span class="jsc-hide-dropdown icon-dropdown">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19.5" height="19.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                </router-link>
                <ul class="site-nav__dropdown standard-dropdown" v-if="nav.subNav">
                  <li v-for="subNav in nav.subNav" >
                    <router-link  :to="subNav.href" class="site-nav__link">
                       <span >{{subNav.text}}</span>
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

      </header>

      <nav class="jsc-christmas-mobile nav-bar mobile-nav-bar-wrapper large--hide medium-down--show jsc-new-header">
        <div class="wrapper-padded">
          <div class="large--hide medium-down--show">
            <div class="mobile-grid--table">

              <div class="grid__item three-twelfths">
                <div class="site-nav--mobile">
                  <button type="button" aria-label="Navigation"
                          class="icon-fallback-text site-nav__link js-drawer-open-left-link" aria-controls="NavDrawer" @click="drawer = true"
                          aria-expanded="false">
                    <i class="fa fa-bars fa-2x"></i>
                    <span class="fallback-text">Navigation</span>
                  </button>
                </div>
              </div>

              <div class="grid__item six-twelfths">

                <div class="site-header__logowrapper">
                  <div class="site-header__logo h1 site-title" itemscope="" itemtype="http://schema.org/Organization">
                    <a href="/" itemprop="url" class="site-header__logo-image">
                      <div class="responsive-image-wrapper" style="">
                        <img loading="lazy" class=" js" style="" alt="Sasha's Fine Foods" itemprop="logo" width="246"
                             height="82"
                             :src="logo">
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div class="grid__item three-twelfths right-side has-search-icon">
                <div class="site-nav--mobile">
                  <li>
                    <router-link to="/" class="swym-wishlist" data-swym-loaded="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18px" aria-hidden="true" focusable="false"
                           data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img"
                           viewBox="0 0 512 512">
                        <path fill="currentColor"
                              d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                      </svg>
                    </router-link>
                  </li>

                  <li>
                    <a  @click="handleAccount" title="Log in" class="log-in-button">
                      <i class="fa fa-user fa-lg"></i>
                    </a>
                  </li>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped lang="scss">
:root {
  --logo-max-width: 160px;
}

.site-title {
  padding: 15px 0;
}

.site-header .site-header__wrapper .site-header__wrapper__center {
  flex-basis: 160px;
}

.site-nav__dropdown li, .inner .h4, .inner .h5 {
  text-align: left;
}

.template-index .header-section.sticky-header:not(.sticked) .overlay-header,
.template-index .header-section:not(.sticky-header) .overlay-header,
.template-list-collections .header-section.sticky-header:not(.sticked) .overlay-header,
.template-list-collections .header-section:not(.sticky-header) .overlay-header,
.contact-page .header-section.sticky-header:not(.sticked) .overlay-header,
.contact-page .header-section:not(.sticky-header) .overlay-header {
  background-color: rgba(0, 0, 0, 0.0);
}

.overlay-header .grid--full {
  padding-left: 30px;
  padding-right: 30px;
}

@media only screen and (min-width: 768px) and (max-width: 1200px) {
  .overlay-header .grid--full {
    padding-left: 15px;
    padding-right: 15px;
  }
}

.template-index .overlay-header-wrapper,
.template-list-collections .overlay-header-wrapper,
.contact-page .overlay-header-wrapper {
  max-height: 0px !important;
  min-height: 0px !important;
}

.template-index .overlay-header.force-hover,
.template-list-collections .overlay-header.force-hover
.contact-page .overlay-header.force-hover {
  background-color: #b89a68;
}


@media screen and (max-width: 768px) {
  .site-header__logo-image img,
  .site-header__logo-overlay-image img {
    width: 100px !important;
  }
}
</style>
