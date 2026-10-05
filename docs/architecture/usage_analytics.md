# Usage Analytics

## Purpose and scope

The use-case administration page at `/admin/organizations/[id]/use_cases/[useCaseId]/usage` reports how visitors use the map, its configured filters, and the AI chat. This is separate from the site-wide Vercel Analytics integration: these metrics are stored in the ReCycler PostgreSQL database and scoped to a use case.

The dashboard supports 7-, 30-, and 90-day periods. It reports map views, distinct map sessions, filter actions, chat messages, daily trends, popular material/configured-field selections, and chat topic categories. It does not record geocoder query strings, raw search terms, clicked locations, or chat transcripts.

## Components and flow

1. The end-user map in `app/src/components/map/locations-map.tsx` sends `map_view` when the map loads and `filters_applied` when URL-backed filters change. The map-view event also includes filters already active when the map opens.
2. `app/src/lib/usage-analytics.ts` creates a random UUID in browser `sessionStorage` and posts map events to `POST /api/usage-events`.
3. The AI materials chat passes the same tab-scoped session UUID with its request. `app/src/app/api/chat/route.ts` classifies the latest prompt with `app/src/lib/usage-analytics-server.ts` and writes a `chat_message` event. The classifier returns one of `location_finding`, `sorting_advice`, `material_identification`, or `other_help`; image messages are categorized as material identification.
4. `app/src/app/api/usage-events/route.ts` validates and stores map events. Configured field IDs and option indices are checked against the use case before persistence.
5. The same route serves `GET /api/usage-events`. It checks organization membership with `checkOrganizationAuthorization`, verifies that the use case belongs to that organization, aggregates the requested period, and returns localized material labels and configured field choices to the dashboard.

## Data model

Migration `app/migrations/20261005120000_add_use_case_usage_events.ts` creates `recycler.usage_events`:

| Column | Meaning |
| --- | --- |
| `id` | Event row identifier |
| `use_case_id` | Use case that owns the event; deleting the use case cascades to its events |
| `session_id` | Random tab-session identifier from browser `sessionStorage` |
| `event_type` | `map_view`, `filters_applied`, or `chat_message` |
| `metadata` | Small JSON object containing event-specific, validated values |
| `created_at` | Event timestamp |

Indexes support use-case/time and use-case/type/time reporting. Metadata for map events can contain material codes, a selected-filter count, and configured field IDs with selected option indices. Chat metadata contains a topic category, whether an image was present, and the number of currently selected materials. No user ID is attached by the analytics code.

## Privacy and security boundaries

- Analytics does not persist raw chat text, chat history, uploaded images, geocoder text, or free-form search terms. Chat content is still processed by the chat feature to generate its response; this statement concerns analytics persistence only.
- The session UUID is random and kept in tab-scoped `sessionStorage`; it is not a durable account identifier. Reporting counts sessions, not verified unique people.
- The report endpoint is organization-authorized and use-case-scoped. Event ingestion is intentionally callable by public visitors and validates use-case IDs and configured field selections, but currently has no authentication, rate limiting, or abuse detection. Add suitable throttling/monitoring before relying on public event counts in a hostile environment.
- Events currently have no time-based retention or cleanup policy. They are removed when their use case is deleted. Define a retention period and add a scheduled cleanup if operational or legal requirements need one.
- Counts are event-based: repeated map loads, filter changes, or chat messages can count more than once. Topic classification is a lightweight Finnish/English keyword heuristic, not a semantic classifier; treat topic breakdowns as indicative rather than ground truth.

## Operations and limitations

Run the standard database migration command (`cd app && npm run migrate`) as part of deployment, before enabling the new application version for traffic. Usage data starts collecting only after the migration and new application version are active; there is no historical backfill. Existing site-wide Vercel Analytics data is not imported into this table.

The chart reports daily distinct map sessions, filter-change events, and chat-message events. Total visitors are distinct map sessions over the selected range. Popular selections are aggregated from material and configured-field values present in map-view/filter events; they are not search keywords or unique-user counts. If field options are renamed later, historical field indices are displayed using the current field configuration.