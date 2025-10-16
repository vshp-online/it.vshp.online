<script setup>
import { computed } from 'vue'
import { useRouteLocale, withBase } from 'vuepress/client'

const homeHref = computed(() => withBase(useRouteLocale().value))
</script>

<template>
  <a
    class="home-link nav-icon"
    :href="homeHref"
    aria-label="На главную"
  >
    <img src="/images/icons/home-icon.svg" width="20" height="20" alt="На главную" />
  </a>
</template>
