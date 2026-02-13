---
name: design-scalable-backend
description: Guides design of scalable backends with clean folder structure, proper DB relations, optimized queries, separation of concerns, and maintainable architecture. Use when designing a new backend, refactoring backend structure, adding new domains, or when the user asks for scalable backend design, folder structure, DB schema, or API architecture.
---

# Design Scalable Backend

Apply this skill when designing or evolving a backend. Focus on structure, data model, query efficiency, and long-term maintainability.

## 1. Clean Folder Structure

**Default layout (MVC / layered):**

```
src/
├── config/           # DB, env, app config
├── controllers/      # HTTP handlers; thin — validate, call service, respond
├── services/         # Business logic; orchestration
├── repositories/     # Data access; single responsibility per entity/aggregate
├── models/           # Domain entities / DB schemas
├── routes/           # Route definitions only; wire to controllers
├── middleware/       # Auth, logging, error handling
└── utils/            # Pure helpers; no business logic
```

**Rules:**

- One **controller** per resource or feature area; delegates to **services**.
- One **repository** per aggregate/entity; no business rules, only CRUD and query building.
- **Services** contain business logic and call one or more repositories.
- **Routes** only map HTTP to controller methods; no logic.
- Keep **utils** small and stateless; no DB or external calls.

**Checklist:**

- [ ] Controllers are thin (validate → service → respond)
- [ ] No business logic in controllers or routes
- [ ] Repositories only handle data access
- [ ] Config and env live in one place

---

## 2. Proper DB Relations

**Design principles:**

- **Normalize** to avoid duplication; denormalize only for proven read hotspots (with a comment).
- **Foreign keys** for all references; enforce referential integrity.
- **Indexes** on columns used in `WHERE`, `JOIN`, `ORDER BY`, and unique constraints.
- **Naming**: `snake_case`; tables plural (`users`, `orders`); junction tables descriptive (`user_roles`, `order_items`).

**Relation patterns:**

| Relation   | Implementation                    | Example                    |
|-----------|------------------------------------|----------------------------|
| One-to-many | FK on the "many" side             | `orders.user_id` → `users` |
| Many-to-many | Junction table + two FKs          | `user_roles(user_id, role_id)` |
| One-to-one | FK on one side, unique constraint | `profiles.user_id` UNIQUE  |

**Avoid:**

- Storing JSON/arrays for queryable relational data; use proper tables and FKs.
- Missing indexes on FK and frequently filtered/sorted columns.
- Circular or ambiguous relationships; document ownership (who "owns" the FK).

**Checklist:**

- [ ] Every relation has a clear FK (and index where used in queries)
- [ ] Junction tables for many-to-many
- [ ] No critical query columns without indexes
- [ ] Naming is consistent (snake_case, plural tables)

---

## 3. Optimized Queries

**Principles:**

- **Minimize round-trips**: Prefer one well-shaped query over N+1; use JOINs, `SELECT` only needed columns, and batching.
- **Pagination**: Always paginate list endpoints (limit/offset or cursor); never unbounded `SELECT *`.
- **Avoid**: `SELECT *` in production; redundant JOINs; logic in DB that belongs in app code (unless a documented optimization).

**Patterns:**

- **N+1 fix**: Use JOINs, `WHERE id IN (...)` with a single query, or ORM eager loading (e.g. `include`, `with`).
- **Count/list**: Separate count query only when needed; otherwise use window functions or a single query with limit.
- **Updates**: Update only changed columns; use conditional updates (`WHERE` + expected version/state) for consistency.

**Repository layer:**

- Keep raw SQL or query builders in **repositories**; services receive domain objects or DTOs.
- Parameterize all user input; never concatenate into SQL.
- Log slow queries and add indexes for hot paths.

**Checklist:**

- [ ] No N+1 in list/detail endpoints
- [ ] List endpoints paginated
- [ ] Only required columns selected
- [ ] All dynamic values parameterized
- [ ] Hot paths have supporting indexes

---

## 4. Separation of Concerns

**Layers and responsibilities:**

| Layer        | Responsibility                    | Does not do                          |
|-------------|------------------------------------|--------------------------------------|
| **Route**   | Map URL/method to controller      | Validation, logic, DB access         |
| **Controller** | Parse input, validate, call service, format response | Business rules, SQL, complex logic |
| **Service** | Business logic, orchestration     | HTTP, raw SQL, framing responses     |
| **Repository** | CRUD, queries, transactions       | Business rules, validation           |
| **Model**   | Shape of data, schema             | Logic, access patterns               |

**Rules:**

- **Controllers**: Validate request (body, params, query); map errors to HTTP status; no business decisions.
- **Services**: Implement use cases; call repositories; handle transactions when a use case spans multiple writes.
- **Repositories**: Abstract DB; return domain objects or simple DTOs; no business rules.
- **Shared logic** (validation, formatting) lives in services or dedicated helpers, not duplicated in controllers.

**Checklist:**

- [ ] Each layer has a single, clear responsibility
- [ ] No business logic in controllers or repositories
- [ ] No SQL or HTTP details in services (beyond what’s needed for orchestration)
- [ ] Transactions live in service layer when spanning multiple repos

---

## 5. Maintainable Architecture

**Consistency:**

- Same patterns for similar features (e.g. all resources have controller → service → repository).
- Unified error handling (middleware or central handler); consistent error response shape.
- One place for validation (e.g. shared schemas or middleware); reuse across endpoints.

**Dependencies:**

- Dependencies point **inward**: routes → controllers → services → repositories → DB.
- No circular dependencies; if two domains depend on each other, extract a shared service or domain.
- Config and infra (DB client, queues) injected or centralized; no hardcoding.

**Evolution:**

- New features add new files (new controller/service/repository) rather than overloading existing ones.
- Deprecate instead of breaking: old endpoints can coexist while new ones are adopted.
- Document public APIs and key domain concepts; keep README or ADRs up to date.

**Checklist:**

- [ ] Dependency direction is consistent (inward)
- [ ] No circular dependencies
- [ ] Error handling and validation are centralized and consistent
- [ ] New features follow existing patterns
- [ ] Config and env are not hardcoded

---

## Quick Reference

**When adding a new feature:**

1. **Model**: Add or extend entity/schema; define relations and indexes.
2. **Repository**: Add data access methods; keep queries in this layer.
3. **Service**: Add use case logic; call repository/repositories; handle transaction if needed.
4. **Controller**: Add handler; validate input; call service; return response.
5. **Route**: Wire URL/method to controller.

**When reviewing backend code:**

- [ ] Folder structure matches the intended layering
- [ ] DB relations and indexes support current (and near-term) queries
- [ ] No N+1; list endpoints paginated; queries parameterized
- [ ] Responsibilities are clearly separated across layers
- [ ] Dependencies flow inward; no circular refs
