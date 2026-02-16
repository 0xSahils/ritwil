---
name: premium-ui-motion-design
description: Designs modern, premium interfaces with meaningful animations and interactions at Dribbble/Apple/Stripe quality. Use when designing UI, adding animations, redesigning interfaces, improving UX flows, or when the user asks for visual polish, micro-interactions, or premium product design.
---

# Premium UI/UX + Motion Design

Apply this skill when designing interfaces, adding animations, or redesigning existing UIs. Aim for Dribbble + Apple + Stripe level aesthetics with strong usability and performance.

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Spacing** | 8px system (8, 16, 24, 32, 48, 64) |
| **Typography** | Clear hierarchy: display → heading → body → caption |
| **Color** | Minimal palette; 1–2 primary accents, neutrals, subtle backgrounds |
| **Depth** | Soft shadows, subtle gradients when appropriate |
| **Clutter** | Avoid; generous whitespace over dense layouts |

---

## Animations

**Library**: Use Framer Motion for React projects.

**Types**:
- Subtle fade, slide, scale on enter
- Animate on scroll (intersection observer)
- Hover interactions on interactive elements
- Spring physics for natural feel (`type: "spring", stiffness: 300, damping: 30`)

**Timing**:
- Default: under 400ms for micro-interactions
- Longer only when intentional (e.g. page transitions)

**Example patterns**:

```tsx
// Fade + slide on mount
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// Spring hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

---

## Creative Thinking

**Before coding**:
- Identify weak visual hierarchy in current UI
- Propose improved structure and flow
- Replace generic patterns (boring cards, tables) with modern components

**Suggest**:
- Layout improvements
- Better UX flows
- Stronger visual hierarchy
- Page/section transitions
- Micro-interactions on buttons, inputs, toggles

**Avoid**: Generic Bootstrap/Tailwind-default look. Aim for distinctive, premium feel.

---

## Redesign Workflow

1. **Analyze**: State what is weak in the current UI (clutter, poor hierarchy, bland visuals).
2. **Propose**: Describe better structure, layout, and flow.
3. **Implement**: Provide clean, production-ready code.

---

## Performance Rules

- Avoid heavy re-renders; use `memo`, `useMemo`, `useCallback` when animating.
- Lazy load heavy animations or use `layoutId` sparingly.
- Do not harm performance for visuals; prefer CSS transforms over layout thrashing.

---

## Output Requirements

Always deliver:
- Visually attractive
- Responsive (mobile-first when appropriate)
- Modern SaaS-level design
- Premium, polished feel
