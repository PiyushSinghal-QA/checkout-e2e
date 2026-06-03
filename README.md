# checkout-e2e

Black-box **Playwright** test suite for **checkout-service**. It knows nothing about the app's
internals — it boots the app and exercises it the way a real client would: over the HTTP API and
through the storefront UI. This is the suite QA owns and that **autofix-agent** uses as its
source of truth for "is the service correct?"

## Run it

```bash
npm install
npx playwright install chromium     # one-time
npm test
```

By default it auto-starts the app from `../checkout-service` (override with `APP_PATH`) and runs
against `http://localhost:3000` (override with `BASE_URL`, e.g. point at a deployed instance).

```bash
BASE_URL=https://staging.example.com npm test   # run against a deployed app (no local boot)
```

## What it checks

`tests/api.spec.ts` — black-box API assertions, one guarding each seeded defect:

| Test | Catches |
|------|---------|
| returns 404 when the cart does not exist | `bug/null-check` |
| returns a human-readable formattedTotal | `bug/typo` |
| applies 20% VAT to the taxable total | `bug/wrong-import` |
| rejects checkout with an empty customer name (400) | `bug/missing-validation` |
| returns 400 when the payment is declined | `bug/unhandled-error` |

`tests/ui.spec.ts` — drives the storefront: browse → add to cart → checkout → confirmation.

## CI

`.github/workflows/e2e.yml` checks out **both** this repo and `checkout-service`, boots the app,
and runs the full suite — so the QA suite gates the app on every change.

## Related repos

- **checkout-service** — the app under test.
- **autofix-agent** — runs this suite to detect failures, then fixes the app and opens a PR.
