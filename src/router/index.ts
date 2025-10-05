import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

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
    path: "/presets/:id",
    name: "PresetsDeckDetail",
    component: () => import("@/views/PresetDeckDetail.vue"),
    meta: { showFooter: false, showHeader: false }, //不显示头部导航和底部导航
  }, //预设卡组详情
  {
    path: "/my-decks/:id",
    name: "MyDeckDetail",
    component: () => import("@/views/MyDeckDetail.vue"),
    meta: { showFooter: false, showHeader: false }, //不显示头部导航和底部导航
  },
  // 用户个人中心页面
  {
    path: "/mine",
    name: "Mine",
    component: () => import("@/views/Mine.vue"),
  },
  // 登录
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
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

// 路由守卫：未登录时拦截
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  // 确保刷新时能恢复
  if (!userStore.user) {
    userStore.loadFromStorage();
  }

  const publicPages = ["/", "/login"]; // 白名单页面
  const isPublic = publicPages.includes(to.path);

  if (!isPublic && !userStore.user) {
    // 没登录又想去受保护页面 → 跳转登录
    return next("/login");
  }

  next();
});

export default router;
