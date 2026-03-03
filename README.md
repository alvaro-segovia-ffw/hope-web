# Hope Web

Frontend público y administrativo para el backend Hope, implementado con Next.js App Router, Keycloak OIDC y autorización por rol.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Keycloak JS (Authorization Code + PKCE)
- ESLint + Prettier

## Requisitos

- Node.js 20+
- npm 10+
- Backend Hope disponible en `http://localhost:3000`
- Keycloak disponible en `http://localhost:8081`

## Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=hope
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=hope-web
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

App disponible en `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run build
npm run format
```

## Rutas implementadas

- `/` Home con accesos rápidos
- `/apartments` Listado público paginado + búsqueda cliente-side por `externalId`
- `/apartments/[externalId]` Detalle público
- `/admin` Área administrativa protegida por rol `admin`

## Ejemplos de llamadas API

Públicas:

```bash
curl "http://localhost:3000/api/v1/apartments?page=1&perPage=20"
curl "http://localhost:3000/api/v1/apartments?useCase=bookable_furnished_flats"
curl "http://localhost:3000/api/v1/apartments?useCase=apartments_on_sale"
curl "http://localhost:3000/api/v1/apartments?useCase=longterm_tenant"
curl "http://localhost:3000/api/v1/apartments?useCase=recently_deactivated"
curl "http://localhost:3000/api/v1/apartments/APT-001"
```

`useCase` también acepta aliases:
- `long-term` (equivalente a `longterm_tenant`)
- `sale` (equivalente a `apartments_on_sale`)
- `deactivated` (equivalente a `recently_deactivated`)

Notas backend:
- `recently_deactivated` devuelve propiedades no activas/publicadas sincronizadas en los ultimos 30 dias (`synced_at >= now() - 30d`).
- Para que los filtros de venta/desactivado usen datos actuales, ejecutar un sync nuevo de OnOffice.

Internas (requieren bearer token admin):

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/internal/db/apartments/count"
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/internal/sync/onoffice/last-run"
curl -X POST -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/internal/sync/onoffice/run"
```

## Checklist de validación manual

- [ ] Abrir `/apartments` sin login y validar listado paginado
- [ ] Buscar por `externalId` sobre la página actual
- [ ] Abrir `/apartments/{externalId}` sin login y validar detalle
- [ ] Hacer login con Keycloak desde el botón de navegación
- [ ] Ingresar a `/admin` con usuario `admin` y verificar:
  - [ ] Count DB cargado
  - [ ] Last run cargado
  - [ ] `Run Sync` ejecuta y muestra feedback
- [ ] Ingresar a `/admin` con usuario `partner` y verificar acceso denegado (403 UX)
- [ ] Forzar token inválido o ausencia de permisos y validar mensajes 401/403
- [ ] Ejecutar `npm run lint` y `npm run build` en verde

## Estructura

```text
src/
  app/
  features/
    apartments/
    admin/
    auth/
  lib/
    api/
    env/
```
