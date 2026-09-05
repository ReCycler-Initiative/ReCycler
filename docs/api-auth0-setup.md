# ReCycler Export API: Auth0 Setup Guide

## Goal

ReCycler recycling location data can be accessed in two ways:

- Browser and Auth0 session: for testing through Swagger.
- An external program or system and an Auth0 Machine-to-Machine access token: for Postman, an ERP system, a reporting service, or another integration.

A browser login is not needed when an external program requests an access token from Auth0 using its own application credentials. The technical OAuth 2.0 method is `client_credentials`.

## API endpoint

```text
GET /api/v1/export/organizations/{organizationId}/use_cases/{useCaseId}/locations
```

The endpoint returns the locations for a use case as a GeoJSON `FeatureCollection`.

For browser testing, Swagger is available at:

```text
https://YOUR_RECYCLER_DOMAIN/api/docs
```

## Auth0 configuration

### 1. Create the API

In the Auth0 Dashboard:

1. Open **Applications -> APIs**.
2. Select **Create API**.
3. Use values such as:

```text
Name: ReCycler Export API
Identifier: https://api.recycler.example
Signing Algorithm: RS256
```

The `Identifier` is the API audience. The same value must be used in Auth0, in the ReCycler server configuration, and when requesting the token.

### 2. Add the permission

Add this permission to the API:

```text
read:locations
```

Description:

```text
Read recycling locations from the authorized organization
```

Give the integration read access only.

### 3. Create a Machine-to-Machine Application

In the Auth0 Dashboard:

1. Open **Applications -> Applications**.
2. Select **Create Application**.
3. Select **Machine to Machine Applications** as the application type.
4. Give the application a name, for example:

```text
ReCycler Export Integration - Organization Name
```

5. Select **ReCycler Export API** as the API.
6. Grant the application only the `read:locations` permission.
7. Save the settings.

The required values are:

```text
Auth0 Domain
Client ID
Client Secret
Audience
```

The `Client Secret` must be stored only on the external application's server or in a secrets manager. It must not be placed in browser code, Git, or a `NEXT_PUBLIC_` variable.

## Map the Auth0 client to a ReCycler organization

The Auth0 `client_id` must be mapped to a ReCycler organization in the ReCycler server configuration.

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"AUTH0_CLIENT_ID":"RECYCLER_ORGANIZATION_UUID"}
```

Example:

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"abc123clientid":"dd10636b-7746-44a4-9ce3-ce05ea5fa19f"}
```

Multiple integrations can be mapped to the same organization:

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"erp-client-id":"organization-uuid","reporting-client-id":"organization-uuid"}
```

The `organizationId` in the URL does not grant access by itself. ReCycler verifies that the token's client is mapped to the same organization.

## ReCycler server configuration

Set these values in the ReCycler server `.env` file:

```env
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_AUDIENCE=https://api.recycler.example
AUTH0_M2M_CLIENT_ORGANIZATIONS={"AUTH0_CLIENT_ID":"RECYCLER_ORGANIZATION_UUID"}
```

`AUTH0_DOMAIN` can be either `your-tenant.eu.auth0.com` or `https://your-tenant.eu.auth0.com`.

## Request an access token

The external program requests an access token from Auth0:

```http
POST https://YOUR_AUTH0_DOMAIN/oauth/token
Content-Type: application/json
```

```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "audience": "https://api.recycler.example",
  "grant_type": "client_credentials"
}
```

Auth0 returns a response such as:

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

The token does not need to be stored permanently. The external program can request a new token when the current one expires.

## Call the ReCycler API

```http
GET https://YOUR_RECYCLER_DOMAIN/api/v1/export/organizations/{organizationId}/use_cases/{useCaseId}/locations
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
```

Example:

```bash
curl \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Accept: application/json" \\
  "https://YOUR_RECYCLER_DOMAIN/api/v1/export/organizations/dd10636b-7746-44a4-9ce3-ce05ea5fa19f/use_cases/3e0859e4-e0ef-40c2-b583-abcd8cbd8e22/locations"
```

## Postman

Postman is only a tool for testing the same API. It does not require a separate ReCycler integration.

### Token request

```text
Method: POST
URL: https://YOUR_AUTH0_DOMAIN/oauth/token
```

Headers:

```text
Content-Type: application/json
```

Body -> raw -> JSON:

```json
{
  "client_id": "{{client_id}}",
  "client_secret": "{{client_secret}}",
  "audience": "{{audience}}",
  "grant_type": "client_credentials"
}
```

### Data request

```text
Method: GET
URL: {{recycler_base_url}}/api/v1/export/organizations/{{organization_id}}/use_cases/{{use_case_id}}/locations
```

Authorization:

```text
Type: Bearer Token
Token: {{access_token}}
```

Recommended Postman environment variables:

```text
auth0_domain
client_id
client_secret
audience
recycler_base_url
organization_id
use_case_id
access_token
```

## Access control

The token must:

- be issued and signed by Auth0
- be valid and unexpired
- be intended for the ReCycler API audience
- contain the `read:locations` permission
- belong to a client mapped to the requested ReCycler organization

Example:

```text
Auth0 client: integration-a
ReCycler organization: organization-a
Permission: read:locations
```

This request is allowed:

```text
integration-a + organization-a
```

This request is denied:

```text
integration-a + organization-b
```

Error responses:

```text
401 Unauthorized
```

The token is missing, invalid, or expired.

```text
403 Forbidden
```

The token is valid, but it does not have the required permission or is not mapped to the requested organization.

```text
404 Not Found
```

The use case does not belong to the requested organization or cannot be found.

## Browser access and Swagger

Browser access continues to use the Auth0 session:

```text
https://YOUR_RECYCLER_DOMAIN/api/docs
```

Sign in to ReCycler in the browser, open Swagger, and select:

```text
Try it out -> enter organizationId and useCaseId -> Execute
```

The two access methods are equivalent from the API's perspective:

```text
Swagger: browser + Auth0 session
Postman / ERP / external program: Auth0 client credentials + Bearer token
```

## Information needed after Auth0 setup

Provide the following values to the ReCycler administrator or integration developer:

```text
Auth0 Domain
Audience
Client ID
ReCycler organization_id
ReCycler use_case_id
```

The Client Secret does not need to be provided to ReCycler. It belongs only on the external application's server.
