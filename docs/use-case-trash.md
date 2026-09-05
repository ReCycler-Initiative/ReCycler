# Use case trash, restore, and purge

Deleted use cases are soft-deleted first. The row stays in `recycler.use_cases` with `deleted_at` set, and the admin UI hides it from the active use case list.

## Restore

- Admin UI: open the organization trash at `/admin/organizations/{organizationId}/use_cases/trash`
- API: `POST /api/organizations/{organizationId}/use_cases/{useCaseId}/restore`
- Result: `deleted_at` is cleared and the use case becomes active again

## Permanent purge after retention

The app provides a maintenance endpoint that permanently removes soft-deleted use cases older than the retention window.

- Endpoint: `POST /api/internal/maintenance/purge-deleted-use-cases`
- Header: `x-maintenance-api-key: <MAINTENANCE_API_KEY>`
- Env vars:
  - `MAINTENANCE_API_KEY` required
  - `USE_CASE_TRASH_RETENTION_DAYS` optional, default `30`

Example:

```bash
curl -X POST http://localhost:3000/api/internal/maintenance/purge-deleted-use-cases \
  -H "x-maintenance-api-key: $MAINTENANCE_API_KEY"
```

The endpoint deletes eligible rows from `recycler.use_cases`. Related child data is expected to follow existing database foreign-key cascade rules.

## Scheduling

This repository does not include a built-in cron worker. Run the maintenance endpoint from your platform scheduler, for example:

- Vercel Cron or GitHub Actions for hosted deployments
- A server cron job that calls the endpoint once per day
- A container scheduler in your runtime platform