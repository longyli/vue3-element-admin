<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Vue 3 + Swiper 带缩略图导航的响应式轮播</h2>

    <div class="mb-12">
      <!-- 主轮播 -->
      <swiper
        ref="mainSwiperRef"
        :modules="[Navigation, Thumbs]"
        :navigation="true"
        :thumbs="thumbs"
        class="mb-4"
      >
        <swiper-slide v-for="(item, index) in slides" :key="index">
          <div class="relative">
            <img
              :src="item.image"
              alt="Main slide"
              class="w-full h-[500px] object-cover rounded-lg"
            >
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 class="text-xl font-bold mb-2">{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <!-- 缩略图轮播 -->
      <swiper
        ref="thumbsSwiperRef"
        :modules="[Thumbs]"
        :space-between="10"
        :slides-per-view="6"
        :breakpoints="{
          320: { slidesPerView: 3 },
          640: { slidesPerView: 4 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 6 }
        }"
        class="swiper-thumbs"
      >
        <swiper-slide v-for="(item, index) in slides" :key="index">
          <div class="cursor-pointer">
            <img
              :src="item.thumb || item.image"
              alt="Thumbnail"
              class="w-full h-20 object-cover rounded-md opacity-70 hover:opacity-100 transition-opacity"
            >
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <!-- 垂直缩略图导航示例 -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="md:w-3/4">
        <swiper
          ref="verticalMainSwiperRef"
          :modules="[Navigation, Thumbs]"
          :navigation="true"
          :thumbs="verticalThumbs"
          class="mb-4"
        >
          <swiper-slide v-for="(item, index) in slides" :key="index">
            <div class="relative">
              <img
                :src="item.image"
                alt="Vertical main slide"
                class="w-full h-[500px] object-cover rounded-lg"
              >
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 class="text-xl font-bold mb-2">{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <div class="md:w-1/4">
        <swiper
          ref="verticalThumbsSwiperRef"
          :modules="[Thumbs]"
          :direction="'vertical'"
          :space-between="10"
          :slides-per-view="5"
          class="h-[500px] swiper-vertical-thumbs"
        >
          <swiper-slide v-for="(item, index) in slides" :key="index">
            <div class="cursor-pointer">
              <img
                :src="item.thumb || item.image"
                alt="Vertical thumbnail"
                class="w-full h-24 object-cover rounded-md opacity-70 hover:opacity-100 transition-opacity"
              >
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Thumbs } from 'swiper';

// 导入Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// 轮播数据
const slides = [
  {
    title: '自然风景',
    description: '壮观的山脉与湖泊景色',
    image: 'https://picsum.photos/seed/nature1/1200/800',
    thumb: 'https://picsum.photos/seed/nature1/200/150'
  },
  {
    title: '城市建筑',
    description: '现代都市的天际线与建筑',
    image: 'https://picsum.photos/seed/city2/1200/800',
    thumb: 'https://picsum.photos/seed/city2/200/150'
  },
  {
    title: '野生动物',
    description: '大自然中的各种动物',
    image: 'https://picsum.photos/seed/animal3/1200/800',
    thumb: 'https://picsum.photos/seed/animal3/200/150'
  },
  {
    title: '海洋世界',
    description: '神秘的海底生物与珊瑚礁',
    image: 'https://picsum.photos/seed/ocean4/1200/800',
    thumb: 'https://picsum.photos/seed/ocean4/200/150'
  },
  {
    title: '沙漠奇观',
    description: '广阔无垠的沙漠与沙丘',
    image: 'https://picsum.photos/seed/desert5/1200/800',
    thumb: 'https://picsum.photos/seed/desert5/200/150'
  },
  {
    title: '极地探险',
    description: '寒冷而美丽的极地环境',
    image: 'https://picsum.photos/seed/polar6/1200/800',
    thumb: 'https://picsum.photos/seed/polar6/200/150'
  },
];

// 主轮播和缩略图轮播的引用
const mainSwiperRef = ref(null);
const thumbsSwiperRef = ref(null);
const verticalMainSwiperRef = ref(null);
const verticalThumbsSwiperRef = ref(null);

// 配置Thumbs连接
const thumbs = ref(null);
const verticalThumbs = ref(null);

// 初始化轮播和建立连接
onMounted(() => {
  // 等待DOM渲染完成后初始化
  setTimeout(() => {
    // 水平缩略图配置
    if (mainSwiperRef.value && thumbsSwiperRef.value) {
      thumbs.value = {
        swiper: thumbsSwiperRef.value.swiper,
      };

      // 高亮当前选中的缩略图
      mainSwiperRef.value.swiper.on('slideChange', () => {
        const activeIndex = mainSwiperRef.value.swiper.activeIndex;
        const thumbSlides = document.querySelectorAll('.swiper-thumbs .swiper-slide');

        thumbSlides.forEach((slide, index) => {
          if (index === activeIndex) {
            slide.querySelector('img').classList.add('opacity-100', 'ring-2', 'ring-blue-500');
            slide.querySelector('img').classList.remove('opacity-70');
          } else {
            slide.querySelector('img').classList.remove('opacity-100', 'ring-2', 'ring-blue-500');
            slide.querySelector('img').classList.add('opacity-70');
          }
        });
      });
    }

    // 垂直缩略图配置
    if (verticalMainSwiperRef.value && verticalThumbsSwiperRef.value) {
      verticalThumbs.value = {
        swiper: verticalThumbsSwiperRef.value.swiper,
      };

      // 高亮当前选中的垂直缩略图
      verticalMainSwiperRef.value.swiper.on('slideChange', () => {
        const activeIndex = verticalMainSwiperRef.value.swiper.activeIndex;
        const thumbSlides = document.querySelectorAll('.swiper-vertical-thumbs .swiper-slide');

        thumbSlides.forEach((slide, index) => {
          if (index === activeIndex) {
            slide.querySelector('img').classList.add('opacity-100', 'ring-2', 'ring-blue-500');
            slide.querySelector('img').classList.remove('opacity-70');
          } else {
            slide.querySelector('img').classList.remove('opacity-100', 'ring-2', 'ring-blue-500');
            slide.querySelector('img').classList.add('opacity-70');
          }
        });
      });
    }
  }, 0);
});
</script>

<style scoped>
/* 自定义缩略图样式 */
.swiper-thumbs .swiper-slide-thumb-active img {
  opacity: 1 !important;
  border: 2px solid #3b82f6;
}

.swiper-vertical-thumbs .swiper-slide-thumb-active img {
  opacity: 1 !important;
  border: 2px solid #3b82f6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .swiper-thumbs {
    --swiper-navigation-size: 20px;
  }

  .swiper-thumbs .swiper-slide {
    height: 16vw;
  }

  .swiper-vertical-thumbs {
    --swiper-navigation-size: 20px;
  }
}
</style>
