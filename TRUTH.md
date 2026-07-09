# TRUTH — Profile Jedi Constitution

Final authority for this repository. When docs conflict, **this file wins**, then `Hermes-Profile-Switcher.md`, then `README.md`.

## Identity

- **Name:** Profile Jedi (Hermes Profile Switcher)
- **Purpose:** Local desktop control panel for Hermes AI-agent profiles
- **Repo:** https://github.com/jonbeatz/profile-jedi
- **Runs at:** `http://127.0.0.1:7780` only — never bind to `0.0.0.0` in production tooling

## Non-negotiables

1. **Local-first & safe** — PowerShell via `execFile` (no shell-string injection). Destructive actions use confirm dialogs. Dry-Run mode must remain available.
2. **Slug is immutable** — Profile `slug` is the identity key (CLI home, mem0 collection). UI edits display name, description, path, and `boardId` only.
3. **Tray survives app** — Lifecycle restart goes through the tray supervisor on port **7781**, not the app on **7780**. Footer **Start Tray** uses server-side `Start-Process` + polling (never rely on browser → 7781 CORS alone).
4. **No secrets in git** — API keys and `.env*` stay local. LiteLLM/ngrok keys live in `D:\Hermes\projects\_core-scripts\deepseek-api\.env.local`.
5. **Backend is external** — `Switch-Hermes-Profile.ps1` and sibling scripts live under `D:\Hermes\projects\_core-scripts\`. This repo is the UI + API layer.
6. **DRAVEN footer** — Fleet health capsules + Profile Jedi lifecycle; not a separate Google API control surface in the footer.

## Source-of-truth order (agents)

1. `TRUTH.md` (this file)
2. `Hermes-Profile-Switcher.md`
3. `AGENTS.md`
4. `specs/` for planned work
5. `README.md` for onboarding

## Version

Current release: **v1.1.0** (`package.json` + `lib/settings.ts → APP_VERSION`)

## Stack (frozen for v1)

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/Base UI · Motion · SWR · sonner · Windows PowerShell 5.1+
