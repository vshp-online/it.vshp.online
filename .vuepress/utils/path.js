/**
 * Нормализует путь страницы:
 * - удаляет query/hash
 * - убирает `.html` и `/index.html`
 * - удаляет хвостовые слэши
 * - возвращает '/' для пустого результата
 */
export const normalizePath = (path) => {
  if (!path) return "/";
  let normalized = String(path).replace(/[#?].*$/, "");
  normalized = normalized.replace(/(?:\/index)?\.html$/i, "");
  normalized = normalized.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
};

/**
 * Создаёт функцию, которая проверяет, попадает ли путь под один из заданных префиксов.
 * Префиксы нормализуются, как и проверяемые пути.
 */
export const createPathExcluder = (prefixes = []) => {
  const normalizedPrefixes = prefixes.map(normalizePath);
  return (path) => {
    const normalized = normalizePath(path);
    return normalizedPrefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(prefix + "/")
    );
  };
};
