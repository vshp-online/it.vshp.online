import container from "markdown-it-container";

const deriveAlt = (src = "") => {
  const filename = src.split("/").pop() || "";
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
};

const parsePhotoLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("@photo")) return null;

  const body = trimmed.replace(/^@photo\s+/, "");
  if (!body) return null;

  const [rawSrc, ...captionParts] = body.split("|");
  const srcPart = rawSrc?.trim() || "";
  if (!srcPart) return null;

  let src = srcPart;
  let alt = "";

  const altMatch = srcPart.match(/"([^"]+)"$/);
  if (altMatch) {
    alt = altMatch[1];
    src = srcPart.replace(/\s+"[^"]+"$/, "").trim();
  }

  if (!src) return null;

  const caption = captionParts.join("|").trim();
  return { src, alt, caption };
};

export const galleryPlugin = () => ({
  name: "gallery-plugin",
  extendsMarkdown: (md) => {
    md.use(container, "gallery", {
      validate: (params) => params.trim().startsWith("gallery"),
      render: (tokens, idx) => {
        if (tokens[idx].nesting === 1) {
          return '<div class="photo-grid" data-gallery>\n';
        }
        return "</div>\n";
      },
    });

    const escapeHtml = md.utils.escapeHtml;

    const photoRule = (state, startLine, endLine, silent) => {
      const start = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      const line = state.src.slice(start, max);

      const parsed = parsePhotoLine(line);
      if (!parsed) return false;

      if (silent) return true;

      const token = state.push("gallery_photo", "figure", 0);
      token.block = true;
      token.map = [startLine, startLine + 1];
      token.meta = parsed;
      state.line = startLine + 1;
      return true;
    };

    md.block.ruler.before("paragraph", "gallery_photo", photoRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    md.renderer.rules.gallery_photo = (tokens, idx) => {
      const { src, caption, alt } = tokens[idx].meta || {};
      if (!src) return "";

      const resolvedAlt = alt || caption || deriveAlt(src) || "Photo";
      const captionHtml = caption
        ? `<figcaption>${escapeHtml(caption)}</figcaption>`
        : "";

      return `<figure class="photo-grid-item"><img src="${escapeHtml(
        src
      )}" alt="${escapeHtml(
        resolvedAlt
      )}" loading="lazy" decoding="async" data-no-zoom="true" />${captionHtml}</figure>\n`;
    };
  },
});
