import { defineConfig } from "nitro";
export default defineConfig({
  modules: ["workflow/nitro"],
  routes: {
    "/**": "./index.ts",
  },
  // Vercel-specific: the Workflow SDK's own step-execution route
  // (.well-known/workflow/v1/step) is where actual email sends happen —
  // network calls to SES for each chunk. The public API routes
  // (/api/v1/emails, /api/v1/posts) just enqueue a workflow run and return
  // immediately, so they don't need extra headroom; this route does.
  // Bump this further (and/or lower CHUNK_SIZE in
  // services/workflows/email-campaign.ts) if you're on a plan where this
  // default isn't enough headroom.
  vercel: {
    functionRules: {
      "/.well-known/workflow/v1/**": {
        maxDuration: 60,
      },
    },
  },
});
