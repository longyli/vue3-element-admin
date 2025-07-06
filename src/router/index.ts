import type { App } from "vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/ulink_comshop/pages/order/placeOrder',
    name: 'placeOrder',
    component: () => import('@/views/order/placeOrder.vue'),
    meta: { title: '提交订单' }
  },
  {
    path: '/ulink_comshop/pages',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: 'index/index',
        component: () => import('@/views/home/index.vue'),
        name: '/index/index',
        meta: { title: 'My Account' }
      },
      {
        path: 'index/search',
        component: () => import('@/views/home/search/index.vue'),
        name: 'search',
        meta: { title: 'Search' }
      },
      {
        path: 'type/index',
        component: () => import('@/views/type/details.vue'),
        name: 'typeIndex',
        meta: { title: '分类' }
      },
      {
        path: 'type/details',
        component: () => import('@/views/type/details.vue'),
        name: 'typeDetails',
        meta: { title: '分类' }
      },
      {
        path: 'user/me',
        component: () => import('@/views/account/index.vue'),
        name: 'Account',
        meta: { title: 'My Account' }
      },
      {
        path: 'user/login',
        component: () => import('@/views/account/login.vue'),
        name: 'Login',
        meta: { title: '登录' }
      },
      {
        path: 'user/register',
        component: () => import('@/views/account/register.vue'),
        name: 'Register',
        meta: { title: '注册新用户' }
      },
      {
        path: 'order/shopCart',
        component: () => import('@/views/order/shopCart.vue'),
        name: 'shopCart',
        meta: { title: '购物车' }
      },

      {
        path: 'goods/goodsDetail',
        component: () => import('@/views/goods/goodsDetail/index.vue'),
        name: 'goodsDetail',
        meta: { title: '商品详情' }
      },
    ]
  },
  {
    path: "/",
    component: Layout,
    redirect: "/ulink_comshop/pages/index/index",
    children: [
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "test",
        component: () => import("@/views/test/SwiperDemo.vue"),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: '/goods',
    component: Layout,
    meta: { hidden: true },
    redirect: '/account/index',
    children: [


    ]
  }
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory("/demo/"),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
