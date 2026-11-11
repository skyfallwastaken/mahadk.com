// @ts-check
import { appendFile, readFile } from "node:fs/promises";

/**
 * Adds `Link` preload headers for the shared stylesheet and main font to
 * `_headers`, so Cloudflare can send them as 103 Early Hints. The file names
 * are hashed, so they have to be read from the build output.
 *
 * @returns {import("astro").AstroIntegration}
 */
export default function earlyHints() {
  return {
    name: "early-hints",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const html = await readFile(new URL("index.html", dir), "utf-8");
        const stylesheets = [
          ...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g),
        ].map((match) => match[1]);

        const links = stylesheets.map(
          (href) => `<${href}>; rel=preload; as=style`,
        );
        for (const href of stylesheets) {
          const css = await readFile(new URL(`.${href}`, dir), "utf-8");
          const font = css.match(
            /url\((\/_astro\/ibm-plex-sans-latin-wght-normal\.[^)]+\.woff2)\)/,
          )?.[1];
          if (font) {
            links.push(
              `<${font}>; rel=preload; as=font; type=font/woff2; crossorigin`,
            );
          }
        }

        if (links.length === 0) {
          logger.warn("No stylesheets found, skipping Early Hints headers");
          return;
        }

        const rule = `\n/*\n${links.map((link) => `  Link: ${link}`).join("\n")}\n`;
        await appendFile(new URL("_headers", dir), rule);
        logger.info(`Added ${links.length} Early Hints Link headers`);
      },
    },
  };
}
