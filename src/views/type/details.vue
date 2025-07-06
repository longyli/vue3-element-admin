<script setup lang="ts">
  import GoodsAPI from "@/api/goods.api";
  import GoodsItemGrid from "./components/GoodsItemGrid.vue";
  import GoodsItemList from "./components/GoodsItemList.vue";
  import { useRoute } from "vue-router";
  import { useAppStore, useCommunityStore} from "@/store";
  import { getAccessToken } from "@/utils/auth";
  import { onMounted, onUnmounted } from 'vue';
  import { ElMessageBox } from "element-plus";
  import type { Action } from 'element-plus'

  import router from "@/router";
  import handleBeforeInput from "@wangeditor-next/editor/dist/core/src/text-area/event-handlers/beforeInput";

  const route = useRoute();
  const appStore = useAppStore();
  const communityStore = useCommunityStore();
  const loadOver = ref(true);
  const date_id = ref(undefined);
  const data_needAuth = ref(true)
  const selectedFruits = ref([]); // 数组元素为label的值
  // 使用 reactive
  const state = reactive({
    needAuth: false,
    cate_info_list:[],
    rushList:[]

  });


  onMounted(() =>{
    const options = route.query;
    let id = options.id || '';
    date_id.value = id;
    if (id) {
      getData();
    } else {
      ElMessageBox.alert('Parameter error', 'Hint', {
        confirmButtonText: 'OK',
        callback: (action: Action) => {
          router.replace("/ulink_comshop/pages/index/index")
        },
      })
      return false;

    }
  })

  function getData() {
    loadOver.value = false
    let token = getAccessToken();
    let cur_community = communityStore.communityInfo;
    let gid = date_id.value;

    GoodsAPI.load_cate_goodslist({
      token: token,
      head_id: cur_community.communityId,
      gid
    }).then((res) => {

        if(res.code == 0 ){
          const  list =  res.list;
          state.cate_info_list = list;
          list.forEach(item =>{
            state.rushList = [...state.rushList, ...item['list']];
          })

        }

    }).finally(()=>{
      setTimeout(function(){  loadOver.value = true },1000);
    })
  }
  
  function handleFilterCateChange(vals) {
    console.log(vals)
    state.rushList = [];
    if(vals.length>0){
        vals.forEach(idx =>{
          state.rushList = [...state.rushList, ...state.cate_info_list[idx]['list']];
        })
    }else{
      handleClearProductSelect();
    }
  }
  function handleClearProductSelect(){
    selectedFruits.value = [];
    state.cate_info_list.forEach(item =>{
      state.rushList = [...state.rushList, ...item['list']];
    })

  }

</script>

<template>

  <div class="main-content page-main--wrapper" v-loading.fullscreen.lock="!loadOver" v-if="state.cate_info_list.length>0">

    <div class="collection-wrapper wrapper">
      <div id="shopify-section-template--14811413020735__collection-header" class="shopify-section">
        <header class="section-header collection">
          <div class="boost-pfs-filter-collection-header-wrapper">
            <div class="boost-pfs-container-default">
              <div class="boost-pfs-section-header">
                <h1 class="boost-pfs-filter-collection-header">
                  <span role="text">{{ state.cate_info_list[0]['cate_info'].name_en }}</span>
                </h1>
              </div>
            </div>
          </div>
          <div class="boost-pfs-filter-toolbar-top-mobile" style="display: none">
            <div
              class="boost-pfs-filter-top-sorting boost-pfs-filter-top-sorting-mobile boost-pfs-filter-custom-sorting">
              <button class="boost-pfs-filter-top-sorting-wrapper"><span><span>   Sort by  </span></span></button>
              <ul class="boost-pfs-filter-filter-dropdown">
                <li><a href="#" data-sort="best-selling" class="">Best selling</a></li>
                <li><a href="#" data-sort="price-ascending" class="">Price ascending</a></li>
                <li><a href="#" data-sort="price-descending" class="">Price descending</a></li>
                <li><a href="#" data-sort="manual" class="boost-pfs-filter-sort-item-active">Featured</a></li>
                <li><a href="#" data-sort="title-ascending" class="">Title A-Z</a></li>
                <li><a href="#" data-sort="title-descending" class="">Title Z-A</a></li>
                <li><a href="#" data-sort="relevance" class="">Relevance</a></li>
                <li><a href="#" data-sort="manual" class="">All Products</a></li>
              </ul>
            </div>
            <div class="boost-pfs-filter-tree-mobile-button">
              <button type="button" aria-label="Refine By">Refine By</button>
            </div>
          </div>
          <div class="boost-pfs-filter-default-toolbar">
            <div class="boost-pfs-container-default boost-pfs-filter-default-toolbar-inner">
              <div class="boost-pfs-filter-toolbar-item boost-pfs-filter-toolbar-type">
                <div class="boost-pfs-filter-top-display-type"><span>View As</span><a
                  href="" title="Grid view"
                  class="boost-pfs-filter-display-item boost-pfs-filter-display-grid active" data-view="grid"><span
                  class="icon-fallback-text"><span class="fallback-text">Grid view</span></span></a><a
                  href="" title="List view"
                  class="boost-pfs-filter-display-item boost-pfs-filter-display-list" data-view="list"><span
                  class="icon-fallback-text"><span class="fallback-text">List view</span></span></a></div>
              </div>
              <div class="boost-pfs-filter-toolbar-item boost-pfs-filter-toolbar-count">
                <span class="boost-pfs-filter-total-product">{{ state.rushList.length }}<span> Products</span></span>
              </div>
              <div style="display: none"
                   class="boost-pfs-filter-toolbar-item boost-pfs-filter-custom-sorting boost-pfs-filter-top-sorting">
                <button class="boost-pfs-filter-top-sorting-wrapper"><span><span>   Sort by  </span></span></button>
                <ul class="boost-pfs-filter-filter-dropdown">
                  <li><a href="#" data-sort="best-selling" class="">Best selling</a></li>
                  <li><a href="#" data-sort="price-ascending" class="">Price ascending</a></li>
                  <li><a href="#" data-sort="price-descending" class="">Price descending</a></li>
                  <li><a href="#" data-sort="manual" class="boost-pfs-filter-sort-item-active">Featured</a></li>
                  <li><a href="#" data-sort="title-ascending" class="">Title A-Z</a></li>
                  <li><a href="#" data-sort="title-descending" class="">Title Z-A</a></li>
                  <li><a href="#" data-sort="relevance" class="">Relevance</a></li>
                  <li><a href="#" data-sort="manual" class="">All Products</a></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
      </div>
      <section id="shopify-section-template--14811413020735__filtering"
               class="shopify-section collection-filtering-section spaced-section" style="display: none;">

        <div class="collection-filters collection-filters__sidebar" id="main-collection-filters"
             data-id="template--14811413020735__filtering">

          <button type="button" class="mobile-facets__open btn btn--large" data-drawer-open-btn="">
            Filter and sort
          </button>

          <div class="container">
            <div class="active-facets active-facets-mobile">
              <a href="/"
                 class="active-facets__button button button--secondary js-facet-remove">Clear all</a>

            </div>
          </div>
        </div>


      </section>
      <div id="shopify-section-template--14811413020735__product-grid"
           class="shopify-section collection-grid main-page-container wrapper-padded">


        <div id="CollectionProductGrid-" data-section-id="template--14811413020735__product-grid"
             class="main-content page-main--wrapper" data-wetheme-section-type="template--collection"
             data-wetheme-section-id="template--14811413020735__product-grid">

          <div class="boost-pfs-container-default boost-pfs-filter-wrapper-page">
            <div class="boost-pfs-filter-left-col">
              <div class="boost-pfs-filter-left-col-inner">
                <div
                  class="boost-pfs-filter-tree boost-pfs-filter-tree-v boost-pfs-filter-tree-mobile-style2 boost-pfs-filter-tree-mobile-sticky"
                  id="boost-pfs-filter-tree">
                  <div class="boost-pfs-filter-tree-content" aria-live="polite" role="navigation"
                       aria-label="Product filter">
                    <div class="boost-pfs-filter-options-wrapper">
                      <div
                        class="boost-pfs-filter-option boost-pfs-filter-option-list boost-pfs-filter-option-product boost-pfs-filter-has-scrollbar boost-pfs-filter-option-column-1">
                        <div class="boost-pfs-filter-option-title">
                          <button class="boost-pfs-filter-button boost-pfs-filter-option-title-heading"><span class="boost-pfs-filter-option-title-text">Product<span
                            class="boost-pfs-filter-option-title-count"></span></span></button>
                          <p class="boost-pfs-filter-selected-items-mobile"></p>
                          <button class="boost-pfs-filter-button boost-pfs-filter-clear" v-if="selectedFruits.length>0" @click="handleClearProductSelect" >Clear
                          </button>
                        </div>
                        <div class="boost-pfs-filter-option-content" id="boost-pfs-filter-tree-pf-pt-product">
                          <div class="boost-pfs-filter-option-content-inner">
                            <el-checkbox-group v-model="selectedFruits" @change="handleFilterCateChange">
                              <li class="boost-pfs-filter-option-item boost-pfs-filter-option-label" v-for="(item,index) in state.cate_info_list" >
                                <el-checkbox :value="index" >
                                  <span class="boost-pfs-filter-option-value">{{item['cate_info']['name']}}</span>
                                  <span class="boost-pfs-filter-option-amount" aria-label="Number of products: (21)">({{item['list'].length}})</span>
                                </el-checkbox>
                              </li>

                            </el-checkbox-group>

                          </div>
                          <button class="boost-pfs-filter-button boost-pfs-filter-apply-button">Apply</button>
                        </div>
                      </div>

                      <div
                        class="boost-pfs-filter-option boost-pfs-filter-option-range boost-pfs-filter-option-price boost-pfs-filter-no-scrollbar boost-pfs-filter-option-column-1 boost-pfs-filter-option-range-style1">
                        <div class="boost-pfs-filter-option-title">
                          <button aria-controls="boost-pfs-filter-tree-pf-p-price" aria-label="Filter by Price"
                                  tabindex="0" class="boost-pfs-filter-button boost-pfs-filter-option-title-heading"
                                  aria-expanded="true"><span class="boost-pfs-filter-option-title-text">Price<span
                            class="boost-pfs-filter-option-title-count"></span></span></button>
                          <p class="boost-pfs-filter-selected-items-mobile"></p>
                          <button aria-label="Clear filter by Price"
                                  class="boost-pfs-filter-button boost-pfs-filter-clear" style="display: none;">Clear
                          </button>
                        </div>
                        <div class="boost-pfs-filter-option-content" id="boost-pfs-filter-tree-pf-p-price">
                          <div class="boost-pfs-filter-option-content-inner">
                            <div class="boost-pfs-filter-block-content-inner">
                              <div class="boost-pfs-filter-option-range-amount"><input
                                class="boost-pfs-filter-option-range-amount-min" role="textbox" type="text"
                                aria-label="Min value">
                                <div class="boost-pfs-filter-option-range-amount-split"> -</div>
                                <input class="boost-pfs-filter-option-range-amount-max" role="textbox" type="text"
                                       aria-label="Max value"></div>
                              <div
                                class="boost-pfs-filter-option-range-slider noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr">
                                <div class="noUi-base">
                                  <div class="noUi-connects">
                                    <div class="noUi-connect" style="transform: translate(0%, 0px) scale(1, 1);"></div>
                                  </div>
                                  <div class="noUi-origin" style="transform: translate(-1000%, 0px); z-index: 5;">
                                    <div class="noUi-handle noUi-handle-lower" data-handle="0" tabindex="0"
                                         role="slider" aria-orientation="horizontal" aria-valuemin="7.0"
                                         aria-valuemax="172.9" aria-valuenow="7.0" aria-valuetext="7.00"
                                         aria-label="Min value">
                                      <div class="noUi-touch-area"></div>
                                    </div>
                                  </div>
                                  <div class="noUi-origin" style="transform: translate(0%, 0px); z-index: 4;">
                                    <div class="noUi-handle noUi-handle-upper" data-handle="1" tabindex="0"
                                         role="slider" aria-orientation="horizontal" aria-valuemin="7.0"
                                         aria-valuemax="172.9" aria-valuenow="172.9" aria-valuetext="172.90"
                                         aria-label="Max value">
                                      <div class="noUi-touch-area"></div>
                                    </div>
                                  </div>
                                </div>
                                <div class="noUi-pips noUi-pips-horizontal">
                                  <div class="noUi-marker noUi-marker-horizontal noUi-marker-large"
                                       style="left: 0%;"></div>
                                  <div class="noUi-value noUi-value-horizontal noUi-value-large" data-value="7"
                                       style="left: 0%;">7
                                  </div>
                                  <div class="noUi-marker noUi-marker-horizontal noUi-marker-large"
                                       style="left: 25%;"></div>
                                  <div class="noUi-value noUi-value-horizontal noUi-value-large" data-value="48.475"
                                       style="left: 25%;">48
                                  </div>
                                  <div class="noUi-marker noUi-marker-horizontal noUi-marker-large"
                                       style="left: 50%;"></div>
                                  <div class="noUi-value noUi-value-horizontal noUi-value-large" data-value="89.95"
                                       style="left: 50%;">90
                                  </div>
                                  <div class="noUi-marker noUi-marker-horizontal noUi-marker-large"
                                       style="left: 75%;"></div>
                                  <div class="noUi-value noUi-value-horizontal noUi-value-large" data-value="131.425"
                                       style="left: 75%;">131
                                  </div>
                                  <div class="noUi-marker noUi-marker-horizontal noUi-marker-large"
                                       style="left: 100%;"></div>
                                  <div class="noUi-value noUi-value-horizontal noUi-value-large" data-value="172.9"
                                       style="left: 100%;">173
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button class="boost-pfs-filter-button boost-pfs-filter-apply-button">Apply</button>
                        </div>
                      </div>
                    </div>
                    <div class="boost-pfs-filter-mobile-footer">
                      <button class="boost-pfs-filter-show-result" type="button">Show Results</button>
                      <button class="boost-pfs-filter-button boost-pfs-filter-apply-all-button">Apply All</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="collection-style--grid boost-pfs-filter-right-col">
              <div class="collection-main-body grid-uniform">

                <div class="boost-pfs-filter-products collection-main-body-inner bc-al-style4" style="min-height: 0px;" v-if="state.rushList.length>0">
                    <GoodsItemGrid v-for="(item,index) in state.rushList" :goods="item" :key="index"/>
                </div>
              </div>
            </div>
            <div class="boost-pfs-filter-bottom-pagination boost-pfs-filter-bottom-pagination-default"
                 style="display: block;">
              <ul>
                <li class="boost-pfs-filter-pagination-disabled">
                  <span>←</span>
                </li>
                <li class="active pagination-number">
                  <a href="" title="">
                    1
                  </a>
                </li>

                <li class="pagination-arrow pagination-next">
                  <a href="">
                    →
                  </a>
                </li>
              </ul>
            </div>
            <div class="boost-pfs-filter-load-more"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
  <el-empty description="There aren't any products. Go and have a look at the others" v-else></el-empty>
</template>

<style scoped lang="scss">
.collection-wrapper {
  --filter-border-color: var(--border-color);
  --filter-text-color: var(--text-color);
  --filter-font-family: var(--body-font-stack);
  --filter-font-style: var(--body-font-style);
  --filter-font-weight: var(--body-font-weight);
  --filter-body-font-size: var(--body-font-size);
  --filter-base-font-size: var(--base-font-size);
  --filter-body-font-size-12-em: var(--body-font-size-12-to-em);
  --filter-background-color: var(--color-primary-background);
  --filter-color-background-rgb: var(--color-primary-background-rgb);
}

/* Select */
summary .icon-caret,
.select .icon-caret,
.customer select + svg {
  height: 0.4rem;
  pointer-events: none;
  position: absolute;
  top: calc(50% - 0.2rem);
  right: 1rem;
}

.select__select,
.customer select {
  cursor: pointer;
  padding: 0 4rem 0 1.5rem;
  padding: 0 2.5rem 0 0.8rem
}

.field {
  position: relative;
  width: 100%;
  display: flex;
}

.field__input,
.select__select {
  font-size: 1.3rem;
  line-height: 1.5;
  letter-spacing: 0.04rem;
}

.field__label,
.customer .field label {
  font-size: .8rem;
  left: 1.5rem;
  top: 1rem;
  margin-bottom: 0;
  pointer-events: none;
  position: absolute;
  transition: top 100ms ease,
  font-size 100ms ease;
  letter-spacing: 0.1rem;
  line-height: 1.5;
}

.field__input:focus,
.field__input:not(:placeholder-shown),
.field__input:-webkit-autofill,
.customer .field input:focus,
.customer .field input:not(:placeholder-shown),
.customer .field input:-webkit-autofill {
  padding: 2.2rem 1.5rem 0.8rem;
}

.field__input::-webkit-search-cancel-button,
.customer .field input::-webkit-search-cancel-button {
  display: none;
}

.field__input::placeholder,
.customer .field input::placeholder {
  opacity: 0;
}

/* component-form */
.field__input,
.select__select,
.customer .field input,
.customer select {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 0;
  border-radius: 0;
  color: var(--filter-text-color);
  font-size: 1.2rem;
  width: 100%;
  box-shadow: 0 0 0 0.1rem var(--filter-border-color);
  height: 2.7rem;
  box-sizing: border-box;
  transition: box-shadow 100ms ease;
}

.field__input,
.customer .field input {
  flex-grow: 1;
  text-align: left;
  padding: 1.5rem;
}

.field__input:hover,
.select__select:hover,
.customer .field input:hover,
.customer select:hover,
.localization-form__select:hover {
  box-shadow: 0 0 0 0.2rem var(--filter-border-color);
}

.field__input:focus-visible,
.select__select:focus-visible,
.field input:focus-visible {
  box-shadow: 0 0 0 0.1rem -webkit-focus-ring-color,
  0 0 0 0.3rem var(--filter-border-color),
  0 0 0.5rem 0.4rem -webkit-focus-ring-color;
}

.field__input:focus,
.select__select:focus,
.field input:focus {
  box-shadow: 0 0 0 0.1rem -webkit-focus-ring-color,
  0 0 0 0.3rem var(--filter-border-color),
  0 0 0.5rem 0.4rem -webkit-focus-ring-color;
}

.facets__summary:focus-visible,
.facets__summary:focus {
  border: solid var(--filter-border-color) 1px;
}

.field__input:focus ~ .field__label,
.field__input:not(:placeholder-shown) ~ .field__label,
.field__input:-webkit-autofill ~ .field__label,
.customer .field input:focus ~ label,
.customer .field input:not(:placeholder-shown) ~ label,
.customer .field input:-webkit-autofill ~ label {
  font-size: .7rem;
  top: 0.3em;
  letter-spacing: 0.04rem;
}

.field__input:focus,
.field__input:not(:placeholder-shown),
.field__input:-webkit-autofill,
.customer .field input:focus,
.customer .field input:not(:placeholder-shown),
.customer .field input:-webkit-autofill {
  padding: 1.5rem 1rem 0.8rem;
}

.field__input::-webkit-search-cancel-button,
.customer .field input::-webkit-search-cancel-button {
  display: none;
}

.field__input::placeholder,
.customer .field input::placeholder {
  opacity: 0;
}

.select__select {
  box-shadow: 0 0 0 0.07rem var(--filter-border-color);
  font-family: var(--filter-font-family);
  font-style: var(--filter-font-style);
  font-weight: var(--filter-font-weight);
  font-size: var(--filter-body-font-size-12-em-12-to-em);
  color: var(--filter-text-color);
}

.text-area,
.select {
  display: inline-block;
  position: relative;
  width: 100%;
}

/* base-details-summary */
summary {
  cursor: pointer;
  list-style: none;
  position: relative;
}

summary::-webkit-details-marker {
  display: none;
}

.disclosure-has-popup {
  position: relative;
}

@media screen and (min-width: 769px) {
  .disclosure-has-popup[open] > summary::before {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    display: block;
    cursor: default;
    content: ' ';
    background: transparent;
  }
}

.disclosure-has-popup > summary::before {
  display: none;
}

.disclosure-has-popup[open] > summary + * {
  z-index: 101;
}

.collection {
  position: relative;
}

@media screen and (max-width: 768px) {
  .collection .title:not(.title--no-heading) {
    margin-top: -1rem;
  }
}

@media screen and (min-width: 769px) {
  .collection .title-wrapper-with-link--no-heading {
    margin-top: 6rem;
  }
}

.collection .grid__item,
.template-search .grid__item {
  padding-bottom: 2rem;
}

.collection-product-count {
  margin-top: 0;
  font-size: var(--filter-base-font-size);
}

@media screen and (min-width: 769px) {
  .collection-product-count {
    margin-top: 1.5rem;
  }
}

.template-search .grid__item--small {
  padding-bottom: 0.5rem;
}

.collection.loading .collection-product-count {
  visibility: hidden;
}

@media screen and (max-width: 768px) {
  .collection .grid__item:only-child {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media screen and (min-width: 769px) {
  .collection .grid__item,
  .template-search .grid__item {
    padding-bottom: 5rem;
  }

  .template-search .grid__item--small {
    padding-bottom: 1rem;
  }
}

.collection .negative-margin,
.template-search .negative-margin {
  margin-bottom: -2rem;
}

@media screen and (min-width: 769px) {
  .collection .negative-margin,
  .template-search .negative-margin {
    margin-bottom: -5rem;
  }
}

@media screen and (min-width: 769px) {
  .collection .negative-margin--small {
    margin-bottom: -1rem;
  }
}

.collection .loading-overlay {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: none;
  width: 100%;
  padding: 0 5rem;
  background-color: rgba(var(--filter-color-background-rgb), 0.7);
}

.collection.loading .loading-overlay {
  display: block;
}

.collection--empty .title-wrapper {
  margin-top: 10rem;
  margin-bottom: 15rem;
}

.collection-filters {
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 768px) {
  .collection-filters {
    padding: 0 15px;
  }

  .collection-info__description {
    text-align: center;
  }
}

@media screen and (min-width: 769px) {
  .collection-filters {
    display: block;
  }

  .collection-info__sidebar {
    padding-top: 2rem;
  }

  .collection-info__sidebar .page--title {
    text-align: left;
  }

  .collection-info__topbar .collection-info__description.rte {
    text-align: center;
  }

  .collection-filters > * + * {
    margin-top: 0;
    margin-left: 2rem;
    margin-right: 2rem;
  }
}

.collection-filters__label {
  display: block;
  color: var(--filter-text-color);
  font-size: var(--filter-base-font-size);
  line-height: 1;
  margin: 0 0 1rem;
  width: 100%;
}

.collection-filters__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--filter-base-font-size);
  cursor: pointer;
  height: 4.5rem;
  padding: 0 1.5rem;
  min-width: 25rem;
  margin-top: 2.4rem;
  border: 0.1rem solid var(--filter-border-color);
}

.collection-filters__summary::after {
  position: static;
}

.collection-filters__item {
  display: flex;
  grid-column: 2;
  grid-row: 1;
}

.collection-filters__field {
  flex-grow: 1;
  max-width: 100%;
}

.collection-filters__item button {
  margin-left: 1rem;
}

.collection-filters__disclosure {
  min-width: 25rem;
}

.collection-filters__disclosure summary::after {
  top: 0;
}

.collection-filters__disclosure a {
  color: var(--filter-text-color);
  cursor: pointer;
  display: block;
  padding: 1.2rem;
  text-transform: none;
  text-decoration: none;
}

@media screen and (min-width: 769px) {
  .collection-filters__sidebar .facets__form-inner > *:not(.active-facets-desktop) {
    padding-top: 2rem;
  }

  .collection-filters .collection-filters__sort {
    width: 25rem;
    max-width: 100%;
  }
}

.facets {
  display: block;
}

.facets__form-inner {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  column-gap: 2rem;
}

@media screen and (max-width: 768px) {
  .facets__form-inner {
    margin-top: 50px;
  }
}

.js .facets__form-inner {
  grid-template-columns: calc(100% - 27rem) 25rem;
}

.facets__wrapper {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-wrap: wrap;
  margin-left: -0.5rem;
}

.facets__heading {
  display: block;
  color: black;
  font-size: var(--filter-base-font-size);
  line-height: 1;
  margin: 0 0 1rem 0.5rem;
  width: 100%;
}

.facets__reset {
  margin-left: auto;
}

.facets__disclosure {
  border: 1px solid var(--filter-border-color);
  margin: 0 0 0.5rem 0.5rem;
  transition: box-shadow 100ms ease;
}

.facets__disclosure:hover {
  box-shadow: 0 0 0 0.1rem var(--filter-border-color);
}

.facets__summary {
  padding: .6rem 2.5rem .6rem 0.8rem;
  font-size: var(--filter-body-font-size);
  color: var(--filter-text-color);
}

.facets__summary > span {
  line-height: 1.3;
}

.facets__display {
  background-color: var(--filter-background-color);
  border-top: 1px solid var(--filter-border-color);
  overflow-y: auto;
}

@media screen and (min-width: 769px) {
  .facets__display {
    border: 1px solid var(--filter-border-color);
    max-height: 55rem;
    position: absolute;
    top: calc(100% + 0.5rem);
    left: -0.1rem;
    width: 35rem;
  }
}

.facets__header {
  border-bottom: 1px solid var(--filter-border-color);
  padding: 1rem 1.2rem;
  display: flex;
  justify-content: space-between;
  font-size: var(--filter-base-font-size);
  position: sticky;
  top: 0;
  background-color: var(--filter-background-color);
  z-index: 1;
}

.facets__list {
  padding: 1rem 0;
  margin-bottom: 0;
}

.facets__item {
  display: flex;
  align-items: center;
}

.facets__item label,
.facets__item input[type='checkbox'] {
  cursor: pointer;
}

.facet-checkbox {
  padding: .5rem 1rem .5rem .6rem;
  flex-grow: 1;
  position: relative;
  font-size: var(--filter-base-font-size);
  display: flex;
  word-break: break-word;
}

.facet-checkbox input[type='checkbox'] {
  position: absolute;
  opacity: 1;
  width: 1.2rem;
  height: 1.2rem;
  top: 0.4rem;
  left: 0.5rem;
  z-index: -1;
  appearance: none;
  -webkit-appearance: none;
  border-bottom: none;
}

.facet-checkbox > svg {
  background-color: var(--filter-background-color);
  margin-right: 1.2rem;
  flex-shrink: 0;
}

.facet-checkbox .icon-checkmark {
  visibility: hidden;
  position: absolute;
  left: .8rem;
  z-index: 5;
  top: .7rem;
}

.facet-checkbox > input[type='checkbox']:checked ~ .icon-checkmark {
  visibility: visible;
}

.facet-checkbox--disabled {
  color: var(--filter-border-color);
}

.facets__price {
  display: flex;
  padding: 2rem;
}

.facets__price > * + * {
  margin-left: 2rem;
}

.facets__price .field {
  align-items: center;
}

.facets__price .field .field__currency {
  margin-right: 0.6rem;
}

.facets__price .field__label {
  left: 2.1rem;
}

button.facets__button {
  min-height: 0;
  margin: 0 0 0 0.5rem;
  box-shadow: none;
  padding-top: var(--filter-base-font-size);
  padding-bottom: var(--filter-base-font-size);
}

.active-facets {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-left: -1rem;
  grid-column: 1 / span 2;
  grid-row: 2;
  margin-top: 2rem;
}

.active-facets-desktop {
  order: -1;
}

.active-facets-mobile {
  margin-top: 2rem;
}

.collection-filters__topbar .active-facets-desktop {
  margin-top: 2rem;
}

@media all and (min-width: 769px) {
  .active-facets-mobile {
    display: none;
  }
}

a.active-facets__button {
  color: var(--filter-text-color);
  box-shadow: 0 0 0 0.1rem var(--filter-border-color);
  border-radius: 2.6rem;
  font-size: var(--filter-body-font-size-12-em);
  min-height: 0;
  min-width: 0;
  padding: 0.5rem 1rem;
  margin: 0 0 1rem 1rem;
}

a.active-facets__button {
  box-shadow: 0 0 0 0.1rem var(--filter-border-color);
}

a.active-facets__button:hover {
  box-shadow: 0 0 0 0.2rem var(--filter-border-color);
}

a.active-facets__button--light {
  box-shadow: 0 0 0 0.1rem var(--filter-border-color);
}

a.active-facets__button--light:hover {
  box-shadow: 0 0 0 0.2rem var(--filter-border-color);
}

a.active-facets__button:focus-visible,
a.active-facets__button:focus {
  box-shadow: 0 0 0 0.1rem var(--filter-border-color),
  0 0 0 0.2rem var(--filter-background-color), 0 0 0 0.4rem -webkit-focus-ring-color;
  outline: none;
}

.active-facets__button svg {
  width: var(--filter-base-font-size);
  margin-left: 0.6rem;
  pointer-events: none;
}

.active-facets__button:only-child {
  display: none;
}

.active-facets__button.disabled {
  pointer-events: none;
}

.count-bubble {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background-color: var(--primary-btn-bg-color);
  color: var(--filter-background-color);
  margin-left: 0.5rem;
}

.count-bubble:empty {
  visibility: hidden;
}

.count-bubble--dot:empty {
  visibility: visible;
}

.count-bubble--dot::before {
  content: '';
  width: 0.2rem;
  height: 0.2rem;
  display: block;
  background-color: var(--filter-background-color);
  border-radius: 50%;
}

.facets__summary > div {
  display: flex;
  align-items: center;
}

.sorting .button {
  margin-top: 2.4rem;
  padding-top: 1.3rem;
}

.spaced-section--full-width {
  width: 100%;
}

.collection-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.collection-filtering-section {
  width: 100%;
}

@media screen and (min-width: 769px) {
  .drawer-close-btn,
  .drawer__close {
    display: none;
  }

  .js-drawer-open .drawer-close-btn,
  .js-drawer-open .drawer__close {
    display: block;
  }
}

.mobile-facets__open {
  text-align: center;
  width: 100%;
  margin-top: 20px;
}

@media screen and (min-width: 769px) {
  .mobile-facets__open {
    display: none;
  }
}

.mobile-facets__open > * + * {
  margin-left: 1rem;
}

.mobile-facets__open svg {
  width: 2rem;
}

.mobile-facets__open line,
.mobile-facets__open circle {
  stroke: var(--color-button-border);
}

details[open] .mobile-facets__open {
  visibility: hidden;
}

@media screen and (max-width: 768px) {
  collection-filtering-form {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -90%;
    z-index: 99999;
    background-color: white;
    max-width: 90%;
    width: 100%;
    transition: transform .6s cubic-bezier(.165, .84, .44, 1) .1s;
    padding: 15px;
    overflow-y: auto;
  }

  collection-filtering-form.is-open {
    transform: translateX(100%);
  }

  .facets__form {
    opacity: 0;
    transition: opacity .4s ease-in;
  }

  collection-filtering-form.is-open .facets__form {
    opacity: 1;
  }

  collection-filtering-form .drawer__close button {
    top: 0;
    right: 0;
  }
}

@media screen and (min-width: 769px) {
  .collection-filtering-section {
    width: 250px;
  }

  .collection-grid {
    width: calc(100% - 250px);
  }
}

.facets__form-inner {
  display: flex !important;
  flex-direction: column-reverse;
}

.facets__wrapper {
  display: block !important;
  padding-top: 2rem;
}

@media screen and (max-width: 768px) {
  .facets__form-inner {
    display: flex !important;
    flex-direction: column-reverse;
  }

  .facets__wrapper {
    display: block !important;
    padding-top: 2rem;
  }
}
</style>
