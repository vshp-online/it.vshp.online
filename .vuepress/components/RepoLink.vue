<script setup>
import { useThemeLocaleData } from "@vuepress/plugin-theme-data/client";
const themeLocale = useThemeLocaleData();
const repo = themeLocale.value.docsRepo; // берём repo из theme config
</script>

<template>
  <a
    v-if="repo"
    class="repo-link nav-icon"
    :href="repo"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub"
  >
    <img src="/images/icons/github-mark.svg" width="20" height="20" alt="GitHub" />
  </a>
</template>
