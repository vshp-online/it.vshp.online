<template>
  <div v-if="hasMeta" class="blog-post-meta">
    <time v-if="date" :datetime="date" class="blog-post-meta-date">
      {{ formattedDate }}
    </time>
    <div v-if="tags && tags.length > 0" class="blog-post-meta-tags">
      <Pill
        v-for="(tag, index) in tags"
        :key="`tag-${index}-${tag}`"
        :text="tag"
        type="danger"
        class="blog-post-meta-tag"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { usePageData } from "@vuepress/client";
import Pill from "./Pill.vue";

const page = usePageData();

// Получаем дату и теги из frontmatter
const date = computed(() => {
  const fmDate = page.value.frontmatter?.date;
  return fmDate || null;
});

const tags = computed(() => {
  const fmTags = page.value.frontmatter?.tags;
  // Убеждаемся, что это массив
  if (Array.isArray(fmTags)) {
    return fmTags.filter((tag) => tag && typeof tag === "string");
  }
  return [];
});

const hasMeta = computed(() => {
  return date.value || (tags.value && tags.value.length > 0);
});

const formattedDate = computed(() => {
  if (!date.value) return "";
  try {
    const dateObj = new Date(date.value);
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    };
    return new Intl.DateTimeFormat("ru-RU", options).format(dateObj);
  } catch (e) {
    console.error("Ошибка форматирования даты:", e);
    return "";
  }
});

// Отладка
onMounted(() => {
  console.log("BlogPostMeta - page frontmatter:", page.value.frontmatter);
  console.log("BlogPostMeta - date:", date.value);
  console.log("BlogPostMeta - tags:", tags.value);
  console.log("BlogPostMeta - hasMeta:", hasMeta.value);
  console.log("BlogPostMeta - formattedDate:", formattedDate.value);
});
</script>

<style scoped>
.blog-post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--vp-c-divider, var(--c-border));
  border-bottom: 1px solid var(--vp-c-divider, var(--c-border));
}

.blog-post-meta-date {
  font-size: 0.9rem;
  color: var(--vp-c-text-2, var(--c-text-light));
  white-space: nowrap;
}

.blog-post-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
</style>
