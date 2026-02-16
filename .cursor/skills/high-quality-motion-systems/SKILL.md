---
name: high-quality-motion-systems
description: Creates high-quality motion systems with staggered animations, entrance transitions, count-up numbers, hover glow, animated gradients, floating elements, and parallax. Use when adding animations, building motion design, or when the user asks for polished transitions, micro-interactions, or Apple/Linear/Vercel/Stripe-style motion.
---

# High-Quality Motion Systems

Create motion that feels intentional, enhances UX, and never distracts. Aim for Apple, Linear, Vercel, Stripe quality—subtle but impressive.

---

## Motion Techniques

| Technique | When to Use | Notes |
|-----------|-------------|-------|
| **Staggered animations** | Lists, grids, cards on load | 50–100ms delay between items |
| **Smooth entrance transitions** | Page/section load | Fade + slight Y, ~300ms |
| **Animated numbers (count up)** | Stats, KPIs, metrics | Use `useInView` + requestAnimationFrame |
| **Hover glow effects** | Buttons, cards, CTAs | Subtle box-shadow or pseudo-element blur |
| **Animated gradients** | Hero backgrounds, accents | Slow, continuous; avoid seizure risk |
| **Floating elements** | Illustrations, icons | Gentle Y oscillation, ~3–5s cycle |
| **Parallax** | Hero sections, scroll stories | Use sparingly; keep subtle |

---

## Principles

- **Intentional**: Every animation has a purpose; no motion for motion's sake.
- **Enhance UX**: Clarify hierarchy, signal state, guide attention.
- **Don't distract**: Subtle > flashy; avoid competing animations.
- **Subtle but impressive**: Feels premium without drawing attention to itself.

---

## Implementation Notes

**Stagger (Framer Motion):**

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08, duration: 0.35 }}
  />
))}
```

**Count-up number:**

```tsx
// Use intersection observer; animate from 0 to target on enter viewport
// RequestAnimationFrame or Framer Motion's useSpring for smooth interpolation
```

**Hover glow:**

```css
.card:hover { box-shadow: 0 0 40px rgba(primary, 0.15); }
/* Or radial gradient pseudo-element with blur */
```

**Animated gradient:**

```css
background: linear-gradient(90deg, #a, #b, #c, #a);
background-size: 200% 100%;
animation: gradient-shift 8s ease infinite;
```

**Floating:**

```tsx
<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## Parallax

Use only when it adds meaning (e.g. depth in hero). Keep movement ratio low (0.1–0.3). Prefer CSS `transform` for performance.
