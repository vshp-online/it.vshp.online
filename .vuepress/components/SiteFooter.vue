<script setup>
const appVersion = __APP_VERSION__;
const vshpEmlVersion = __VSHP_EML_VERSION__;
const year = new Date().getFullYear();

import { usePageData } from "@vuepress/client";
import { computed } from "vue";
const page = usePageData();

// роуты, где футер скрываем
const HIDE = [
  /^\/vshp-emlicense\/license(?:\.html|\/)?$/i,
  /^\/license(?:\.html|\/)?$/i,
];

const hide = computed(() => {
  const p = (page.value.path || "").toLowerCase();
  return HIDE.some((rx) => rx.test(p));
});
</script>

<template>
  <footer v-if="!hide" class="site-footer">
    <div>
      <span
        >© Кафедра информационных технологий ЧУВО «ВШП», {{ year }}. Версия:
        {{ appVersion }}</span
      >
      <br />
      <span>Материалы доступны в соответствии с лицензией:</span>
      <br />
      <a href="/VSHP-EMLicense/LICENSE"
        ><img
          :src="`https://badgers.space/badge/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F/VSHP-EMLicense-${vshpEmlVersion}/781F18`"
      /></a>
    </div>
  </footer>
</template>

<style lang="scss">
.site-footer {
  margin: 2rem;
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--vp-c-text-mute);

  img {
    margin-top: 0.45rem;
  }
}
</style>
