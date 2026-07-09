# GitHub Setup — Profile Jedi

**Repo:** https://github.com/jonbeatz/profile-jedi  
**Local path:** `D:\Hermes\apps\profile-jedi`

---

## Branch model

| Branch | Purpose |
|--------|---------|
| **`main`** | Stable releases (current) |
| **`profile-jedi-v2`** | Optional milestone branch (future) |

Profile Jedi ships from **`main`** today — no product website branch needed.

---

## README template compliance

| Item | Status |
|------|--------|
| Badges (Next.js, React, TS, license) | Yes |
| Status table | Yes |
| Screenshots in `docs/screenshots/` | Yes |
| Link to master doc (`Hermes-Profile-Switcher.md`) | Yes |
| TRUTH banner via README → TRUTH.md | Yes |
| `GITHUB-SETUP.md` | This file |
| GitHub Pages | Not used (local `:7780` only) |

Style reference: `.cursor/skills/GitHub-README-Template/SKILL.md` (JonBeatz hub)

---

## Topics (About)

Suggested: `hermes`, `profile-switcher`, `nextjs`, `powershell`, `local-first`

```powershell
@'
{"names":["hermes","profile-switcher","nextjs","powershell","local-first"]}
'@ | gh api -X PUT repos/jonbeatz/profile-jedi/topics `
  -H "Accept: application/vnd.github+json" --input -
```

---

## Release (manual until scripts added)

```powershell
cd D:\Hermes\apps\profile-jedi
# Align version in package.json, lib/settings.ts APP_VERSION, CHANGELOG.md
git add -A
git commit -m "release: v1.1.0"
git tag v1.1.0
git push origin main
git push origin v1.1.0
gh release create v1.1.0 --title "Profile Jedi v1.1.0" --notes-file CHANGELOG.md
```

**TODO:** Add `npm run version:sync` + `npm run release` like Next-Flick (copy scripts from hub bootstrap).

---

## Backup

```powershell
npm run backup:quick      # G:\Hermes_Project_BackUpz\apps\profile-jedi\
npm run backup:quick:full
```

Uses shared `backup-hermes-app.mjs` — includes repo minus `node_modules` / `.next`.

---

## Related fleet repos

| Repo | Role |
|------|------|
| [hermes-core-scripts](https://github.com/jonbeatz/hermes-core-scripts) | Switch-Hermes-Profile.ps1, Align-Hermes-Profile.ps1 |
| [hermes-taskboard](https://github.com/jonbeatz/hermes-taskboard) | TaskBoardAI fork (create — see FLEET-GITHUB-AUDIT.md) |

---

*2026-07-08*
