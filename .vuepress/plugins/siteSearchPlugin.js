import { searchPlugin } from "@vuepress/plugin-search";

const normalizePath = (path) => {
  if (!path) return "/";
  let normalized = String(path).replace(/[#?].*$/, "");
  normalized = normalized.replace(/(?:\/index)?\.html$/i, "");
  normalized = normalized.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
};

const createExcludeChecker = (exclude) => {
  const prefixes = exclude.map(normalizePath);
  return (path) => {
    const normalized = normalizePath(path);
    return prefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(prefix + "/")
    );
  };
};

/**
 * Обёртка над @vuepress/plugin-search c поддержкой exclude-списка.
 */
export const siteSearchPlugin = (options = {}) => {
  const { exclude = [], isSearchable: userIsSearchable, ...rest } = options;
  const isExcluded = createExcludeChecker(exclude);

  return searchPlugin({
    ...rest,
    isSearchable: (page) => {
      const allowed =
        page.frontmatter?.search !== false && !isExcluded(page.path);
      if (!allowed) return false;
      return userIsSearchable ? userIsSearchable(page) : true;
    },
  });
};
