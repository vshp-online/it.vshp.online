<script setup>
import { computed, onMounted, ref } from "vue";
import {
  ClientOnly,
  Content,
  usePageFrontmatter,
  useSiteLocaleData,
  withBase,
} from "@vuepress/client";
import VPAutoLink from "@theme/VPAutoLink.vue";
import VPHomeFeatures from "@theme/VPHomeFeatures.vue";
import { useDarkMode } from "@theme/useDarkMode";
import SiteFooter from "../components/SiteFooter.vue";
import { RouterLink } from "vue-router";

const frontmatter = usePageFrontmatter();
const siteLocale = useSiteLocaleData();
const isDarkMode = useDarkMode();
const featuredPosts = ref([]);
const featuredLoaded = ref(false);

const heroText = computed(() => {
  const fm = frontmatter.value || {};
  if (fm.heroText === null) return null;
  return fm.heroText || siteLocale.value.title || "Hello";
});

const tagline = computed(() => {
  const fm = frontmatter.value || {};
  if (fm.tagline === null) return null;
  return (
    fm.tagline ||
    siteLocale.value.description ||
    "Welcome to your VuePress site"
  );
});

const heroImage = computed(() => {
  const fm = frontmatter.value || {};
  if (isDarkMode.value && fm.heroImageDark !== undefined) {
    return fm.heroImageDark;
  }
  return fm.heroImage;
});

const heroHeight = computed(() => {
  const fm = frontmatter.value || {};
  return fm.heroHeight ?? 280;
});

const heroAlt = computed(() => {
  const fm = frontmatter.value || {};
  return fm.heroAlt || heroText.value || "hero";
});

const hasDarkVariant = computed(
  () => (frontmatter.value || {}).heroImageDark !== undefined
);

const heroSrc = computed(() => {
  const image = heroImage.value;
  if (!image) return null;
  return withBase(image);
});

const actions = computed(() => {
  const fm = frontmatter.value || {};
  if (!Array.isArray(fm.actions)) return [];
  return fm.actions.map(({ type = "primary", ...rest }) => ({
    type,
    ...rest,
  }));
});

const hasFeaturedPosts = computed(
  () => featuredLoaded.value && featuredPosts.value.length > 0
);

function formatFeaturedDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date)) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

async function loadFeaturedPosts() {
  try {
    const response = await fetch("/data/blog-posts.json");
    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.status}`);
    }
    const data = await response.json();
    featuredPosts.value = data
      .filter((post) => post.featured)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 3);
  } catch (error) {
    console.error("[home] Не удалось загрузить избранные посты:", error);
    featuredPosts.value = [];
  } finally {
    featuredLoaded.value = true;
  }
}

onMounted(() => {
  loadFeaturedPosts();
});
</script>

<template>
  <main class="vp-home custom-home">
    <header class="vp-hero">
      <ClientOnly v-if="hasDarkVariant && heroSrc">
        <img
          class="vp-hero-image"
          :src="heroSrc"
          :alt="heroAlt"
          :height="heroHeight"
        />
      </ClientOnly>
      <img
        v-else-if="heroSrc"
        class="vp-hero-image"
        :src="heroSrc"
        :alt="heroAlt"
        :height="heroHeight"
      />

      <h1 v-if="heroText" id="main-title">
        {{ heroText }}
      </h1>

      <p v-if="tagline" class="vp-hero-description">
        {{ tagline }}
      </p>

      <p v-if="actions.length" class="vp-hero-actions">
        <VPAutoLink
          v-for="action in actions"
          :key="action.text"
          class="vp-hero-action-button"
          :class="[action.type]"
          :config="action"
        />
      </p>
    </header>

    <section v-if="hasFeaturedPosts" class="home-featured">
      <h2 class="home-featured-title">Избранные записи блога</h2>
      <div class="home-featured-grid">
        <article
          v-for="post in featuredPosts"
          :key="post.path"
          class="home-featured-card"
        >
          <RouterLink :to="post.path" class="home-featured-link">
            <h3>{{ post.title }}</h3>
          </RouterLink>
          <time :datetime="post.date" class="home-featured-date">
            {{ formatFeaturedDate(post.date) }}
          </time>
          <p v-if="post.excerpt" class="home-featured-excerpt">
            {{ post.excerpt }}
          </p>
        </article>
      </div>
    </section>

    <VPHomeFeatures />

    <div vp-content>
      <Content />
    </div>

    <SiteFooter />
  </main>
</template>

<style lang="scss">
@use "@vuepress/theme-default/lib/client/styles/variables" as *;

.vp-home {
  display: block;
  max-width: var(--homepage-width);
  margin: 0 auto;
  padding: var(--navbar-height) 2rem 0;

  @media (max-width: $MQMobileNarrow) {
    padding-inline: 1.5rem;
  }

  [vp-content] {
    margin: 0;
    padding: 0;
  }
}

.vp-hero {
  text-align: center;
}

.vp-hero-image {
  display: block;
  max-width: 100%;
  max-height: 280px;
  margin: 3rem auto 1.5rem;

  @media (max-width: $MQMobileNarrow) {
    max-height: 210px;
    margin: 2rem auto 1.2rem;
  }
}

#main-title {
  font-size: 3rem;

  @media (max-width: $MQMobileNarrow) {
    font-size: 2rem;
  }
}

#main-title,
.vp-hero-description,
.vp-hero-actions {
  margin: 1.8rem auto;

  @media (max-width: $MQMobileNarrow) {
    margin: 1.2rem auto;
  }
}

.vp-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.vp-hero-description {
  max-width: 35rem;
  color: var(--vp-c-text-mute);
  font-size: 1.6rem;
  line-height: 1.3;

  @media (max-width: $MQMobileNarrow) {
    font-size: 1.2rem;
  }
}

.vp-hero-action-button {
  display: inline-block;
  box-sizing: border-box;
  padding: 0.8rem 1.6rem;
  border: 2px solid var(--vp-c-accent-bg);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-accent);
  font-size: 1.2rem;
  transition:
    background-color var(--vp-t-color),
    border-color var(--vp-t-color),
    color var(--vp-t-color);

  @media (max-width: $MQMobileNarrow) {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  }

  &:hover {
    background-color: var(--vp-c-accent-hover);
    color: var(--vp-c-accent-text);
  }

  &.primary {
    background-color: var(--vp-c-accent-bg);
    color: var(--vp-c-accent-text);

    &:hover {
      border-color: var(--vp-c-accent-hover);
      background-color: var(--vp-c-accent-hover);
    }
  }
}

.home-featured {
  margin-top: 2.5rem;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background-color: var(--vp-c-bg-soft);

  @media (max-width: $MQMobileNarrow) {
    padding: 1.5rem 1.2rem;
  }
}

.home-featured-title {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: left;
}

.home-featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.home-featured-card {
  padding: 1.25rem;
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color var(--vp-t-color);
}

.home-featured-link {
  text-decoration: none;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--vp-c-text-1);
  }

  &:hover h3 {
    color: var(--vp-c-accent);
  }
}

.home-featured-date {
  font-size: 0.9rem;
  color: var(--vp-c-text-mute);
}

.home-featured-excerpt {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.45;
}
</style>
