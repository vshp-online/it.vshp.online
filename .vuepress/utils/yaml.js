import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

/**
 * Загружает YAML-файл относительно заданной директории.
 */
export const loadYaml = (baseDir, relPath, fallback = []) => {
  const file = path.resolve(baseDir, relPath);
  const src = fs.readFileSync(file, "utf8");
  const data = YAML.parse(src);
  return Array.isArray(data) ? data : fallback;
};
