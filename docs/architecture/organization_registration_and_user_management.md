# Organization Registration and User Management

## Purpose

This document defines the target model for organization onboarding, user registration, identity management, and role-based access control.

## 1. Service entry point (organization-admin level)

- Service provides a landing page with Sign in.
- Registration wizard guides initial setup.
- Wizard creates first organization administrator for the service instance.

## 2. Organizational structure

- Every user belongs to at least one organization.
- Each organization must have at least one Org Admin.
- Same user can be Org Admin in multiple organizations.

## 3. Organization setup process

After registration, Org Admin is guided to configure organization access:

- Invite/add users to the organization.
- Enforce subscription-based user limits (for example max 10 or unlimited).
- Optionally enable domain-based joining, for example users with email domain @example-firm-ltd.com can auto-join.

## 4. Roles and permissions model

Each organization uses role-based access control:

- Org Admin
  - Manages full organization, users, and all associated services/use cases.
- Owner
  - Manages one service/use case.
  - Same user can own multiple services across organizations.
- Editor
  - Can edit content, configuration, or data of an assigned service.
- Viewer
  - Read-only access to assigned service.

## 5. Authentication and identity

- Identity provider is Auth0.
- Primary user identity key is Auth0 sub (user_id).
- Organization identifiers are managed in Auth0 and mapped to local database organization records.
- Application database links users to one or more organizations, while Auth0 handles authentication flows.
- Supported login methods are those supported by Auth0 (social, enterprise SSO, passwordless, etc.).

## 6. Data protection and compliance

- Service stores only data required for authentication linkage and role assignment.
- Personal profile attributes (name, email, avatar) are managed in Auth0.
- GDPR obligations related to identity data are primarily handled through Auth0 compliance capabilities.

## 7. Implementation references in current codebase

- Auth middleware entry:
  - [app/src/middleware.ts](../../app/src/middleware.ts)
- Auth0 client and management client:
  - [app/src/lib/auth0.ts](../../app/src/lib/auth0.ts)
- Organization membership authorization helper:
  - [app/src/lib/authorization.ts](../../app/src/lib/authorization.ts)
- Organization and use-case API route roots:
  - [app/src/app/api/organizations/](../../app/src/app/api/organizations/)
- User organizations endpoint (client usage):
  - [app/src/services/api.ts](../../app/src/services/api.ts)

## 8. Open design decisions (to be finalized)

- Exact persistence model for organization-level role assignments in local DB.
- Invitation lifecycle and status model (invited, accepted, expired, revoked).
- Domain auto-join security constraints and approval policy.
- Subscription enforcement logic and limit override policy.
- Audit logging requirements for access/role changes.
