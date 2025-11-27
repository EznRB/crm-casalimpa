## What the 5 logs mean
- Module not found for `@supabase/ssr` at `src/middleware.ts:1` — missing dependency prevents compilation.
- Repeat of the same build error via React Dev Overlay — same root cause.
- Overlay focus stack trace — side effect of the overlay reacting to the compile error, not a functional bug in your app.
- `net::ERR_ABORTED` for `http://localhost:3000/?ide_webview_request_time=...` — HMR/websocket reconnect fails due to the compile error.
- `net::ERR_ABORTED` for webpack hot-update JSON — hot reload aborted because the build can’t complete.

## Root Cause & Evidence
- `src/middleware.ts:1` imports `createServerClient` from `@supabase/ssr`.
- `package.json` does not include `@supabase/ssr`, while `next@14.2.0` and `@supabase/supabase-js@^2.39.7` are present — the SSR helper package must be installed separately.

## Plan to Fix
1. Install missing dependency: `npm i @supabase/ssr`.
2. Verify middleware shape:
   - Ensure `src/middleware.ts` exports `middleware(req: NextRequest)` (Next looks for `middleware`). If keeping `updateSession`, also export `middleware` that delegates to it.
3. Confirm envs: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set (they’re used in middleware).
4. Restart dev server: `npm run dev`.
5. Validate:
   - App loads without compile errors.
   - Navigate to protected routes; unauthenticated users redirect to `/login`.
   - Check cookies set by Supabase are preserved across responses.
6. Optional cleanup:
   - Add tests around auth redirect behavior.
   - Document expected envs and SSR behavior in project notes.

## Rollback/Alternative
- If you intended `@supabase/auth-helpers-nextjs`, we can switch imports and setup accordingly, but with Next 14 the `@supabase/ssr` package is the recommended path.

Shall I apply these fixes now?