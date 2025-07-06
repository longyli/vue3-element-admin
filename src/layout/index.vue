<template>
  <div  class="app-wrapper">
    <sidebar />
    <NavBar />
    <app-main />
    <Footer />
  </div>
</template>

<script setup lang="ts">

// 状态管理
import { useAppStore, useSettingsStore, usePermissionStore } from "@/store";


// 配置
import defaultSettings from "@/settings";

// 枚举
import { DeviceEnum } from "@/enums/settings/device.enum";
import { LayoutMode } from "@/enums/settings/layout.enum";

// 组件
import NavBar from "./components/NavBar/index.vue";
import Footer from "./components/Footer/index.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const width = useWindowSize().width;
settingsStore.changeThemeColor('#b89a68')
// 常量
const WIDTH_DESKTOP = 992; // 响应式布局容器固定宽度（大屏 >=1200px，中屏 >=992px，小屏 >=768px）

// 计算属性
const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE); // 是否为移动设备
const isSidebarOpen = computed(() => appStore.sidebar.opened); // 侧边栏是否展开
const isShowTagsView = computed(() => settingsStore.tagsView); // 是否显示标签视图
const layout = computed(() => settingsStore.layout); // 当前布局模式（left、top、mix）
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath); // 顶部菜单激活路径
const mixedLayoutLeftRoutes = computed(() => permissionStore.mixedLayoutLeftRoutes); // 混合布局左侧菜单路由

// 监听顶部菜单激活路径变化，更新混合布局左侧菜单路由
watch(
  () => activeTopMenuPath.value,
  (newVal: string) => {
    permissionStore.setMixedLayoutLeftRoutes(newVal);
  },
  { deep: true, immediate: true }
);

// 监听窗口宽度变化，调整设备类型和侧边栏状态
watchEffect(() => {
  const isDesktop = width.value >= WIDTH_DESKTOP;
  appStore.toggleDevice(isDesktop ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE);
  if (isDesktop) {
    appStore.openSideBar();
  } else {
    appStore.closeSideBar();
  }
});

// 监听路由变化，如果是移动设备且侧边栏展开，则关闭侧边栏
const route = useRoute();
watch(route, () => {
  if (isMobile.value && isSidebarOpen.value) {
    appStore.closeSideBar();
  }
});

// 计算属性：布局样式
const layoutClass = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  mobile: appStore.device === DeviceEnum.MOBILE,
  [`layout-${settingsStore.layout}`]: true,
}));

/**
 * 处理遮罩层点击事件，关闭侧边栏
 */
function handleCloseSidebar() {
  appStore.closeSideBar();
}

/**
 * 处理切换侧边栏的展开/收起状态
 */
function handleToggleSidebar() {
  appStore.toggleSidebar();
}
</script>
<style lang="scss" scoped>

</style>
