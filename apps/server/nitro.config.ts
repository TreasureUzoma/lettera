import { defineConfig } from "nitro";
export default defineConfig({
  modules: ["workflow/nitro"],
  routes: {
    "/**": "./index.ts",
  },
});
