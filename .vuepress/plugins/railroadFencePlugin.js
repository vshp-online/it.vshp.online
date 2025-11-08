import { Buffer } from "node:buffer";

/**
 * Плагин Markdown для обработки ```railroad``` и добавления id к fenced-блокам
 */
export const railroadFencePlugin = () => ({
  name: "railroad-fence",
  extendsMarkdown: (md) => {
    // Сохраняем оригинальный fence-рендерер
    const origFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const html = origFence
        ? origFence(tokens, idx, options, env, slf)
        : slf.renderToken(tokens, idx, options);

      const info = tokens[idx].info || "";

      // Ищем {#my-id} в info-строке, НЕ трогая {2,7-9}
      // Допускаем любые дополнительные атрибуты внутри одних {} — лишь бы был #id
      const m = info.match(/\{[^}]*#([A-Za-z][\w:.-]*)[^}]*\}/);
      const id = m ? m[1] : null;
      if (!id) return html;

      // Аккуратно вставляем id в первый <pre ...>, если его там ещё нет
      return html.replace(/<pre(?![^>]*\bid=)/, (openTag) => {
        return openTag.replace("<pre", `<pre id="${id}"`);
      });
    };

    const orig = md.renderer.rules.fence?.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const info = (token.info || "").trim();
      const [lang] = info.split(/\s+/);

      // Только ```railroad
      if (lang !== "railroad") {
        return orig
          ? orig(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      }

      const b64 = Buffer.from(token.content, "utf8").toString("base64");
      // Никаких <pre><code> — просто проп b64
      return `<ClientOnly><RailroadDiagram b64="${b64}"/></ClientOnly>`;
    };
  },
});
