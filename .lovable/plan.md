

# Fix: Build Won't Load (Blank White Page)

## Root Cause Analysis

The Vite dev server returns 404 for `src/main.tsx`, meaning compilation failed entirely. After inspecting all recently created/edited files, no obvious syntax errors were found. The issue is likely one of:

1. **Memory/compilation overload** -- The project has 100+ lazy-loaded routes and a 6527-line auto-generated types file, which may exceed Vite's dev server capacity
2. **A subtle TypeScript transform error** in one of the ~20 recently added files that esbuild catches during transformation

## Fix Strategy

### Step 1: Add a reset-password route that is imported but never routed
The `ResetPassword` component is lazy-imported in App.tsx (line 44) but has no corresponding `<Route>`. While this alone shouldn't crash the build, adding the missing route ensures consistency:
- Add `<Route path="/reset-password" element={<ResetPassword />} />` to App.tsx

### Step 2: Defensive guard on Web Worker import
The `useGlucoseForecast.ts` hook uses `new URL('../workers/...', import.meta.url)` which can cause Vite transform issues if the worker file has import resolution problems. Wrap the worker instantiation in a try/catch and make it lazy (only create the worker when explicitly called, not on mount).

### Step 3: Guard the dynamic CDN import in webllmLoader.ts
Line 50 of `webllmLoader.ts` uses `import(/* @vite-ignore */ 'https://esm.run/@mlc-ai/web-llm')`. Even with `@vite-ignore`, Vite may still attempt to resolve this during compilation. Wrap this in a more defensive pattern using `eval` or `Function` constructor to fully bypass Vite's import analysis.

### Step 4: Verify build compiles
After each fix, check if the preview loads. If it still fails after Steps 1-3, temporarily comment out the most recently added lazy imports in App.tsx (AuditLog, FeatureFlagManager, MentorDirectory, ProviderDashboard) to isolate which import chain causes the failure, then re-enable them one by one.

## Files to Modify
1. `src/App.tsx` -- Add missing reset-password route
2. `src/hooks/useGlucoseForecast.ts` -- Guard worker instantiation
3. `src/utils/webllmLoader.ts` -- Fix dynamic CDN import to bypass Vite analysis

