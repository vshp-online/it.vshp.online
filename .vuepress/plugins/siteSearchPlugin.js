import { searchPlugin } from "@vuepress/plugin-search";
import { createPathExcluder } from "../utils/path.js";

/**
 * Обёртка над @vuepress/plugin-search c поддержкой exclude-списка.
 */
export const siteSearchPlugin = (options = {}) => {
  const { exclude = [], isSearchable: userIsSearchable, ...rest } = options;
  const isExcluded = createPathExcluder(exclude);

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
