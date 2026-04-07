# Upload Instructions

Default archive:

- `slotcity-deployment-bundle.zip`

Inside the bundle:

- `slotcity-platform-monorepo.zip` — full repository snapshot for Git-based deployment
- `slotcity-web-vercel.zip` — frontend package for Vercel
- `slotcity-render-backend.zip` — Directus and events package for Render
- `slotcity-cloudflare-worker.zip` — Cloudflare Worker package

Quick handoff order:

1. Upload `slotcity-web-vercel.zip` to the frontend team or connect it to Vercel.
2. Upload `slotcity-render-backend.zip` to the backend team or use it for Render services.
3. Upload `slotcity-cloudflare-worker.zip` for the public edge worker.
4. Keep `slotcity-platform-monorepo.zip` as the full backup and source-of-truth package.

Integrity check:

```bash
cd /Volumes/Work/Casino/release
LC_ALL=C LANG=C shasum -a 256 -c CHECKSUMS.sha256
```
