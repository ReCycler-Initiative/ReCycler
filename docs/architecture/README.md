# Architecture Documentation

This folder contains architectural documentation for the ReCycler platform.

## Documents

- [Codebase structure and responsibilities](./codebase_structure.md)
  - High-level map of folders and key files.
  - Describes where to implement common changes.
- [Organization registration and user management](./organization_registration_and_user_management.md)
  - Roles, organization model, onboarding, and Auth0-related identity model.
- [High-level solution diagram](./solution_architecture.drawio)
  - Editable Draw.io diagram for system-level architecture.

## How to use this folder

- Start from [codebase_structure.md](./codebase_structure.md) when you need to understand where things are implemented.
- Use [organization_registration_and_user_management.md](./organization_registration_and_user_management.md) when working with user/organization/role flows.
- Keep documentation and implementation aligned in the same pull request when architecture-level behavior changes.

## Maintenance rule

When you add or significantly change one of these areas, update architecture docs in the same change set:

- Routing or layout hierarchy
- Auth/Auth0 flow or organization authorization
- Core domain model (organization, use case, location, field, datasource)
- API contracts and validation
- Shared map behavior and use-case-level map settings
