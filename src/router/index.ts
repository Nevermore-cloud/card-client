import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"), //这里是懒加载路由，对于页面来讲这种做法很常见
    meta: { showFooter: false, showHeader: false }, // 首页不显示底部导航和头部导航
  },

  {
    path: "/my-decks",
    name: "Decks",
    component: () => import("@/views/Decks.vue"),
  }, //卡组
  {
    path: "/cards",
    name: "Cards",
    component: () => import("@/views/Cards.vue"),
  }, //卡牌 集卡书
  {
    path: "/presets",
    name: "Presets",
    component: () => import("@/views/Presets.vue"),
    meta: { showFooter: false, showHeader: false }, //不显示头部导航和底部导航
  }, //预设卡组
  {
    path: "/my-decks/:id",
    name: "MyDeckDetail",
    component: () => import("@/views/MyDeckDetail.vue"),
    meta: { showFooter: false, showHeader: false }, //不显示头部导航和底部导航
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/Settings.vue"),
  }, //设置
  //   { path: '/about', name: 'About', component: About }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
