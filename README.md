# fc-cami — AI-Augmented Birthday Experience

> **Built in 8 hours.** Design → Development → Deployment. End to end.

**[Live Demo](https://fc-cami.netlify.app/)**

![fc-cami screenshot](/public/images/readme/capture_1.png)

---

## What is this?

My sister-in-law Cami turned 18. She's the kind of person who values handmade gifts over bought ones — so instead of ordering something off a shelf, I built her a personalized birthday website.

The catch: I started the day before her birthday.

The result is an interactive birthday experience themed as a retro terminal OS, featuring ASCII art, pixel animations, a working command-line terminal, and hidden Easter eggs — designed, built, and deployed under a real deadline with a hard constraint: it had to be ready and meaningful, not just fast.

---

## The 8-Hour Challenge

The entire project — from blank canvas to live URL — was completed in **8 hours**, starting the evening before her birthday. Here's the breakdown:

| Phase                                | Tool                   | Approx. time |
| ------------------------------------ | ---------------------- | ------------ |
| Visual direction & design            | Google Stitch          | ~2h          |
| Prompt refinement                    | ChatGPT                | ~1h          |
| Component architecture & feature dev | Claude Code + OpenCode | ~4h          |
| Deployment                           | Netlify                | ~15min       |

---

## AI-Augmented Workflow

This project was an intentional experiment in **AI as a force multiplier** — every tool was deliberately chosen and directed, not just prompted blindly. The engineering judgment (architecture, scope, aesthetic decisions) remained human.

### 1. Visual direction with Google Stitch

Iterated on the design using Google Stitch, progressively refining prompts until landing on the retro terminal OS aesthetic. Multiple design variants were explored before committing to a direction.

### 2. Prompt engineering with ChatGPT

Used ChatGPT to sharpen and focus prompts before feeding them to design and code agents — treating prompt quality as a first-class concern rather than an afterthought.

### 3. Scaffold export → local repository

Exported the initial HTML from Stitch into a local repo, then used it as a starting point for a proper component-based architecture with Astro.

### 4. Feature development with Claude Code + OpenCode

Decomposed the site into discrete engineering problems and used **Claude Code** (Anthropic) and **OpenCode** (GPT-based) as pair-programmer agents to:

- Refactor monolithic HTML into scoped Astro components
- Build an interactive terminal with a custom command registry
- Implement pixel art frame-by-frame animations
- Fix mobile UX issues (scroll anchoring, viewport overflow, sticky footer)
- Polish responsive layout across breakpoints

### 5. ASCII art with Figlet

The hero "FELIZ CUMPLE CAMILIN" ASCII art was generated via Figlet, orchestrated through the code agent and embedded with a live glitch effect.

### 6. Pixel art with Nano Banana

All custom pixel art assets — cake animation frames, gift box, croissant — were generated with Nano Banana and integrated as static assets.

### 7. Image optimization with a custom CLI tool

Used a custom image processing tool built in a separate personal project to crop and scale assets to the exact dimensions needed. Reusing tooling across projects rather than reaching for a one-off solution.

### 8. Background removal with remove.bg

The pixel art assets (cake frames, gift box) were originally generated with white backgrounds. Used remove.bg to strip them and export transparent PNGs, which was essential for the layered animations to work correctly.

---

## Tech Stack

| Tool                        | Why                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Astro**                   | It's a landing page. No React overhead needed — Astro ships zero JS by default and only hydrates where explicitly required. Right tool, right job. |
| **TypeScript + Vanilla JS** | No state management, no framework complexity. All interactivity is ~300 lines of typed, modular TS split into component-scoped client files.       |
| **CSS custom properties**   | Design token system for colors, spacing, and typography. Consistent theming without a CSS-in-JS dependency.                                        |
| **Netlify**                 | Zero-config deployment. Push to main → live URL with SSL in under 5 minutes. No DevOps overhead for a static site.                                 |

---

## Features

- **Interactive terminal** — custom command registry with `help`, `clear`, `gift`, `confetti`, and `shutdown`
- **ASCII hero** with a live character glitch effect (randomized, frame-rate controlled)
- **Gift modal** — pixel art gift box with shake animation, confetti burst, and croissant reveal
- **Shutdown sequence** — 6-frame sprite animation of candles being blown out
- **Cake card** — interactive `EAT_CAKE()` button with crumb particle physics
- **Mobile-first** — resolved viewport overflow, scroll anchoring on input focus, and sticky footer issues on mobile

---

## Challenges Worth Mentioning

- **Mobile terminal scroll bug** — typing in the textarea was repositioning the entire page scroll on each keystroke. Fixed by replacing imperative `style.height` resizing with an invisible mirror element that defines the height declaratively, plus `preventScroll` on focus.
- **ASCII art centering on mobile** — the figlet output used `\n` characters that were rendering as literal text. Solved by parsing the string and mapping each line into separate DOM elements, then centering via flexbox.
- **Modal focus management** — closing the gift modal from the terminal command was auto-scrolling to the footer because `helpTrigger.focus()` had no `preventScroll` option. One-line fix with real UX impact.

---

## What This Demonstrates

- **AI workflow fluency** — orchestrating multiple AI tools in a coherent pipeline (design → prompts → code agents → assets), not just using a single chatbot
- **Architectural judgment** — choosing Astro over React, Netlify over complex CI/CD, vanilla TS over state libraries because the problem didn't need more
- **Speed without chaos** — production-quality, mobile-responsive code shipped in 8 hours means disciplined scope management and fast decision-making
- **Debugging under constraints** — real bugs were found and fixed with root-cause analysis, not workarounds

---

## What I'd Build With More Time

- Command history navigation with arrow keys
- Prefers-reduced-motion support for all animations
- A secret unlock command with an additional Easter egg
