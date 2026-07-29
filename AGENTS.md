# FinTrack API — Plan para Agentes

## Stack

- Node.js 22+, TypeScript 7, Express 5, Prisma 7, PostgreSQL ≥ 16
- Autenticación: JWT + bcryptjs
- Validación: Zod 4
- Documentación: Swagger (OpenAPI 3.0) en `/api-docs`

## Comandos

```bash
npm run dev              # Servidor con hot-reload (ts-node-dev)
npm run build            # Compilar TypeScript a JS (tsc)
npm start                # Ejecutar build en producción
npm run seed             # Poblar BD con datos demo
npx prisma generate      # Regenerar Prisma Client
npx prisma migrate dev   # Crear/ejecutar migraciones
npx prisma studio        # UI de base de datos (puerto 5555)
npx tsc --noEmit         # Verificar compilación sin emitir archivos
```

## Estructura

```
src/
├── app.ts                  # Config Express (CORS, helmet, rate-limit, rutas, swagger)
├── index.ts                # Entry point + graceful shutdown (SIGTERM/SIGINT)
├── config/database.ts      # Singleton PrismaClient + Pool PostgreSQL
├── controllers/            # auth, users, category, transaction, budget, report
├── docs/openapi.ts         # Especificación OpenAPI 3.0 completa
├── middleware/             # auth (JWT verify), error (global handler), validate (Zod)
├── routes/                 # auth, users, category, transaction, budget, report, health
├── schemas/                # auth, user, category, transaction, budget (Zod)
├── services/               # auth, users, category, transaction, budget, report
├── types/                  # 9 archivos: api-response, auth, user, category, transaction, budget, report, common, config
└── utils/                  # app-error.ts (AppError class), response.util.ts (sendSuccess/Created/Error/NoContent)
prisma/
├── schema.prisma           # 4 modelos + 1 enum: User, Category, Transaction, Budget
└── seed.ts                 # Datos demo (usuario, categorías, transacciones, presupuestos)
```

---

## Entidades y Campos (BD → API)

### `User` — Usuario

| Campo       | Tipo API              | Requerido | Descripción                        |
|-------------|------------------------|-----------|------------------------------------|
| `id`        | `string`               | ✅        | CUID único                         |
| `email`     | `string`               | ✅        | Email único del usuario            |
| `name`      | `string`               | ✅        | Nombre completo                    |
| `password`  | `string` (solo input)  | ✅        | Hash bcrypt — nunca se devuelve    |
| `createdAt` | `string` (ISO 8601)    | ✅        | Fecha de creación                  |
| `updatedAt` | `string` (ISO 8601)    | ✅        | Fecha de última actualización      |

### `Category` — Categoría

| Campo    | Tipo API                    | Requerido | Descripción                                    |
|----------|-----------------------------|-----------|------------------------------------------------|
| `id`     | `string`                    | ✅        | CUID único                                     |
| `name`   | `string`                    | ✅        | Nombre (único por usuario)                     |
| `type`   | `"INCOME" \| "EXPENSE"`    | ✅        | Tipo de categoría                              |
| `icon`   | `string`                    | ❌        | Nombre del ícono (Lucide)                      |
| `color`  | `string`                    | ❌        | Color hex `#rrggbb`                            |
| `userId` | `string` \| `null`          | ❌        | `null` = global, `string` = del usuario        |

### `Transaction` — Transacción

| Campo         | Tipo API                    | Requerido | Descripción                                   |
|---------------|-----------------------------|-----------|-----------------------------------------------|
| `id`          | `string`                    | ✅        | CUID único                                    |
| `amount`      | `number`                    | ✅        | Monto positivo `decimal(12,2)`                |
| `description` | `string`                    | ✅        | Descripción (max 200 chars)                   |
| `date`        | `string` (ISO 8601)         | ✅        | Fecha de la transacción                       |
| `type`        | `"INCOME" \| "EXPENSE"`    | ✅        | Tipo de transacción                           |
| `userId`      | `string`                    | ✅        | FK → User                                     |
| `categoryId`  | `string`                    | ✅        | FK → Category                                 |
| `category`    | `CategoryNested` (expandida)| —         | Datos de la categoría anidados en la respuesta |

### `Budget` — Presupuesto

| Campo       | Tipo API                    | Requerido | Descripción                                      |
|-------------|-----------------------------|-----------|--------------------------------------------------|
| `id`        | `string`                    | ✅        | CUID único                                       |
| `amount`    | `number`                    | ✅        | Monto presupuestado `decimal(12,2)`              |
| `month`     | `number` (1-12)             | ✅        | Mes                                              |
| `year`      | `number` (2000-2100)        | ✅        | Año                                              |
| `categoryId`| `string` \| `null`          | ❌        | `null` = presupuesto global del mes              |
| `userId`    | `string`                    | ✅        | FK → User                                        |
| `category`  | `CategoryNested` \| `null`  | —         | Categoría expandida o `null` si es global        |

---

## Convenciones de Código

### Patrón MVC con Capa de Servicios

```
Routes → Controllers → Services → Prisma → PostgreSQL
```

| Capa | Responsabilidad | Reglas |
|------|----------------|--------|
| **Routes** | Definir rutas + conectar middleware | Solo `router.get/post/put/delete`. NO lógica. Usar `authMiddleware`, `validate(schema)`. |
| **Controllers** | Manejar request/response | Usar `getAuthUserId(req)`. `try/catch` con `next(error)`. Llamar a services. |
| **Services** | Lógica de negocio + Prisma | Lanzar `AppError(status, message)` para errores conocidos. NO usar `req`/`res`. |
| **Middleware** | Validar/transformar request | `authMiddleware` (JWT → `req.user`), `validate` (Zod → error 400), `errorMiddleware` (catch global). |

### Respuestas

Siempre formato `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;  // ISO 8601
}
```

Funciones helper:
- `sendSuccess(res, data, message?)` → `200`
- `sendCreated(res, data, message?)` → `201`
- `sendNoContent(res)` → `204`
- `sendError(res, status, message?)` → error

### Errores

- Services: `throw new AppError(404, 'Usuario no encontrado')`
- Controllers: `catch (error) { next(error); }`
- Error middleware: si es `AppError` → su status. Si no → `500`.

### Validación Zod

Schemas con estructura `{ body?, params?, query? }`:

```typescript
export const schema = z.object({
  body: z.object({ ... }),
  params: z.object({ id: z.string() }),
  query: z.object({ month: z.coerce.number().int().min(1).max(12) }),
});
```

- Usar `z.coerce.number()` para query params (llegan como string)
- Validar `params.id` como string en PUT/DELETE
- No validar manualmente en controllers — el middleware `validate` lo hace

### JWT

- Payload: `{ userId: string }` — SOLO userId, sin email ni otros datos
- Firma HMAC con `JWT_SECRET`
- Expiración: `JWT_EXPIRES_IN` (default 86400s = 24h)
- Auth middleware decodifica e inyecta `req.user`
- Helper `getAuthUserId(req)` extrae userId o lanza 401

### Services

- `UpdateTransactionDto` whitelist: `['amount', 'description', 'date', 'type', 'categoryId']`
- `categoryService.create()`: verificar duplicado por `userId + name` antes de insertar
- `reportService.budgetVsActual()`: `totalBudget` = suma de TODOS los budgets. `globalRemaining` = presupuesto global - gastos sin categoría.

### Seed

```typescript
import prisma from '../src/config/database';  // ← Única forma correcta
// NO crear PrismaClient propio
// NO llamar dotenv.config()
```

### Base de datos

- `@@map("users")`, `@@map("categories")`, etc. → snake_case en BD
- Índice `@@index([userId, date])` en Transaction — clave para recharts
- Relaciones: User → `Cascade`, Category → Transaction = `Restrict`
- `categoryId: null` en Budget = presupuesto global del mes

---

## Formato de Response para Frontend

### Éxito

```json
{
  "success": true,
  "status": 200,
  "message": "Operacion exitosa",
  "data": { ... },
  "timestamp": "2026-07-26T12:00:00.000Z"
}
```

### Error de validación

```json
{
  "success": false,
  "status": 400,
  "message": "Datos de entrada invalidos",
  "error": "Datos de entrada invalidos",
  "details": [{ "field": "email", "message": "Invalid email" }],
  "timestamp": "2026-07-26T12:00:00.000Z"
}
```

### Error controlado

```json
{
  "success": false,
  "status": 409,
  "message": "El email ya esta registrado",
  "error": "El email ya esta registrado",
  "timestamp": "2026-07-26T12:00:00.000Z"
}
```

---

## Endpoints (Resumen Rápido)

| Método | Ruta | Auth | Validación |
|--------|------|------|------------|
| `GET` | `/health` | ❌ | — |
| `POST` | `/api/auth/register` | ❌ (rate-limit) | Zod |
| `POST` | `/api/auth/login` | ❌ (rate-limit) | Zod |
| `GET` | `/api/auth/me` | ✅ JWT | — |
| `GET` | `/api/users` | ✅ JWT | — |
| `GET` | `/api/users/:id` | ✅ JWT | — |
| `POST` | `/api/users` | ✅ JWT | Zod |
| `PUT` | `/api/users/:id` | ✅ JWT | Zod |
| `DELETE` | `/api/users/:id` | ✅ JWT | — |
| `GET` | `/api/categories` | ✅ JWT | — |
| `POST` | `/api/categories` | ✅ JWT | Zod |
| `PUT` | `/api/categories/:id` | ✅ JWT | Zod |
| `DELETE` | `/api/categories/:id` | ✅ JWT | Zod |
| `GET` | `/api/transactions` | ✅ JWT | Zod (query) |
| `POST` | `/api/transactions` | ✅ JWT | Zod |
| `PUT` | `/api/transactions/:id` | ✅ JWT | Zod |
| `DELETE` | `/api/transactions/:id` | ✅ JWT | Zod |
| `GET` | `/api/budgets?month=&year=` | ✅ JWT | Zod (query) |
| `POST` | `/api/budgets` | ✅ JWT | Zod |
| `PUT` | `/api/budgets/:id` | ✅ JWT | Zod |
| `DELETE` | `/api/budgets/:id` | ✅ JWT | Zod |
| `GET` | `/api/reports/monthly?month=&year=` | ✅ JWT | Zod (query) |
| `GET` | `/api/reports/budget?month=&year=` | ✅ JWT | Zod (query) |
| `GET` | `/api/reports/trends?months=` | ✅ JWT | Zod (query) |

---

## Seguridad

| Medida | Detalle |
|--------|---------|
| **Helmet** | Headers HTTP seguros (CSP, X-Frame-Options, HSTS, etc.) |
| **CORS** | Orígenes desde `CORS_ORIGINS` en `.env` |
| **Rate Limit** | 10 req/min en `/api/auth/*` |
| **JSON Limit** | Body máximo 1 MB |
| **bcrypt** | 10 rondas de sal |
| **JWT** | Payload mínimo (solo `userId`), expiración configurable |
| **Ownership** | Cada PUT/DELETE verifica que el recurso pertenezca al `userId` del token |
| **Error handling** | Errores no controlados → `500` genérico sin stack trace |

---

## Datos del Seed

```
Email:    demo@fintrack.com
Password: password123
```

- 10 categorías globales (5 INCOME + 5 EXPENSE)
- 8 transacciones demo para julio 2026
- 5 presupuestos demo (julio/agosto 2026)

---

## Flujo típico para nuevo endpoint

1. **Schema Zod** en `src/schemas/` — validar body/params/query
2. **Type/interface** en `src/types/` — DTOs y response types
3. **Service** en `src/services/` — lógica de negocio + Prisma + AppError
4. **Controller** en `src/controllers/` — `getAuthUserId(req)` + `try/catch` + `next(error)`
5. **Route** en `src/routes/` — `authMiddleware` + `validate(schema)` + controller handler
6. **Documentación** en `src/docs/openapi.ts` — path, método, params, response schema
7. **Verificar** `npx tsc --noEmit`

---

## Notas para Frontend

- `GET /api/transactions` devuelve array plano (sin paginación aún). La categoría viene expandida en `transaction.category`.
- `GET /api/budgets` requiere `?month=&year=`. `categoryId: null` = presupuesto global.
- Reports: `byCategory` para gráficos de torta/barras. `trends` para LineChart (recharts).
- Token JWT expira. El frontend debe capturar `401` y redirigir a login.
- `balance = totalIncome - totalExpense` en monthly report.
- `globalRemaining = globalBudget - (totalSpent - categorizedSpent)` en budget report.
