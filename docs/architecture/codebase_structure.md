# ReCycler Codebase Structure and File Responsibilities

This document explains how the codebase is organized and what the most important files and folders are responsible for.

## 1. Repository-level structure

- [README.md](../../README.md)
  - Project overview, positioning, and links.
- [contributing.md](../../contributing.md)
  - Contribution workflow.
- [docs/](../)
  - Product, use case, architecture, wireframes, epics.
- [app/](../../app/)
  - Main Next.js application, API routes, UI, database migrations and seeds.

## 2. Application root (app folder)

- [app/README.md](../../app/README.md)
  - Local setup and development commands.
- [app/package.json](../../app/package.json)
  - Scripts and dependencies.
- [app/knexfile.ts](../../app/knexfile.ts)
  - Database connection and migration config.
- [app/migrations/](../../app/migrations/)
  - Schema evolution history.
- [app/seeds/](../../app/seeds/)
  - Seed data scripts.
- [app/src/](../../app/src/)
  - Application source code.

## 3. Source code map (app/src)

### 3.1 Routing and pages

- [app/src/app/](../../app/src/app/)
  - App Router pages, layouts, route groups.
- [app/src/app/page.tsx](../../app/src/app/page.tsx)
  - Landing page entry point.
- [app/src/app/admin/](../../app/src/app/admin/)
  - Admin UI for organizations and use cases.
- [app/src/app/organizations/](../../app/src/app/organizations/)
  - End-user use-case views.
- [app/src/app/recycler/](../../app/src/app/recycler/)
  - Generic recycler demo routes.

### 3.2 API routes

- [app/src/app/api/](../../app/src/app/api/)
  - Server-side API endpoints.
- [app/src/app/api/organizations/[organizationId]/use_cases/route.ts](../../app/src/app/api/organizations/[organizationId]/use_cases/route.ts)
  - List/create use cases for organization.
- [app/src/app/api/organizations/[organizationId]/use_cases/[useCaseId]/route.ts](../../app/src/app/api/organizations/[organizationId]/use_cases/[useCaseId]/route.ts)
  - Get/update one use case.
- [app/src/app/api/organizations/[organizationId]/use_cases/[useCaseId]/locations/route.ts](../../app/src/app/api/organizations/[organizationId]/use_cases/[useCaseId]/locations/route.ts)
  - Location CRUD list/create endpoint.

### 3.3 Shared UI components

- [app/src/components/](../../app/src/components/)
  - Reusable UI and feature components.
- [app/src/components/title-bar.tsx](../../app/src/components/title-bar.tsx)
  - Shared top bar wrapper (language switcher + auth controls).
- [app/src/components/editor-template.tsx](../../app/src/components/editor-template.tsx)
  - Common edit-page pattern with query, form and mutation lifecycle.
- [app/src/components/map/locations-map.tsx](../../app/src/components/map/locations-map.tsx)
  - Main end-user map experience (filters, popup, geocoder, map style).
- [app/src/components/admin/admin-map-view.tsx](../../app/src/components/admin/admin-map-view.tsx)
  - Admin map editing/viewing component for locations.

### 3.4 Domain and application logic

- [app/src/types.ts](../../app/src/types.ts)
  - Zod schemas and shared domain types.
- [app/src/services/api.ts](../../app/src/services/api.ts)
  - Browser-side API client wrappers.
- [app/src/services/db.ts](../../app/src/services/db.ts)
  - Shared knex instance for server-side data access.
- [app/src/lib/](../../app/src/lib/)
  - Cross-cutting helpers and domain logic.
- [app/src/lib/authorization.ts](../../app/src/lib/authorization.ts)
  - Organization-level authorization checks against Auth0 membership.
- [app/src/lib/mappers/use-case-mapper.ts](../../app/src/lib/mappers/use-case-mapper.ts)
  - Maps DB rows into API use-case DTO shape.
- [app/src/lib/map-settings.ts](../../app/src/lib/map-settings.ts)
  - Use-case-level map settings defaults and sanitization.

### 3.5 Internationalization

- [app/src/i18n/messages.ts](../../app/src/i18n/messages.ts)
  - Translation message catalogs.
- [app/src/i18n/locale-provider.tsx](../../app/src/i18n/locale-provider.tsx)
  - Locale state and message access hook/provider.
- [app/src/i18n/locale-config.ts](../../app/src/i18n/locale-config.ts)
  - Locale configuration constants.

### 3.6 Middleware and app-wide providers

- [app/src/middleware.ts](../../app/src/middleware.ts)
  - Auth0 middleware integration for incoming requests.
- [app/src/app/providers.tsx](../../app/src/app/providers.tsx)
  - React Query, locale provider, theme provider and toaster wiring.

## 4. Current key architecture flows

## 4.1 UI to API flow

1. UI page or component calls service wrapper in [app/src/services/api.ts](../../app/src/services/api.ts).
2. Request is sent to App Router API route under [app/src/app/api/](../../app/src/app/api/).
3. API route validates/auth-checks and reads/writes through [app/src/services/db.ts](../../app/src/services/db.ts).
4. API route normalizes response using schemas/mappers from [app/src/types.ts](../../app/src/types.ts) and [app/src/lib/mappers/](../../app/src/lib/mappers/).

## 4.2 Auth and organization access flow

1. Request/session middleware is handled in [app/src/middleware.ts](../../app/src/middleware.ts).
2. Protected organization endpoints call [app/src/lib/authorization.ts](../../app/src/lib/authorization.ts).
3. Membership is checked via Auth0 management API and local organization mapping.

## 4.3 Use-case map settings flow

1. Admin edits map settings in use-case edit page.
2. Data is stored through use-case API route and validated by schema in [app/src/types.ts](../../app/src/types.ts).
3. End-user and admin maps read settings and resolve defaults through [app/src/lib/map-settings.ts](../../app/src/lib/map-settings.ts).

## 5. Where to make common changes

- Add or change domain data shape:
  - Start from [app/src/types.ts](../../app/src/types.ts), then update API route(s), mapper(s), migration(s), and UI.
- Add new protected organization endpoint:
  - Add API route under [app/src/app/api/organizations/](../../app/src/app/api/organizations/) and use [app/src/lib/authorization.ts](../../app/src/lib/authorization.ts).
- Add admin settings page:
  - Create route under [app/src/app/admin/organizations/[id]/use_cases/[useCaseId]/](../../app/src/app/admin/organizations/[id]/use_cases/[useCaseId]/) and compose with [app/src/components/editor-template.tsx](../../app/src/components/editor-template.tsx).
- Add user-facing map behavior:
  - Update [app/src/components/map/locations-map.tsx](../../app/src/components/map/locations-map.tsx) and shared rules in [app/src/lib/map-settings.ts](../../app/src/lib/map-settings.ts) if behavior must be reusable.

## 6. Documentation update checklist

When architecture-level behavior changes, update:

- This file: [docs/architecture/codebase_structure.md](./codebase_structure.md)
- Relevant concept file(s), for example:
  - [docs/architecture/organization_registration_and_user_management.md](./organization_registration_and_user_management.md)
- Diagram if needed:
  - [docs/architecture/solution_architecture.drawio](./solution_architecture.drawio)
