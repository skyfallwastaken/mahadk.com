import * as entrypoint from "@astrojs/cloudflare/entrypoints/server" with {
  type: "cf-worker",
};
import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "skyfall-site",
    compatibilityDate: "2026-11-10",
    compatibilityFlags: ["global_fetch_strictly_public"],
    entrypoint,
    env: {
      ASSETS: bindings.assets(),
    },
    domains: ["mahadk.com", "www.mahadk.com"],
    observability: {
      enabled: true,
    },
  },
});
