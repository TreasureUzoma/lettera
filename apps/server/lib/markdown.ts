import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  gfm: true,
  breaks: true,
});

// Tags/attributes considered safe to land in a recipient's inbox. Email
// clients render arbitrary HTML but never execute scripts, so the real risk
// here isn't XSS in the browser sense — it's a sender using the newsletter
// body to smuggle in tracking pixels, hidden text, or markup that breaks out
// of the branding wrapper applied in applyBranding(). Keep this allowlist
// tight and additive: prefer widening it deliberately over defaulting open.
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  "*": ["class"],
};

/**
 * Renders newsletter Markdown to HTML suitable for emailing: full
 * CommonMark/GFM support (lists, tables, code fences, links, images,
 * emphasis, etc.) via `marked`, then sanitized via `sanitize-html` so raw
 * HTML/script/event-handlers embedded in the source can't ride along into
 * the outbound email untouched.
 */
export function renderNewsletterMarkdown(content: string): string {
  const rawHtml = marked.parse(content, { async: false });

  return sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    // Force safe defaults on every link so a crafted `target` can't opener-leak.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}
