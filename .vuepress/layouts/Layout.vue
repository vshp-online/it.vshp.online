<script setup>
import ParentLayout from "@vuepress/theme-default/layouts/Layout.vue";
import SiteFooter from "../components/SiteFooter.vue";
import HomeLink from "../components/HomeLink.vue";
import AuthLink from "../components/AuthLink.vue";
import RepoLink from "../components/RepoLink.vue";
</script>

<template>
  <ParentLayout>
    <template #navbar-after>
      <HomeLink />
      <ClientOnly><AuthLink /></ClientOnly>
      <RepoLink />
    </template>
    <template #page-bottom>
      <SiteFooter />
    </template>
  </ParentLayout>
</template>
