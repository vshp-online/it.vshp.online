<script setup>
import { computed } from "vue";
import { usePageData } from "@vuepress/client";
import ParentLayout from "@vuepress/theme-default/layouts/Layout.vue";
import SiteFooter from "../components/SiteFooter.vue";
import AuthLink from "../components/AuthLink.vue";
import RepoLink from "../components/RepoLink.vue";
import Breadcrumbs from "../components/Breadcrumbs.vue";
import BlogPostMeta from "../components/BlogPostMeta.vue";

const page = usePageData();
const isBlogPostPage = computed(() => {
  const rel = page.value.filePathRelative;
  if (!rel) return false;
  return rel.startsWith("blog/") && rel !== "blog/index.md";
});
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
    <template #page-content-top>
      <ClientOnly v-if="isBlogPostPage">
        <BlogPostMeta />
      </ClientOnly>
    </template>
    <template #page-bottom>
      <SiteFooter />
    </template>
  </ParentLayout>
</template>
