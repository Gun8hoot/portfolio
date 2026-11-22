# Gun8hoot Portfolio — Project Summary

A personal portfolio for Nathan "Gun8hoot" Clavel, a cybersecurity-focused student at
42 Le Havre, styled to look like a terminal and a Markdown document at once.

## Overview

| | |
|---|---|
| **Live site** | `clavel.sh` (served at `gun8hoot.me`) |
| **Frontend** | React + TypeScript, served by Bun (`Bun.serve`, no separate bundler) |
| **Styling** | Plain CSS, dark Kanagawa-inspired palette, Monaspace Argon fonts |
| **Language** | French (default) and English, toggled and remembered |
| **Backend** | Express API that relays contact-form messages to a Matrix room |
| **Infra** | Docker Compose: NGINX, an API gateway, the API, and the frontend, behind Cloudflare |

## Frontend

### Visual theme
- Section titles render as `## heading`, lists as `- item`, links as a highlighted
  terminal line — the look is "terminal meets Markdown document."
- Palette: dark background (`#1C1C1C`), Kanagawa-style reds/greens/yellows/blues/purples
  as CSS variables, with `--accent` (bold blue) driving the whole site's highlight color.
- Font: Monaspace Argon (Light/Medium/SemiBold/SemiWideBold/Bold), loaded locally via
  `@font-face` and preloaded before the page appears so text doesn't reflow once it loads.

### Intro sequence
- A power-on screen (`PreBoot.tsx`) → a fake kernel boot log (`Boot.tsx`) → a staggered,
  GPU-cheap screen-tear transition → the page itself, with the name falling in first and
  every other line falling in after it.
- An "intro ON/OFF" switch (top-left, `AnimToggle.tsx`) skips all of this; the choice is
  remembered, and `prefers-reduced-motion` is respected by default.

### Page sections (`Portfolio.tsx`)
1. **whoami** — name, a short personal story (computers from a young age, discovering
   OSINT through Bellingcat, then pentesting, then low-level dev), and a closing
   internship/apprenticeship search line.
2. **links** — LinkedIn, GitHub, Root-Me, HackTheBox, TryHackMe, CryptoHack, and an
   Email entry that copies the address to the clipboard with a toast confirmation
   (`CopyToast.tsx`) instead of opening a mail client.
3. **skills** — grouped rows (languages, reversing, systems, services, security, network),
   each item a hoverable glossary term.
4. **projects** — 11 projects, each opening a `ProjectWindow` with a plain-language
   description, a detailed "what I learned," stack, state/status, repo link, and an
   enlargeable picture (`PictureWindow.tsx`).
5. **hackathons** — same window mechanism as projects, with extra metadata (organizer,
   date, duration, location); currently one entry (42 × DINUM, "PassOn").
6. **contact** — Name / Email / Message form, Cloudflare Turnstile-protected
   (`ContactForm.tsx`), each field showing its character limit next to its label.

### Interactive features
- **Glossary** (`Term.tsx`, `Glossary.tsx`): ~100 technical terms, acronyms, platforms
  and names get a hover/tap/focus definition card with a source link.
- **Places** (`Place.tsx`, `Places.ts`): location names (Le Havre, Paris, Isle of Oléron)
  open a small interactive Leaflet/OpenStreetMap window instead of a text card.
- **First-visit tutorial** (`Tutorial.tsx`): a five-step guided tour (language, intro
  switch, technical words, projects, contact form), shown once.
- Keyboard support (focus traps, Escape to close, `:focus-visible`) and
  `prefers-reduced-motion` handling run throughout, not just on the intro.

## File layout

```
components/
  Portfolio.tsx      Main page: content data, layout, state
  Boot.tsx           Kernel-log boot sequence + screen-tear animation
  PreBoot.tsx        Power-on screen
  Tutorial.tsx        First-visit guided tour
  AnimToggle.tsx      Intro-animation ON/OFF switch + its hook
  Lang.tsx            EN/FR switch + its hook
  Term.tsx            Glossary tooltip system
  Glossary.tsx        Glossary entry data (~100 terms)
  Place.tsx           Map tooltip system (Leaflet)
  Places.ts           Map entry data (coordinates, zoom, labels)
  ProjectWindow.tsx   Modal shown for a project or hackathon
  PictureWindow.tsx   Enlarged picture modal (opened from ProjectWindow)
  ContactForm.tsx     Contact form + Turnstile integration
  CopyToast.tsx       "Copied to clipboard" toast with a draining progress bar
frontend.tsx          React entry point (font preloading, boot/page state machine)
index.html            HTML shell
index.css             All styling (palette, fonts, layout, animations)
index.ts              Bun server (routes, error pages)
api.js                Contact-form API (Express + Matrix)
gateway.js             API gateway (Express + http-proxy-middleware)
```

## Known loose ends

- Several project pictures are still placeholder string paths (e.g. `./assets/logos/*.svg`)
  rather than real imports — they currently 404 and fall back to a text-only layout.
- The PassOn hackathon has no picture asset yet.
- The real Cloudflare Turnstile site key / secret key still need to be set
  (`BUN_PUBLIC_TURNSTILE_SITE_KEY` on the frontend, a Docker secret for the API).
