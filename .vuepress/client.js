import { defineClientConfig } from "vuepress/client";

// https://ecosystem.vuejs.press/themes/default/extending.html#layout-slots
import Layout from "./layouts/Layout.vue";

if (typeof window !== "undefined" && import.meta.env.DEV) {
  console.log(`Версия сайта: ${__APP_VERSION__}`);
}

export default defineClientConfig({
  layouts: { Layout },
});
