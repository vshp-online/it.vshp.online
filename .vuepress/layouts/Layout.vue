<script setup>
import ParentLayout from "@vuepress/theme-default/layouts/Layout.vue";
import SiteFooter from "../components/SiteFooter.vue";
import AuthLink from "../components/AuthLink.vue";
import RepoLink from "../components/RepoLink.vue";
import Breadcrumbs from "../components/Breadcrumbs.vue";
</script>

<template>
  <ParentLayout>
    <template #navbar-after>
      <ClientOnly><AuthLink /></ClientOnly>
      <RepoLink />
    </template>
    <template #page-top>
      <Breadcrumbs />
    </template>
    <template #page-bottom>
      <SiteFooter />
    </template>
  </ParentLayout>
</template>
