# [Store name] — car [parts/accessories/gear] e-commerce

## Stack
- Frontend: React + Tailwind CSS (swap if different)
- Backend: [briefly describe your existing API — key endpoints, auth, main data models]
- Wire the UI to the real API. Never fabricate mock data once an endpoint exists — ask if a response shape is unclear.

## Design system — bold & modern automotive (apply to every page)

**Color**
- Two base surfaces only: near-black (#0B0B0C) for hero/feature sections, white (#FFFFFF) for product/content grids — alternate as full-bleed blocks
- One accent, used only for CTAs and key highlights: electric red #E10600 (swap for your brand color)
- Text: white on dark sections, near-black (#111) on light sections — no mid-gray body copy

**Typography**
- Headlines: bold weight, tight tracking, large scale (48–96px desktop / 32–44px mobile), geometric sans (Inter, General Sans, or system default)
- Body: same family, regular weight, 1.6 line-height
- Never: rounded/friendly fonts (Poppins, Nunito), default serif

**Layout & motion**
- Full-bleed hero: large product image or looping video, never a small centered graphic
- Asymmetric grids over centered boxy cards
- Product cards: image fills ~80% of the card; hover = scale(1.03) + shadow lift
- Scroll-triggered fade+slide reveals on section entry (~400ms ease-out)
- Nav compresses and stays sticky on scroll

## Never do this
- Default gray-on-gray palette with no accent color
- Bootstrap-style centered white cards with soft drop shadows as the default look
- Emoji used as icons
- Placeholder copy like "Welcome to our store"

## Workflow
- Use Planning Mode before building any new page — propose the approach first
- After building, use the browser subagent to screenshot the result and check it against this file before reporting the task complete
- One page or section per task, not the whole site at once