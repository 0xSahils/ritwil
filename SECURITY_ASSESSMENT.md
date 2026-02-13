# Security Assessment Report

**Project:** Ritwil  
**Assessment Date:** February 2026  
**Scope:** SQL Injection, XSS, CSRF, Security Headers, HTTPS, Input Validation, Session Management, File Upload, Access Control  

This document provides descriptive answers and recommendations for each security testing area requested. It is based on a review of the Backend (Node/Express/Prisma) and Frontend (React/Vite) codebase.

---

## 1. SQL Injection Testing

### What was checked

The codebase was reviewed for any place where SQL is built from user input (query parameters, request body, headers) or where raw SQL is executed. SQL injection occurs when an attacker can change the meaning of a query by injecting SQL fragments (e.g. via `' OR '1'='1` in a login field).

### Findings

- **All database access uses Prisma ORM.** The application does not write raw SQL in controllers, routes, or services. Queries use Prisma’s type-safe API, for example:
  - `prisma.user.findUnique({ where: { email } })`
  - `prisma.team.findMany({ where: { isActive: true } })`
  - `prisma.personalPlacement.findMany({ where: { employeeId: userId } })`
- Prisma sends **parameterized queries** to the database. User-supplied values are passed as parameters, not concatenated into the query string, so they cannot alter the query structure.
- The only references to `$queryRawUnsafe` or `$executeRawUnsafe` appear in **Prisma’s generated client** (e.g. inside `Backend/src/generated/client/runtime/`), not in your application code. Your code does not call these methods.

### Conclusion

**Status: Protected.** The application is not vulnerable to SQL injection in its current design because it uses an ORM with parameterized queries and no raw SQL in app code.

### Recommendations

- Continue to avoid raw SQL. If you ever need a query Prisma cannot express, use Prisma’s **tagged template** form, e.g. `` prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${userId}` ``, so values remain parameterized.
- Do **not** use `$queryRawUnsafe` or `$executeRawUnsafe` with string concatenation or user-controlled input.

---

## 2. Cross-Site Scripting (XSS)

### What was checked

The review looked for:
- **Stored XSS:** User input saved and later rendered as HTML.
- **Reflected XSS:** User input echoed back in responses without escaping.
- **DOM-based XSS:** Unsafe use of `innerHTML`, `eval`, or similar in the frontend.
- **Cookie exposure:** Whether session/refresh tokens could be stolen via script.

### Findings

- **Frontend (React):** No use of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` was found. Content is rendered with React’s default escaping (e.g. `{user.name}`), which prevents script injection in normal use.
- **Backend:** APIs return **JSON**. No server-side HTML is generated from user input; there are no template engines that could render unescaped user data into HTML.
- **Refresh token cookie:** Set with `httpOnly: true` in `Backend/src/routes/auth.js`. This prevents JavaScript from reading the cookie, so even if an XSS bug existed elsewhere, the refresh token would not be exfiltrated via script.
- **Access token:** Stored in `localStorage` and sent in the `Authorization` header. If an XSS vulnerability were introduced, the access token could be read by script; this is a common trade-off in SPA designs.

### Conclusion

**Status: Low risk.** The application does not introduce obvious XSS vectors: no dangerous HTML APIs and no server-rendered HTML from user input. React’s default escaping and the httpOnly cookie reduce impact.

### Recommendations

- Avoid introducing `dangerouslySetInnerHTML` for any user-controlled or untrusted content. If you need to render HTML (e.g. rich text), use a sanitization library (e.g. **DOMPurify**) and a strict **Content-Security-Policy**.
- Ensure all user-displayed fields (name, email, etc.) remain rendered as text in React (no raw HTML).
- For higher security, consider keeping the access token only in memory and using the httpOnly refresh cookie to obtain new access tokens, so XSS cannot steal a long-lived token from storage.

---

## 3. Cross-Site Request Forgery (CSRF)

### What was checked

CSRF allows a malicious site to trigger actions in the user’s browser using the user’s existing session. The review checked how the app authenticates requests and whether cross-site requests could perform sensitive actions.

### Findings

- **CORS:** The backend uses `cors({ origin: CLIENT_ORIGIN, credentials: true })` in `Backend/src/server.js`. Only the configured frontend origin can send credentialed requests; other origins are blocked by the browser.
- **Authentication method:** State-changing and sensitive operations require a **Bearer token** in the `Authorization` header. Browsers do **not** send custom headers when a form or link on another site triggers a request. So a malicious site cannot add `Authorization: Bearer <token>` to a cross-site request; the attacker would have to get the token (e.g. via XSS), which is a different threat.
- **Refresh token cookie:** Set with `sameSite: 'lax'` and `httpOnly: true`. With `lax`, the cookie is not sent on cross-site POST requests from other domains (e.g. from a form on evil.com), which reduces CSRF risk for cookie-based flows.
- **No CSRF tokens:** The application does not use double-submit cookie or synchronizer-token CSRF protection. For an API that relies on Bearer tokens and same-origin/cors + sameSite cookies, this is a common approach; the main risk would be if the app later added cookie-based or form-based flows that do not require a custom header.

### Conclusion

**Status: Partially mitigated.** CSRF risk is limited by CORS, Bearer token requirement, and sameSite on the refresh cookie. There is no dedicated CSRF token mechanism.

### Recommendations

- Keep **CLIENT_ORIGIN** strict in production (exactly the front-end URL). Do not use `origin: true` or wildcards with credentials.
- If you later add endpoints that rely only on cookies (no Authorization header) for state-changing actions, add CSRF protection (e.g. same-site CSRF token in header or body and validated on the server).

---

## 4. Security Headers Check

### What was checked

HTTP security headers were reviewed. These headers instruct the browser and intermediaries on how to handle content and reduce risks such as clickjacking, MIME sniffing, and XSS.

### Findings

- **Helmet is used:** In `Backend/src/server.js`, `app.use(helmet())` is applied. Helmet sets a set of secure headers, which typically include:
  - **X-Content-Type-Options: nosniff** – Prevents MIME-type sniffing so the browser does not interpret a non-HTML response as HTML or script.
  - **X-Frame-Options** – Reduces clickjacking by controlling whether the page can be embedded in iframes.
  - **X-XSS-Protection** – Legacy XSS filter (deprecated but harmless).
  - **Strict-Transport-Security (HSTS)** – Can be enabled via Helmet to force HTTPS (often configured in production).
  - **Content-Security-Policy (CSP)** – Helmet can set a default CSP; it may be relaxed by default and can be tuned.
- **CORS** is configured with a single origin and credentials, which restricts which sites can call the API.

### Conclusion

**Status: Implemented.** Security headers are in place via Helmet.

### Recommendations

- In production, consider **tuning Helmet** to add a strict **Content-Security-Policy** that allows only your app’s origin and trusted script/style sources. This adds defense-in-depth against XSS and unauthorized script loading.
- If the app is behind a reverse proxy (Nginx, cloud load balancer, etc.), ensure the proxy does **not** strip or override these headers. Prefer setting security headers in one place (either app or proxy) to avoid confusion.

---

## 5. HTTPS Enforcement

### What was checked

The review checked whether the application ensures traffic is encrypted (HTTPS) so that credentials and data are not sent in cleartext.

### Findings

- **Refresh token cookie:** In `Backend/src/routes/auth.js`, the cookie is set with `secure: process.env.NODE_ENV === "production"`. In production, the cookie is marked **Secure**, so the browser will only send it over HTTPS.
- **Application code:** There is **no** explicit HTTP-to-HTTPS redirect in the Node server. In many deployments, HTTPS is terminated at a reverse proxy or platform (e.g. Vercel, AWS ALB, Nginx); the Node app listens on HTTP behind the proxy. In that setup, the app itself does not need to redirect; the proxy serves HTTPS to the client.
- **Frontend:** The API client uses a relative path (`/api`) when calling the backend. When the frontend is served over HTTPS, same-origin API calls will also go over HTTPS if the same host is used. The Vite dev proxy targets `http://localhost:4000` for development only.

### Conclusion

**Status: Deployment-dependent.** The app uses the Secure cookie flag in production but does not perform HTTPS redirect itself. HTTPS is typically enforced by the deployment environment.

### Recommendations

- **Production:** Ensure the entire application (frontend and API) is served over HTTPS. Configure the reverse proxy or platform to redirect HTTP to HTTPS (301/302) so users never send credentials over HTTP.
- If the Node server is ever **directly** exposed to the internet (no proxy), add middleware that checks `X-Forwarded-Proto` (or `req.secure`) and redirects non-HTTPS requests to the HTTPS URL.
- Do not set `secure: false` on the refresh cookie in production.

---

## 6. Input Validation Testing

### What was checked

The review looked for validation of all user-supplied input: request body, query parameters, and route parameters. Weak or missing validation can lead to bad data, injection, or logic errors.

### Findings

- **Auth (login):** Email is taken from `req.body` and normalized with `toLowerCase()`. There is no schema-based validation (e.g. email format, password length). Passwords are compared with bcrypt and never stored in plain text.
- **User creation/update:** In `Backend/src/controllers/userController.js`, there is ad hoc validation:
  - Required fields (email, password, name, role) are checked.
  - Role is validated against an allowed enum.
  - Some fields (e.g. `yearlyTarget`) are coerced to numbers or defaulted.
  - There is **no** express-validator, Joi, Zod, or similar for full request validation. String length, email format, and ID format (e.g. CUID) are not consistently enforced.
- **Placement imports:** Endpoints accept `headers` and `rows` in the body. The placement controller uses helpers like `sanitizePercent()` and string normalization. Validation is **ad hoc** rather than a single declarative schema.
- **Query and path parameters:** Routes use `req.query.page`, `req.params.id`, `req.query.userId`, etc. These are not always validated (e.g. `id` as a valid CUID, `page` as a positive integer). Invalid values could cause errors or unexpected behavior.

### Conclusion

**Status: Partial.** Some validation exists (required fields, role enum, numeric coercion), but there is no central, consistent validation layer for all inputs.

### Recommendations

- Introduce a **validation library** (e.g. **express-validator**, **Joi**, or **Zod**) and validate **every** request body, query, and path parameter for:
  - **Email:** Valid format and reasonable length.
  - **Password:** Minimum length and complexity if you enforce a policy.
  - **Strings:** Max length to prevent oversized payloads and abuse.
  - **Numbers:** Type and range (e.g. page > 0, yearlyTarget >= 0).
  - **IDs:** Format (e.g. CUID) so invalid IDs are rejected early.
- Return **400 Bad Request** with clear, non-internal error messages when validation fails. Do not leak stack traces or internal field names to clients.
- Apply validation at the route or middleware layer so controllers receive already-validated data.

---

## 7. Session Management Testing

### What was checked

The review examined how the application creates, stores, and invalidates user sessions, and whether sessions expire appropriately.

### Findings

- **Access token:** A JWT is issued on login (`Backend/src/utils/jwt.js`, `signAccessToken`). Expiry is configurable via `JWT_ACCESS_TTL` (default `24h`). The token is stored on the client (e.g. localStorage) and sent as `Authorization: Bearer <token>`.
- **Refresh token:** Stored in the database (`RefreshToken` model) with an expiry (e.g. 30 days from `JWT_REFRESH_TTL_DAYS`). It is sent to the client in an **httpOnly** cookie and used at `POST /api/auth/refresh` to issue a new access token. The server validates the refresh token and checks it against the DB record.
- **Logout:** `POST /api/auth/logout` clears the refresh cookie. The client can clear the access token from storage. The codebase can support revoking refresh tokens (e.g. `isRevoked` on `RefreshToken`); on user deactivation, `users.js` revokes refresh tokens for that user.
- **Session expiry behavior:** When the access token expires, API calls return 401. The frontend (`Frontend/src/api/client.js`) attempts to refresh the access token. If refresh fails, a custom event `auth:session-expired` is dispatched and the user is effectively logged out. So sessions expire when the access token expires (if refresh fails) or when the refresh token expires (e.g. after 30 days).

### Conclusion

**Status: Implemented.** Session management uses JWTs with expiry, refresh tokens in the DB, httpOnly cookie for refresh, and logout/deactivation handling.

### Recommendations

- Consider a **shorter access token TTL** in production (e.g. 15–60 minutes) so stolen access tokens are useful for a limited time. Rely on the refresh flow for UX.
- Ensure **refresh tokens are revoked** on explicit logout (in addition to deactivation), so that a stolen refresh token cannot be used after the user logs out.
- If you store the access token in localStorage, be aware that any XSS could steal it; the recommendations in the XSS section (e.g. memory-only access token) apply if you need stronger guarantees.

---

## 8. File Upload Testing

### What was checked

The codebase was searched for file upload endpoints (e.g. multipart/form-data, file storage, type/size checks).

### Findings

- **No file upload endpoints** were found in the application. Placement data is imported via **JSON** request bodies (`headers` and `rows`) in `POST /api/placements/import/personal` and `POST /api/placements/import/team`. Excel or CSV processing appears to be done client-side or in scripts; the main API does not accept uploaded files.
- References to “upload” in the code (e.g. `uploaderId`, `uploadedById`) are **field names** for who performed an action, not file upload functionality.

### Conclusion

**Status: Not applicable.** The application does not provide file upload functionality.

### Recommendations

- If you **add file upload** in the future:
  - **Restrict file types:** Use an allowlist of extensions and MIME types (e.g. only certain image or document types). Do not trust the client-supplied Content-Type alone; validate content.
  - **Enforce maximum file size** to prevent DoS and storage abuse.
  - **Store files** outside the web root or in object storage (e.g. S3) with **unpredictable filenames** so they cannot be guessed or overwritten.
  - Consider **virus/malware scanning** for uploaded files if policy or compliance requires it.

---

## 9. Access Control Checks

### What was checked

The review verified that users can only access resources they are allowed to (by role or ownership). This includes preventing IDOR (Insecure Direct Object Reference), e.g. changing a URL parameter to access another user’s data.

### Findings

- **Authentication:** Protected routes use the `authenticate` middleware (`Backend/src/middleware/auth.js`), which verifies the JWT and sets `req.user` (id, role). Unauthenticated requests receive 401.
- **Authorization:** The `requireRole(...)` middleware restricts routes by role. **S1_ADMIN** is explicitly given universal access (e.g. can access any resource). Other roles (SUPER_ADMIN, TEAM_LEAD, EMPLOYEE, LIMITED_ACCESS) are restricted to their allowed routes.
- **User resource:** For `PUT /api/users/:id`, the route checks that either the caller is SUPER_ADMIN or the caller’s id equals the target `id`. So users cannot update other users’ profiles unless they are SUPER_ADMIN. List and get user endpoints are scoped by role and (for SUPER_ADMIN) by team/hierarchy in `userController.js`.
- **Dashboard employee view:** For `GET /api/dashboard/employee/:id`, the code checks:
  - If the viewer is the same user (`id === viewerId`), allow.
  - If the viewer is SUPER_ADMIN or S1_ADMIN, allow.
  - If the viewer is TEAM_LEAD, allow only if the target employee is a subordinate (`employee.employeeProfile.managerId === viewerId`).
  - Otherwise (e.g. EMPLOYEE viewing another employee), return 403.
- **Placements and teams:** Placement and team routes use `requireRole` so only allowed roles can call them. Placement endpoints that take `userId` (e.g. get placements by user) are restricted to SUPER_ADMIN and S1_ADMIN.

**Issue identified:**  
The endpoints **GET /api/dashboard/personal-placements** and **GET /api/dashboard/team-placements** accept query parameters `userId` and `leadId` respectively. These are passed to the controller functions `getPersonalPlacementOverview(currentUser, targetUserId)` and `getTeamPlacementOverview(currentUser, targetLeadId)`. The controller **did not** verify that a non-admin user may only request their own data. So an **employee** could call:
- `/api/dashboard/personal-placements?userId=<another-user-id>`
and receive the other user’s personal placement data. Similarly, a team lead could potentially request another lead’s team placements by changing `leadId`. This is an **access control (IDOR) vulnerability**.

### Conclusion

**Status: Mostly correct; one issue.** Role-based access is applied on most routes, and the employee dashboard correctly restricts who can view whom. The personal-placements and team-placements overview endpoints should enforce that only S1_ADMIN and SUPER_ADMIN can request another user’s/lead’s data; for all other roles, `userId` and `leadId` should be ignored and the current user’s id should be used.

### Recommendations

- **Fix the IDOR:** In the dashboard controller, for `getPersonalPlacementOverview` and `getTeamPlacementOverview`, ensure that when the current user is **not** S1_ADMIN or SUPER_ADMIN, the `targetUserId` / `targetLeadId` parameter is **ignored** and the current user’s id is always used. Only S1_ADMIN and SUPER_ADMIN should be allowed to pass a different user/lead id.
- For **any new endpoint** that takes a resource id (user id, team id, placement id, etc.), always enforce on the **server** that the authenticated user is allowed to access that resource (by role or by ownership). Do not rely only on hiding the option in the UI; URLs and API calls can be manipulated.
- Periodically review routes that take ids in path or query and confirm they perform an explicit access check before returning data.

---

## Summary Table

| # | Area                | Status        | Short summary |
|---|---------------------|---------------|----------------|
| 1 | SQL Injection       | Protected     | Prisma only; no raw SQL in app code. |
| 2 | XSS                 | Low risk      | No dangerous HTML; React escaping; httpOnly cookie. |
| 3 | CSRF                | Partial       | CORS + Bearer + sameSite cookie; no CSRF tokens. |
| 4 | Security Headers    | Implemented   | Helmet in use. |
| 5 | HTTPS               | Deploy-dependent | Secure cookie in prod; HTTPS at proxy recommended. |
| 6 | Input Validation    | Partial       | Ad hoc checks; add schema validation. |
| 7 | Session Management  | Implemented   | JWT + refresh, expiry, logout. |
| 8 | File Upload         | N/A           | No file upload in application. |
| 9 | Access Control      | Issue found   | Restrict userId/leadId for non-admins on dashboard placements. |

---

*This report reflects the codebase as of the assessment date. Re-run security checks after major changes or before production releases.*
