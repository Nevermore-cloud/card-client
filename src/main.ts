import { createApp } from "vue";
// import "./style.css";
import "@/assets/scss/global.scss";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores/index"; // 导入创建的 pinia 实例

// import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";

import Vant from "vant";
import "vant/lib/index.css";

const app = createApp(App);
// app.use(ElementPlus);
app.use(Vant);
app.use(router);
app.use(pinia);
app.mount("#app");
