# ADR 004: Implement Red Broadcast Design System with Gemini Banana Branding

## Context
The user requested applying the **Red Broadcast** design system specifications (`design.md`) and incorporating **Gemini Banana** as the project logo, branding, and visual identity.

## Decision
- Implemented Red Broadcast design tokens:
  - Signature Broadcast Red accent `#FF0000` (hover `#CC0000`) used selectively for critical actions, live indicators, and overrun alarms.
  - Neutral dark `#0F0F0F` for primary text and subscribe/primary buttons.
  - Surface `#F2F2F2` for inputs, cards, and sidebar active items.
  - Typography: Google Font `Roboto` and `Roboto Mono`.
  - Component models: 56px sticky top bar, 44px central search bar, collapsible left rail (72px / 240px), 9999px pill buttons and chips.
- Incorporated Gemini Banana vector assets (`/banana-logo.svg` and `/banana-hero.svg`) across the application, login, registration, and statements.

## Trade-offs
- Provides a recognizable aesthetic that stands out from generic admin dashboards while preserving data density.
