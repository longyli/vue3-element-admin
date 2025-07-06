<script setup lang="ts">
import { useAppStore } from "@/store";
const appStore = useAppStore();
const t = useI18n().t;

const notices = computed({
  get: () => appStore.notice,
  set: (value) => appStore.notice.value = value,
});

</script>

<template>
  <div class="jsc-announcement announcement-bar" >
    <el-carousel   arrow="never"  style="height: 47px" class="announcement-bar text-center" indicator-position = "none" direction="horizontal" :autoplay="true">
      <el-carousel-item class="jsc-announcement-slide" v-for="item in notices" :key="item" >
        <p class="medium">{{ item.content_en }}</p>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss">


.announcement-bar {
  background-color: #856b3f;
  color: #ffffff;
}

.announcement-bar a,
.announcement-bar
.social-sharing.is-clean a {
  color: #ffffff;
}

.announcement-bar li a svg {
  fill: #ffffff;
}
.announcement-bar p {
  margin: 5px 0 5px 0;
  font-size: var(--announcement-text-size);
  letter-spacing: var(--announcement-text-spacing);
  text-transform: var(--announcement-text-case);
  font-style: var(--announcement-font-style);
  font-weight: var(--announcement-font-weight)
}
.jsc-announcement-slide {
  width: 100%;
  min-height: 30px;
  padding: 10px 0;
}
</style>
