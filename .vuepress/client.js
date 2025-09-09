import { defineClientConfig } from "vuepress/client";

// https://ecosystem.vuejs.press/themes/default/extending.html#layout-slots
import Layout from "./layouts/Layout.vue";

console.log(`Версия сайта: ${__APP_VERSION__}`);

export default defineClientConfig({
  layouts: {
    Layout,
  },
});
