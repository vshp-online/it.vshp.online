import fs from "node:fs";
import path from "node:path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

export const APP_VERSION = pkg.version ?? "dev";
export const VSHP_EML_VERSION = pkg.config?.vshpLicenseRef ?? "";
