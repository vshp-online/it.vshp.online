<script setup>
import ParentLayout from "@vuepress/theme-default/layouts/Layout.vue";
import SiteFooter from "../components/SiteFooter.vue";
import HomeLink from "../components/HomeLink.vue";
import RepoLink from "../components/RepoLink.vue";
</script>

<template>
  <ParentLayout>
    <template #navbar-after>
      <HomeLink />
      <RepoLink />
    </template>
    <template #page-bottom>
      <SiteFooter />
    </template>
  </ParentLayout>
</template>
