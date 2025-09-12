<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useNavigate } from "@theme/useNavigate";
import { usePageData, useRoutes } from "@vuepress/client";
import { useEventListener } from "@vueuse/core";

const page = usePageData();
const navigate = useNavigate();
const routesRef = useRoutes();

const norm = (p) =>
  (p || "/").replace(/index\.html$/i, "").replace(/\/+$/, "/") + "";
const segs = (p) => norm(p).split("/").filter(Boolean).length;

const current = computed(() => norm(page.value.path));
const dir = computed(() =>
  current.value.replace(/[^/]+(\.html)?$/i, "/").replace(/\/+$/, "/")
);

const isRootDir = computed(() => dir.value === "/");

const isHomePage = computed(
  () => current.value === "/" || page.value.frontmatter?.home === true
);

const routeEntries = computed(() => {
  const r = routesRef.value || {};
  return Array.isArray(r) ? r.map((x) => [x.path, x]) : Object.entries(r);
});

function findRouteByPath(path) {
  const p = norm(path);
  const r = routesRef.value || {};
  if (Array.isArray(r)) return r.find((x) => norm(x.path) === p);
  return r[p] || Object.values(r).find((x) => norm(x.path) === p);
}

function titleForPath(path) {
  const rec = findRouteByPath(path);
  return (
    (rec?.meta && (rec.meta.title || rec.meta.frontmatter?.title)) ||
    rec?.title ||
    ""
  );
}

const siblings = computed(() => {
  if (isRootDir.value) return [];
  const d = dir.value;
  const want = segs(d) + 1;

  return routeEntries.value
    .map(([path]) => path)
    .filter((p) => p.startsWith(d) && p !== d && p.endsWith(".html"))
    .filter((p) => segs(p) === want)
    .sort((a, b) =>
      a.localeCompare(b, "ru", { numeric: true, sensitivity: "base" })
    );
});

const idx = computed(() =>
  siblings.value.findIndex((p) => norm(p) === current.value)
);
const prevPathSibling = computed(() =>
  idx.value > 0 ? siblings.value[idx.value - 1] : undefined
);
const nextPathSibling = computed(() =>
  idx.value >= 0 && idx.value < siblings.value.length - 1
    ? siblings.value[idx.value + 1]
    : undefined
);

const prevLinkSibling = computed(() =>
  prevPathSibling.value
    ? { link: prevPathSibling.value, text: titleForPath(prevPathSibling.value) }
    : undefined
);
const nextLinkSibling = computed(() =>
  nextPathSibling.value
    ? { link: nextPathSibling.value, text: titleForPath(nextPathSibling.value) }
    : undefined
);

// helper: находим «правильный» путь роутера для строки из FM
function resolveRoutePath(input) {
  if (!input) return "";

  // отбрасываем query/hash и гарантируем ведущий слэш
  let p = String(input).replace(/[#?].*$/, "");
  if (!p.startsWith("/")) p = "/" + p;

  const hasExt = /\.[a-zA-Z0-9]+$/.test(p);
  const endsSlash = p.endsWith("/");

  // кандидаты на совпадение в routes
  const candidates = new Set();
  const add = (x) => candidates.add(norm(x));

  add(p);
  if (!hasExt && !endsSlash) {
    add(p + ".html"); // '/about' -> '/about.html'
    add(p + "/index.html"); // '/about' -> '/about/index.html'
  }
  if (endsSlash) {
    add(p + "index.html"); // '/guide/' -> '/guide/index.html'
    add(p.slice(0, -1) + ".html"); // '/guide/' -> '/guide.html'
  }

  // ищем первый существующий маршрут
  const routeSet = new Set(
    (Array.isArray(routesRef.value)
      ? routesRef.value
      : Object.values(routesRef.value || {})
    ).map((r) => norm(r.path))
  );
  for (const c of candidates) if (routeSet.has(c)) return c;

  // если не нашли, аккуратно добавим .html когда у строки нет расширения и '/'
  return norm(!hasExt && !endsSlash ? p + ".html" : p);
}

// приоритет frontmatter.prev/next
// Поддерживаем: false | string | { link, text } (как у дефолтной темы)
function coerceFMLink(val) {
  if (val === false) return undefined;
  if (!val) return undefined;

  if (typeof val === "string") {
    const link = resolveRoutePath(val);
    return { link, text: titleForPath(link) };
  }
  if (typeof val === "object" && val.link) {
    const link = resolveRoutePath(val.link);
    const text = val.text || titleForPath(link);
    return { link, text };
  }
  return undefined;
}

const prevFM = computed(() => coerceFMLink(page.value.frontmatter?.prev));
const nextFM = computed(() => coerceFMLink(page.value.frontmatter?.next));

/** финальные ссылки: сначала frontmatter, потом — fallback */
const prevLink = computed(() => prevFM.value ?? prevLinkSibling.value);
const nextLink = computed(() => nextFM.value ?? nextLinkSibling.value);

/* ── hotkeys Alt+←/→ ──────────────────────────────────── */
useEventListener("keydown", (event) => {
  if (!event.altKey) return;
  if (event.key === "ArrowRight" && nextLink.value) {
    navigate(nextLink.value.link);
    event.preventDefault();
  } else if (event.key === "ArrowLeft" && prevLink.value) {
    navigate(prevLink.value.link);
    event.preventDefault();
  }
});
</script>

<template>
  <nav v-if="!isHomePage && (prevLink || nextLink)" class="bottom-nav">
    <RouterLink v-if="prevLink" class="nav-button prev" :to="prevLink.link">
      <div class="hint">
        <span class="arrow left" />
        <span>{{ "Предыдущая" }}</span>
      </div>
      <div class="link">
        <span>{{ prevLink.text }}</span>
      </div>
    </RouterLink>
    <RouterLink v-if="nextLink" class="nav-button next" :to="nextLink.link">
      <div class="hint">
        <span>{{ "Следующая" }}</span>
        <span class="arrow right" />
      </div>
      <div class="link">
        <span>{{ nextLink.text }}</span>
      </div>
    </RouterLink>
  </nav>
</template>

<style lang="scss">
.bottom-nav {
  display: grid;
  grid-template-columns: 1fr 1fr; /* две равные половины */
  column-gap: 0.5rem;
  align-items: stretch;
  max-width: var(--content-width, 740px);
  min-height: 2rem;
  margin-inline: auto;
  margin-top: 0;
  padding: 1rem 0;
  border-top: 1px solid var(--vp-c-divider);
  transition: border-top var(--vp-t-color);

  .nav-button {
    box-sizing: border-box;
    display: block;
    width: 100%; /* растянуть в свою половину */
    padding: 0.5rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 0.25rem;

    .hint {
      font-size: 0.9rem;
      color: var(--vp-c-text-mute);
      margin-bottom: 0.5rem;
    }
  }

  /* левая всегда слева, правая всегда справа */
  .prev {
    grid-column: 1;
    text-align: start;
  }
  .next {
    grid-column: 2;
    text-align: end;
  }
}
</style>
