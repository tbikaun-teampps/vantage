# Vantage



## Development - Ways of Working

### Technology Stack
- Supabase (PostgreSQL) database + auth.
- Vite/React frontend using Shadcn+Tailwind (typescript)
- Fastify nodejs server (typescript)


### Working with supabase locally.

```bash
npx supabase init
```

Start local server (ensure Docker is installed and running):
```bash
npx supabase start
```

Stop local server:
```bash
npx supabase stop
```


Apply migrations, seed database:
- This must be run whenever you want to reseed from scratch
```bash
npx supabase db reset
```

```bash
npx supabase status
```

Generate a seed from a local database:
```bash
npx supabase db dump -f './supabase/seed.sql' --local --data-only
```

Changes to the database are all done via migrations, including RLS policies, etc.




### Branches
There are three main branches
- `main` (production)
  - Has branch protection rules
- `staging` (pre-production)
  - Has branch protection rules
- `dev` (active development integration, local)

Other branches use semantic naming conventions e.g. `feature/*`, `chore/*`, `refactor/*`, etc., or auto-generated branch names from issues, e.g. `1-...`.

Hygiene - after a branch is merged in via PR, it should be deleted from your local and the remote.