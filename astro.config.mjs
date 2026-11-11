// @ts-check
import { defineConfig, envField, sessionDrivers } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import webmanifest from "astro-webmanifest";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

import { unified } from "@astrojs/markdown-remark";
import { remarkAlert } from "remark-github-blockquote-alert";

import earlyHints from "./integrations/early-hints.mjs";
import { SITE_DESCRIPTION, SITE_TITLE } from "./src/constants";

// https://astro.build/config
export default defineConfig({
  site: "https://mahadk.com",
  // Astro 7 defaults to "jsx", which strips whitespace between inline elements
  compressHTML: true,
  integrations: [
    expressiveCode({
      themes: ["catppuccin-macchiato", "catppuccin-latte"],
    }),
    mdx(),
    earlyHints(),
    sitemap(),
    webmanifest({
      name: SITE_TITLE,
      icon: "src/assets/img/favicon.png", // source for favicon & icons

      short_name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      start_url: "/",
      theme_color: "#cba6f7", // mocha mauve
      background_color: "#1e1e2e", // mocha base
      display: "standalone",
    }),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: "catppuccin-macchiato",
        dark: "catppuccin-macchiato",
      },
    },
    processor: unified({ remarkPlugins: [remarkAlert] }),
  },

  vite: {
    plugins: /** @type {import("astro").ViteUserConfig["plugins"]} */ ([
      tailwindcss(),
    ]),
  },

  env: {
    schema: {
      DISCORD_USER_ID: envField.string({
        context: "client",
        access: "public",
      }),
      UMAMI_SCRIPT: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      UMAMI_WEBSITE_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      SENTRY_DSN: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      SENTRY_PROJECT_NAME: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      SENTRY_AUTH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

  // No sessions are used, so skip provisioning a KV namespace for them
  session: { driver: sessionDrivers.lruCache() },

  adapter: cloudflare({
    prerenderEnvironment: "node",
    imageService: "compile",
  }),
});
