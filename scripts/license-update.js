// Обновляет subtree VSHP-EMLicense до версии из package.json -> config.vshpLicenseRef
// Требования:
// - subtree уже добавлен вручную (--prefix VSHP-EMLicense)
// - рабочее дерево чистое.

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

function run(cmd) {
  console.log(`[license] ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function isClean() {
  try {
    execSync('git diff --quiet --exit-code');
    execSync('git diff --quiet --exit-code --cached');
    return true;
  } catch {
    return false;
  }
}

function readConfig() {
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
  const cfg = pkg.config || {};
  const repo   = cfg.vshpLicenseRepo || 'https://github.com/vshp-online/VSHP-EMLicense.git';
  const ref    = cfg.vshpLicenseRef  || '1.0.0'; // тег версии
  const prefix = cfg.vshpLicensePrefix || 'VSHP-EMLicense';
  return { repo, ref, prefix };
}

(function main() {
  const { repo, ref, prefix } = readConfig();

  if (!existsSync(prefix)) {
    console.error(`[license] Не найдена папка '${prefix}'. Сначала добавьте subtree вручную:
  git subtree add --prefix ${prefix} ${repo} ${ref} --squash`);
    process.exit(1);
  }

  if (!isClean()) {
    console.warn('[license] Рабочее дерево не чистое. Пропускаю обновление subtree. Закоммить/стэшни изменения и повтори.');
    process.exit(0);
  }

  try {
    // тянем нужный тег/ветку в subtree
    run(`git subtree pull --prefix ${prefix} ${repo} ${ref} --squash -m "sync VSHP-EMLicense to ${ref}"`);

    // маленький лог: покажем версию из LICENSE.md (если есть)
    const licPath = join(prefix, 'LICENSE.md');
    if (existsSync(licPath)) {
      const head = readFileSync(licPath, 'utf8').split('\n').slice(0, 20).join('\n');
      const ver = (head.match(/\*\*Версия:\*\*\s*([^\n]+)/) || [])[1];
      if (ver) console.log(`[license] Обновлено. Текущая версия: ${ver.trim()}`);
    }
  } catch (e) {
    process.exit(e.status || 1);
  }
})();
