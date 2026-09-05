# ReCycler Export API: Auth0-ohje

## Tavoite

ReCyclerin kierrätyspistedata voidaan hakea kahdella tavalla:

- Selain ja Auth0-istunto: Swagger-testausta varten.
- Toinen applikaatio ja Auth0 Machine-to-Machine -access token: Postmania, ERP:ia tai raportointijarjestelmaa varten.

Selainkirjautumista ei tarvita, kun ReCyclerin ulkopuolinen ohjelma tai jarjestelma hakee Auth0:lta access tokenin omilla sovellustunnuksillaan. Tekninen OAuth 2.0 -menetelma on `client_credentials`.

## Rajapinta

```text
GET /api/v1/export/organizations/{organizationId}/use_cases/{useCaseId}/locations
```

Rajapinta palauttaa kayttotapauksen kohteet GeoJSON `FeatureCollection` -muodossa.

Selainkaytossa Swagger loytyy osoitteesta:

```text
https://YOUR_RECYCLER_DOMAIN/api/docs
```

## Auth0-konfigurointi

### 1. Luo API

Auth0 Dashboardissa:

1. Avaa **Applications -> APIs**.
2. Valitse **Create API**.
3. Syota esimerkiksi:

```text
Name: ReCycler Export API
Identifier: https://api.recycler.example
Signing Algorithm: RS256
```

`Identifier` on API:n audience-arvo. Saman arvon pitaa olla kaytossa Auth0:ssa, ReCyclerin palvelimella ja token-pyynnoissa.

### 2. Lisaa permission

Lisaa API:lle seuraava permission:

```text
read:locations
```

Kuvaus:

```text
Read recycling locations from the authorized organization
```

Anna integraatiolle vain tama lukuoikeus.

### 3. Luo Machine-to-Machine Application

Auth0 Dashboardissa:

1. Avaa **Applications -> Applications**.
2. Valitse **Create Application**.
3. Valitse tyypiksi **Machine to Machine Applications**.
4. Anna sovellukselle nimi, esimerkiksi:

```text
ReCycler Export Integration - Organization Name
```

5. Valitse kaytettavaksi API:ksi **ReCycler Export API**.
6. Anna sovellukselle vain permission `read:locations`.
7. Tallenna asetukset.

Tarvittavat tiedot ovat:

```text
Auth0 Domain
Client ID
Client Secret
Audience
```

`Client Secret` pitaa sailyttaa vain toisen applikaation palvelimella tai salaisuuksienhallinnassa. Sita ei saa laittaa selaimen koodiin, Git-repositorioon tai `NEXT_PUBLIC_`-muuttujaan.

## ReCycler-organisaation yhdistaminen

Auth0 `client_id` yhdistetaan ReCycler-organisaatioon ReCyclerin palvelimen ymparistomuuttujalla.

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"AUTH0_CLIENT_ID":"RECYCLER_ORGANIZATION_UUID"}
```

Esimerkki:

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"abc123clientid":"dd10636b-7746-44a4-9ce3-ce05ea5fa19f"}
```

Useampi integraatio voidaan yhdistaa samaan organisaatioon:

```env
AUTH0_M2M_CLIENT_ORGANIZATIONS={"erp-client-id":"organization-uuid","reporting-client-id":"organization-uuid"}
```

URL:ssa annettu `organizationId` ei yksin anna kayttooikeutta. ReCycler tarkistaa, etta tokenin client on yhdistetty samaan organisaatioon.

## ReCyclerin palvelinasetukset

Aseta ReCyclerin palvelimen `.env`-tiedostoon:

```env
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_AUDIENCE=https://api.recycler.example
AUTH0_M2M_CLIENT_ORGANIZATIONS={"AUTH0_CLIENT_ID":"RECYCLER_ORGANIZATION_UUID"}
```

`AUTH0_DOMAIN` voi olla joko muodossa `your-tenant.eu.auth0.com` tai `https://your-tenant.eu.auth0.com`.

## Access tokenin hakeminen

Toinen applikaatio hakee tokenin Auth0:lta:

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

Auth0 palauttaa esimerkiksi:

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

Tokenia ei tarvitse tallentaa pysyvasti. Toinen applikaatio voi hakea uuden tokenin sen vanhennuttua.

## ReCycler API:n kutsuminen

```http
GET https://YOUR_RECYCLER_DOMAIN/api/v1/export/organizations/{organizationId}/use_cases/{useCaseId}/locations
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
```

Esimerkki:

```bash
curl \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Accept: application/json" \\
  "https://YOUR_RECYCLER_DOMAIN/api/v1/export/organizations/dd10636b-7746-44a4-9ce3-ce05ea5fa19f/use_cases/3e0859e4-e0ef-40c2-b583-abcd8cbd8e22/locations"
```

## Postman

### Token-pyynto

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

### Data-pyynto

```text
Method: GET
URL: {{recycler_base_url}}/api/v1/export/organizations/{{organization_id}}/use_cases/{{use_case_id}}/locations
```

Authorization:

```text
Type: Bearer Token
Token: {{access_token}}
```

Suositellut Postman-ymparistomuuttujat:

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

## Kayttooikeusrajaukset

Tokenin pitaa:

- olla Auth0:n allekirjoittama ja voimassa oleva
- olla tarkoitettu ReCycler API:n audiencelle
- sisaltaa permission `read:locations`
- kuulua clientille, joka on yhdistetty pyydettyyn ReCycler-organisaatioon

Esimerkki:

```text
Auth0 client: integration-a
ReCycler organization: organization-a
Permission: read:locations
```

Tama pyynto onnistuu:

```text
integration-a + organization-a
```

Tama pyynto estetaan:

```text
integration-a + organization-b
```

Virhevastaukset:

```text
401 Unauthorized
```

Token puuttuu, on virheellinen tai vanhentunut.

```text
403 Forbidden
```

Token on kelvollinen, mutta silla ei ole tarvittavaa permissionia tai se ei kuulu pyydettyyn organisaatioon.

```text
404 Not Found
```

Kayttotapausta ei loydy kyseisesta organisaatiosta.

## Selainkaytto ja Swagger

Selainkaytto toimii edelleen Auth0-istunnolla:

```text
https://YOUR_RECYCLER_DOMAIN/api/docs
```

Kirjaudu selaimella ReCycleriin, avaa Swagger ja valitse:

```text
Try it out -> syota organizationId ja useCaseId -> Execute
```

Selainkaytto ja M2M-kaytto ovat rinnakkaisia:

```text
Swagger: selain + Auth0-sessio
Postman / ERP: Auth0 client_credentials + Bearer-token
```

## Auth0-kollegalle toimitettavat tiedot

Toimita Auth0-konfiguroinnin jalkeen ReCyclerin yllapidolle:

```text
Auth0 Domain
Audience
Client ID
ReCycler organization_id
ReCycler use_case_id
```

Client Secretia ei tarvitse toimittaa ReCyclerille. Se kuuluu vain toisen applikaation palvelimelle.
