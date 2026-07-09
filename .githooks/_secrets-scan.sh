#!/bin/sh
# Shared secret-scan helpers for Hermes git hooks.
# Sourced by pre-commit and pre-push.

# High-signal secret patterns (added lines only).
SECRET_PATTERNS='ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|re_[A-Za-z0-9]{20,}|fc-[a-f0-9]{32}|bb_live_[A-Za-z0-9]+|tvly-[A-Za-z0-9-]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY-----|AIza[0-9A-Za-z_-]{20,}|ck_[A-Za-z0-9]{10,}'

# Safe placeholders — skip lines that are clearly templates/docs examples.
PLACEHOLDER_SKIP='REPLACE_WITH|replace-with|your_.*_here|your-.*-key|_here$|example$|placeholder'

# Never commit these path fragments (case-insensitive).
FORBIDDEN_PATHS='Personal-Secrets-Vault|MASTER-SECRETS-INVENTORY\.local|(^|/)\.env\.local$|(^|/)\.env$'

scan_diff_for_secrets() {
  diff="$1"
  label="$2"
  hits=$(printf '%s\n' "$diff" | grep -nE '^\+' | grep -vE '^\+\+\+' | grep -vEi "$PLACEHOLDER_SKIP" | grep -E "$SECRET_PATTERNS" || true)
  if [ -n "$hits" ]; then
    echo "BLOCKED $label: possible secret(s):"
    printf '%s\n' "$hits" | sed 's/^/  /'
    return 1
  fi
  return 0
}

scan_names_forbidden() {
  names="$1"
  label="$2"
  bad=$(printf '%s\n' "$names" | grep -iE "$FORBIDDEN_PATHS" | grep -vE '\.example$|\.template$|\.sample$' || true)
  if [ -n "$bad" ]; then
    echo "BLOCKED $label: forbidden file(s):"
    printf '%s\n' "$bad" | sed 's/^/  - /'
    return 1
  fi
  return 0
}

scan_env_files() {
  names="$1"
  label="$2"
  env_hits=$(printf '%s\n' "$names" | grep -E '(^|/)\.env(\.[a-zA-Z0-9_-]+)?$' | grep -vE '\.example$|\.sample$|\.template$' || true)
  if [ -n "$env_hits" ]; then
    echo "BLOCKED $label: env file(s) must stay gitignored:"
    printf '%s\n' "$env_hits" | sed 's/^/  - /'
    return 1
  fi
  return 0
}

fail_hook() {
  echo ""
  echo "Secrets belong in .env.local (gitignored), not in git."
  echo "Manual scan: npm run git:secrets-scan"
  echo "Bypass only if confirmed false positive: git commit|push --no-verify"
  exit 1
}
