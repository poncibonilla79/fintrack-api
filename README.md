# FinTrack API

API RESTful para control de gastos personales — Node.js + Express + TypeScript + Prisma + PostgreSQL.

---

## Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥ 22 | Runtime |
| TypeScript | 7.0 | Tipado estático |
| Express | 5.2 | Framework HTTP |
| Prisma | 7.9 | ORM / Migraciones |
| PostgreSQL | ≥ 16 | BD relacional |
| Zod | 4.4 | Validación de esquemas |
| JWT | — | Autenticación stateless |
| bcryptjs | 3.0 | Hashing de contraseñas |
| Helmet | 8.3 | Seguridad HTTP |
| express-rate-limit | 8.6 | Rate limiting |

---

## Instalación

```bash
npm install
cp .env.example .env          # Configurar DATABASE_URL, JWT_SECRET
psql -U postgres -c "CREATE DATABASE fintrack_db;"
npx prisma migrate dev --name init
npm run seed
npm run dev                   # http://localhost:3000
```

Swagger: `http://localhost:3000/api-docs`

### Credenciales demo

```
email:    demo@fintrack.com
password: password123
```

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Hot-reload con tsx watch |
| `npm run build` | Compilar TypeScript |
| `npm run seed` | Poblar BD con datos demo |
| `npx prisma migrate dev` | Ejecutar migraciones |
| `npx prisma studio` | UI de base de datos |

---

## Estructura

```
src/
├── app.ts                  # Express config (CORS, helmet, rutas)
├── index.ts                # Entry point + graceful shutdown
├── config/database.ts      # Singleton PrismaClient
├── controllers/            # auth, category, transaction, budget, report, users
├── middleware/              # auth (JWT), error, validate (Zod)
├── routes/                 # auth, category, transaction, budget, report, users, health
├── schemas/                # Validación Zod por endpoint
├── services/               # Lógica de negocio
├── types/                  # Interfaces compartidas
└── utils/                  # app-error.ts, response.util.ts, jwt.util.ts
```

---

## Arquitectura

```
Routes → Controllers → Services → Prisma → PostgreSQL
  ↓         ↓            ↓
Validate  Auth(JWT)    AppError
```

| Capa | Responsabilidad |
|------|----------------|
| **Routes** | Definición HTTP, inyección de middleware |
| **Controllers** | Request/response, delegación a servicios |
| **Services** | Lógica de negocio, operaciones Prisma |
| **Middleware** | JWT, validación Zod, manejo de errores |
| **Schemas** | Esquemas de validación por endpoint |

---

## Respuesta universal

```typescript
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;    // ISO 8601
}
```

---

## API Endpoints

### Health

`GET /health` — Verifica servidor + BD.

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario (rate limit: 10/min) |
| POST | `/api/auth/login` | Iniciar sesión (rate limit: 10/min) |
| GET | `/api/auth/me` | Perfil del usuario autenticado |

**Register / Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "clx...", "name": "...", "email": "...", "createdAt": "..." }
}
```

### Categories

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Listar (globales + del usuario) |
| POST | `/api/categories` | Crear categoría personal |
| PUT | `/api/categories/:id` | Actualizar (solo propia) |
| DELETE | `/api/categories/:id` | Eliminar (solo propia, sin transacciones asociadas) |

- `userId: null` = categoría global (no editable/eliminable)

### Transactions

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/transactions` | Listar con filtros |
| POST | `/api/transactions` | Crear |
| PUT | `/api/transactions/:id` | Actualizar (solo propia) |
| DELETE | `/api/transactions/:id` | Eliminar (solo propia) |

**GET query params** (opcionales): `month` (1-12), `year`, `type` (INCOME/EXPENSE), `categoryId`

**POST body:**
```json
{
  "amount": 150.50,
  "description": "Gasolina",
  "date": "2026-07-15T12:00:00.000Z",
  "type": "EXPENSE",
  "categoryId": "seed-expense-transport"
}
```

> `date` debe ser formato ISO 8601 datetime.

### Budgets

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/budgets` | Listar por mes (requiere `month`, `year`) |
| POST | `/api/budgets` | Crear (único por categoría/mes) |
| PUT | `/api/budgets/:id` | Actualizar monto |
| DELETE | `/api/budgets/:id` | Eliminar |

- `categoryId: null` = presupuesto global del mes

### Reports

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/monthly` | Resumen mensual (requiere `month`, `year`) |
| GET | `/api/reports/budget` | Presupuesto vs real (requiere `month`, `year`) |
| GET | `/api/reports/trends` | Tendencia anual (requiere `year`) |

#### `GET /api/reports/monthly?month=7&year=2026`

```json
{
  "totalIncome": 3500,
  "totalExpense": 625,
  "balance": 2875,
  "byCategory": [
    { "name": "Comida", "type": "EXPENSE", "icon": "utensils", "color": "#ef4444", "amount": 350, "count": 1 }
  ]
}
```

#### `GET /api/reports/budget?month=7&year=2026`

```json
{
  "totalBudget": 1150,
  "totalSpent": 625,
  "globalRemaining": 300,
  "byCategory": [
    {
      "category": { "id": "seed-expense-food", "name": "Comida", "icon": "utensils", "color": "#ef4444" },
      "budget": 500,
      "spent": 350,
      "remaining": 150
    }
  ]
}
```

- `totalBudget`: suma global + categorías
- `globalRemaining`: presupuesto global `(categoryId=null)` menos gastos sin categoría
- `byCategory[].category`: puede ser `null` para presupuesto global

#### `GET /api/reports/trends?year=2026`

Devuelve los 12 meses del año (zero-filled):

```json
[
  { "month": "Enero", "year": 2026, "income": 3000, "expense": 1200, "balance": 1800 },
  { "month": "Febrero", "year": 2026, "income": 3500, "expense": 900, "balance": 2600 }
]
```

---

## Autenticación

1. Registro/Login → `{ token, user }`
2. Guardar token en `localStorage`
3. Enviar `Authorization: Bearer <token>` en cada request protegido
4. Token expira en 24h (configurable con `JWT_EXPIRES_IN` en `.env`, valor en segundos)

**401 desde el backend** → limpiar token y redirigir a `/login`.

---

## Validación y Errores

**Error de validación Zod (400):**
```json
{
  "success": false, "status": 400,
  "message": "Datos de entrada invalidos",
  "details": [{ "field": "email", "message": "Invalid email" }],
  "timestamp": "..."
}
```

**Errores HTTP:**

| Código | Significado | Acción frontend |
|--------|-------------|-----------------|
| 200 | Éxito | Procesar `data` |
| 201 | Creado | Procesar `data` |
| 204 | Eliminado | Remover del estado |
| 400 | Datos inválidos | Mostrar `details` |
| 401 | No autenticado | Redirect a login |
| 403 | Sin permiso | Mostrar mensaje |
| 404 | No encontrado | Mostrar mensaje |
| 409 | Conflicto | Mostrar mensaje (email duplicado, etc.) |
| 429 | Rate limit | Esperar 1 min |
| 500 | Error interno | Mostrar "Error inesperado" |

---

## Seguridad

- Contraseñas: bcrypt (10 rondas)
- JWT: payload mínimo (`userId`), expiración configurable
- CORS: orígenes desde `CORS_ORIGINS` en `.env`
- Helmet: headers de seguridad HTTP
- Rate limiting: 10 req/min en `/api/auth/*`
- JSON body limit: 1 MB
- Ownership check: cada mutación verifica pertenencia al usuario
- Errores 500: nunca expone detalles internos

---

## Diagrama ER

```
User ──┬── Category (userId? = null → global)
       ├── Transaction (userId, categoryId → FK)
       └── Budget (userId, categoryId? → FK, unique: userId+categoryId+month+year)
```

---

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Ver `.env.example` para las variables requeridas (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGINS`).
