# StarWell Call Decks design system

Use only the tokens in `tokens.css`. No one-off values.

## Direction
Calm, professional, Apple-style. White throughout. Solid, readable content; glass only on the layer that floats. Light theme only.
One accent colour. One font family. Line icons, never emoji.

## Tokens
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64.
- **Type:** system font. 12 (captions), 14 (secondary, controls), 16 (body), 20 (script lines, section titles), 28 (page title). Weights 400 and 600. Line height 1.5.
- **Colour:** accent, accent-soft, success, warning, danger, plus eight neutrals. Every text pair passes WCAG AA. Colour never carries meaning alone: it travels with an icon and a word.
- **Radius:** 8 (controls), 12 (panels), 20 (sheets, bars).
- **Shadow:** resting, floating, sheet.
- **Motion:** 150, 200, 300 ms, ease-out. Nothing bounces. Off under `prefers-reduced-motion`.

## Glass
- Only on: the top bar, the call bar, sheet headers and toasts.
- Recipe: translucent fill + `backdrop-filter: blur(20px) saturate(180%)` + a 1px light inner edge + soft shadow.
- Never on cards, rows, forms or text blocks. Never glass on glass.
- Falls back to a solid surface when `backdrop-filter` is missing or the person prefers reduced transparency.

## Which control when
- **Button:** do something now. One filled (primary) button per view.
- **Link:** go somewhere.
- **Segmented control:** switch between 2 to 4 views of the same content.
- **Tabs:** peer sections of one panel.
- **Radio tiles:** pick exactly one of up to 6 options you should compare.
- **Select:** pick one of 7 or more.
- **Disclosure:** optional detail.
- **Badge:** state only, never clickable.

## Rules we hold the product to
- A dead dial is logged in one tap and opens the next shop.
- A real conversation is logged in five inputs or fewer.
- Nothing typed is lost: every change saves as you go.
- Back always returns to where you were, at the same scroll position.
- The line to say is the first thing on a call screen.
- Every screen has empty, loading, error and success states, visible keyboard focus, and 44px targets.
