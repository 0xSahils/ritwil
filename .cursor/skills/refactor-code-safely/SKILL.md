---
name: refactor-code-safely
description: Refactors code without changing behavior. Improves readability, splits logic into small functions, and applies clear naming. Use when the user asks to refactor, clean up code, improve readability, extract functions, or rename for clarity.
---

# Refactor Code Safely

Apply this skill when refactoring any code. **Behavior must stay identical**; only structure and clarity may change.

## Golden Rules

1. **Keep logic the same** — No new features, no bug fixes, no algorithm changes. Inputs and outputs must behave exactly as before.
2. **Improve readability** — Clear structure, consistent style, obvious control flow.
3. **Split into small functions** — One responsibility per function; extract blocks that do a single thing.
4. **Add proper naming** — Names describe purpose and intent; avoid abbreviations unless standard (e.g. `id`, `url`).
5. **No behavior change** — Run same tests or manual checks before/after; diff should show structure/names only, not logic.

## Workflow

1. **Understand first** — Read the code and identify what it does. Do not change logic.
2. **Identify extraction points** — Look for:
   - Blocks that compute one value or perform one side effect
   - Repeated or similar logic (extract once, reuse)
   - Long conditionals or loops that can be named (function or variable)
3. **Extract and rename** — Extract small functions; name variables and functions by purpose.
4. **Preserve behavior** — After each change, ensure behavior is unchanged (tests, manual run, or reasoning over inputs/outputs).

## Naming Guidelines

- **Functions**: Verb or verb phrase — `getUserById`, `validateEmail`, `formatDisplayDate`.
- **Variables**: Noun or noun phrase — `isValid`, `userCount`, `sortedItems`.
- **Booleans**: Prefer `is`, `has`, `can`, `should` — `isActive`, `hasPermission`, `canEdit`.
- **Constants**: Same as variables; UPPER_SNAKE only when truly constant (e.g. config keys).

## What Not to Do

- Do not change algorithms, data structures, or control flow for “efficiency” unless asked.
- Do not add new error handling, validation, or features.
- Do not merge or remove functions that are part of the current behavior.
- Do not rename public APIs, exports, or props if that would break callers (unless the refactor scope includes call sites).

## Checklist Before Finishing

- [ ] Logic and behavior unchanged (same inputs → same outputs)
- [ ] Long blocks split into small, single-purpose functions
- [ ] Names clearly describe purpose
- [ ] Readability improved (structure, spacing, clarity)
- [ ] No new behavior and no removed behavior
