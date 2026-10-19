# @karate/api

Backend NestJS 12 (ESM, vitest, oxlint). Saat ini baru berisi endpoint kesehatan
`GET /api/health` sebagai kerangka. Modul domain ditambahkan per fitur (lihat `docs/requirements.md`
di root).

```bash
pnpm dev:api     # dari root, http://localhost:4000/api/health
pnpm --filter @karate/api check
```

Aturan:

- Import relatif memakai ekstensi `.js` (`./app.module.js`), sesuai `module: nodenext`.
- Env dibaca lewat `loadEnv()` di `src/config/env.ts`, bukan `process.env` langsung.
- Satu modul NestJS per domain: `src/<domain>/<domain>.module.ts`, controller, service, DTO (Zod).
