# CSP & Production – What Can Break and What’s Allowed

Stricter Helmet (CSP + HSTS) is enabled **only in production** (`NODE_ENV === "production"`). This file explains what was tuned for your codebase and what problems you might see.

## What’s Allowed (Current CSP)

- **default-src 'self' blob:** – Same-origin + `blob:` (needed for audit-log export / file download via `createObjectURL`).
- **script-src 'self'** – Only scripts from your origin (Vite bundle). No inline scripts, no CDNs.
- **style-src 'self' 'unsafe-inline'** – Your CSS + inline styles (React `style={{}}` used in many components).
- **img-src 'self' data: blob:** – Same-origin images, data URLs, and blob URLs.
- **font-src 'self' data:** – Same-origin fonts and data URLs.
- **connect-src 'self'** – API calls to same origin only (your frontend uses `/api` relative).
- **frameAncestors 'self'** – Only your site can embed the app in an iframe.
- **HSTS** – 1 year, includeSubDomains, preload.

## Problems You Might See in Production

1. **API on a different domain**  
   If you serve the frontend and API from different origins (e.g. frontend on `https://app.example.com`, API on `https://api.example.com`), `connect-src 'self'` will block API requests.  
   **Fix:** Add the API origin to `connectSrc`, e.g. `["'self'", "https://api.example.com"]` in `server.js` Helmet config.

2. **Third-party scripts (analytics, chat, etc.)**  
   Any script loaded from a CDN or other domain is blocked by `script-src 'self'`.  
   **Fix:** Add the script origin to `scriptSrc`, e.g. `["'self'", "https://www.googletagmanager.com"]`. Avoid `'unsafe-inline'` for scripts if you can.

3. **External fonts (Google Fonts, etc.)**  
   Fonts loaded from `https://fonts.googleapis.com` or similar are blocked if not listed.  
   **Fix:** Add to `fontSrc`, e.g. `["'self'", "data:", "https://fonts.gstatic.com"]` and ensure `font-src` allows the font URL origin (often `fonts.googleapis.com` for the CSS and `fonts.gstatic.com` for the files).

4. **Images from external URLs**  
   If you show images from another domain (e.g. user avatars from a CDN), they’re blocked by `img-src 'self' data: blob:`.  
   **Fix:** Add that origin to `imgSrc`, e.g. `["'self'", "data:", "blob:", "https://your-cdn.com"]`.

5. **Blob / download links**  
   Your app uses `window.URL.createObjectURL(blob)` in **S1AdminDashboard.jsx** and **AdminAuditLogs.jsx** for export/download. `default-src` and `img-src` include `blob:` so this should work. If a future feature uses blob URLs in another way (e.g. in a worker), you may need to add `blob:` to the relevant directive (e.g. `worker-src`).

6. **Dev vs prod**  
   In development, CSP is Helmet’s default (not this strict list). In production, only the directives above apply. If something works in dev but breaks in prod, check the browser console for CSP violation messages (e.g. “blocked by Content-Security-Policy”) and add the reported source to the right directive.

## Quick Check

After deploying, open DevTools → Console and look for messages like:

- `Content-Security-Policy ... blocked ...`
- `Refused to load ... because it violates the following directive ...`

Use the “Fix” steps above for the directive mentioned in the message.
