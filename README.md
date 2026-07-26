# FinTrack API 💰

**Sistema de control de gastos personales** — API RESTful construida con Node.js + Express + TypeScript + Prisma ORM + PostgreSQL.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Modelo de Datos](#-modelo-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos](#-requisitos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Validación y Errores](#-validación-y-errores)
- [Seguridad](#-seguridad)
- [Diagrama ER](#-diagrama-er)
- [Mejoras Futuras](#-mejoras-futuras)
- [Licencia](#-licencia)

---

## 🏗️ Arquitectura

```
                        ┌──────────────┐
                        │   Cliente     │
                        │ (React/App)   │
                        └──────┬───────┘
                               │ HTTP/JSON
                               ▼
                    ┌───────────────────┐
                    │   Express Server  │
                    │   (src/index.ts)  │
                    └────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │  Routes   │  │  Auth    │  │   Middleware  │
        │ (Router)  │  │  JWT     │  │ (Validate/   │
        └─────┬─────┘  └──────────┘  │  Error/CORS) │
              │                       └──────────────┘
              ▼
        ┌──────────┐
        │Controller│
        └─────┬─────┘
              ▼
        ┌──────────┐
        │ Service   │  ← Lógica de negocio
        └─────┬─────┘
              ▼
        ┌──────────┐
        │  Prisma   │  ← ORM
        │  Client   │
        └─────┬─────┘
              ▼
        ┌──────────┐
        │PostgreSQL │
        └──────────┘
```

### Patrón: MVC con Capa de Servicios

| Capa | Responsabilidad | Archivos |
|------|----------------|----------|
| **Routes** | Definición de rutas HTTP, inyección de middleware | `src/routes/*.ts` |
| **Controllers** | Manejo de request/response, delegación a servicios | `src/controllers/*.ts` |
| **Services** | Lógica de negocio, operaciones con Prisma | `src/services/*.ts` |
| **Middleware** | Autenticación JWT, validación Zod, manejo de errores | `src/middleware/*.ts` |
| **Schemas** | Esquemas de validación Zod por endpoint | `src/schemas/*.ts` |
| **Types** | Tipos e interfaces compartidas | `src/types/*.ts` |

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | ≥ 22 | Entorno de ejecución |
| **TypeScript** | 7.0 | Tipado estático |
| **Express** | 5.2 | Framework HTTP |
| **Prisma** | 7.9 | ORM / Migraciones |
| **PostgreSQL** | ≥ 15 | Base de datos relacional |
| **Zod** | 4.4 | Validación de esquemas |
| **JWT** | — | Autenticación stateless |
| **bcryptjs** | 3.0 | Hashing de contraseñas |
| **Swagger** | — | Documentación interactiva |
| **Helmet** | 8.3 | Seguridad HTTP |
| **express-rate-limit** | 8.6 | Rate limiting |

---

## 🧩 Modelo de Datos

### Entidades

```prisma
enum TransactionType { INCOME  EXPENSE }

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String
  password     String        // bcrypt hash
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  categories   Category[]
  transactions Transaction[]
  budgets      Budget[]
}

model Category {
  id           String        @id @default(cuid())
  name         String
  type         TransactionType
  icon         String?       // Lucide icon name
  color        String?       // Hex color (#rrggbb)
  userId       String?       // null = global, string = del usuario
  user         User?         @relation(...)
  transactions Transaction[]
  budgets      Budget[]
  @@unique([userId, name])
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(12, 2)
  description String
  date        DateTime
  type        TransactionType
  userId      String
  categoryId  String
  user        User            @relation(...)
  category    Category        @relation(...)
  @@index([userId, date])     // ← clave para filtros mensuales y recharts
}

model Budget {
  id         String    @id @default(cuid())
  amount     Decimal   @db.Decimal(12, 2)
  month      Int       // 1-12
  year       Int
  categoryId String?   // null = presupuesto global del mes
  userId     String
  user       User      @relation(...)
  category   Category? @relation(...)
  @@unique([userId, categoryId, month, year])
}
```

### Relaciones Clave

| Relación | Tipo | Regla de Borrado |
|----------|------|------------------|
| User → Transaction | 1:N | `Cascade` |
| User → Category | 1:N | `Cascade` |
| User → Budget | 1:N | `Cascade` |
| Category → Transaction | 1:N | `Restrict` |
| Category → Budget | 1:N | `Cascade` |

---

## 📁 Estructura del Proyecto

```
fintrack-api/
├── prisma/
│   ├── schema.prisma          # Modelo de datos y configuración
│   └── seed.ts                # Datos de prueba (usuario demo, categorías, tx)
├── src/
│   ├── app.ts                 # Configuración Express (CORS, helmet, rutas, swagger)
│   ├── index.ts               # Punto de entrada, graceful shutdown
│   ├── config/
│   │   └── database.ts        # Singleton PrismaClient + pool PostgreSQL
│   ├── controllers/
│   │   ├── auth.controller.ts      # register, login, me
│   │   ├── users.controller.ts     # CRUD usuarios
│   │   ├── category.controller.ts  # CRUD categorías
│   │   ├── transaction.controller.ts  # CRUD transacciones
│   │   ├── budget.controller.ts    # CRUD presupuestos
│   │   └── report.controller.ts    # Reportes mensuales y tendencias
│   ├── docs/
│   │   └── openapi.ts         # Especificación OpenAPI 3.0 (Swagger)
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification + req.user
│   │   ├── error.middleware.ts     # Manejador global de errores
│   │   └── validate.middleware.ts  # Validación Zod request/body/query/params
│   ├── routes/
│   │   ├── auth.ts            # /api/auth/*
│   │   ├── users.ts           # /api/users/*
│   │   ├── category.ts        # /api/categories/*
│   │   ├── transaction.ts     # /api/transactions/*
│   │   ├── budget.ts          # /api/budgets/*
│   │   ├── report.ts          # /api/reports/*
│   │   └── health.ts          # /health
│   ├── schemas/
│   │   ├── auth.schema.ts     # Zod: register, login
│   │   ├── user.schema.ts     # Zod: create, update
│   │   ├── category.schema.ts # Zod: create, update, delete
│   │   ├── transaction.schema.ts  # Zod: CRUD + list
│   │   └── budget.schema.ts   # Zod: CRUD + list
│   ├── services/
│   │   ├── auth.service.ts    # register, login, getProfile
│   │   ├── users.service.ts   # CRUD + existsByEmail
│   │   ├── category.service.ts # CRUD + verificación duplicados
│   │   ├── transaction.service.ts  # CRUD + filtros
│   │   ├── budget.service.ts  # CRUD + transacciones atómicas
│   │   └── report.service.ts  # Resumen mensual, budget vs actual, tendencias
│   ├── types/
│   │   ├── api-response.types.ts   # ApiResponse<T> genérico
│   │   ├── auth.types.ts           # JwtPayload, AuthResponse, DTOs
│   │   ├── user.types.ts           # UserPublic, CreateUserDto, UpdateUserDto
│   │   ├── category.types.ts       # CategoryResponse, Create/Update DTOs
│   │   ├── transaction.types.ts    # TransactionResponse, filters, DTOs
│   │   ├── budget.types.ts         # BudgetResponse, BudgetFilter, DTOs
│   │   ├── report.types.ts         # MonthlySummary, BudgetVsActual, Trends
│   │   ├── common.types.ts         # Pagination, AsyncHandler, MonthlyFilter
│   │   └── config.types.ts         # AppConfig + loadConfig()
│   └── utils/
│       ├── app-error.ts        # Clase AppError (status + message)
│       └── response.util.ts    # sendSuccess, sendCreated, sendError, sendNoContent
├── prisma.config.ts            # Configuración Prisma 7 (env vars)
├── tsconfig.json               # Configuración TypeScript
├── .env                        # Variables de entorno (local)
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## 📋 Requisitos

- **Node.js** ≥ 22
- **PostgreSQL** ≥ 16
- **npm** ≥ 10

---

## 🚀 Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/poncibonilla79/fintrack-api.git
cd fintrack-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 4. Crear la base de datos
psql -U postgres -c "CREATE DATABASE fintrack_db;"

# 5. Ejecutar migraciones y seed
npx prisma migrate dev --name init
npm run seed

# 6. Iniciar servidor
npm run dev
```

El servidor iniciará en `http://localhost:3000`. La documentación Swagger estará disponible en `http://localhost:3000/api-docs`.

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor con hot-reload (ts-node-dev) |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Ejecuta el build en producción |
| `npm run seed` | Pobla la BD con datos demo |
| `npm run prisma:generate` | Regenera Prisma Client |
| `npm run prisma:migrate` | Crea/ejecuta migraciones |
| `npm run prisma:studio` | Abre Prisma Studio (UI de BD) |

---

## 📡 API Endpoints

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servidor y conexión a BD |

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado |

### Users

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/users` | Listar todos los usuarios |
| `GET` | `/api/users/:id` | Obtener usuario por ID |
| `POST` | `/api/users` | Crear usuario |
| `PUT` | `/api/users/:id` | Actualizar usuario (solo propio) |
| `DELETE` | `/api/users/:id` | Eliminar usuario (solo propio) |

### Categories

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/categories` | Listar categorías (globales + propias) |
| `POST` | `/api/categories` | Crear categoría personal |
| `PUT` | `/api/categories/:id` | Actualizar categoría (solo propia) |
| `DELETE` | `/api/categories/:id` | Eliminar categoría (solo propia) |

### Transactions

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/transactions` | Listar transacciones (filtro mensual opcional) |
| `POST` | `/api/transactions` | Crear transacción |
| `PUT` | `/api/transactions/:id` | Actualizar transacción (solo propia) |
| `DELETE` | `/api/transactions/:id` | Eliminar transacción (solo propia) |

**Parámetros de consulta** (`GET /api/transactions`):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `month` | `number` (1-12) | Filtrar por mes |
| `year` | `number` | Filtrar por año |
| `type` | `INCOME \| EXPENSE` | Filtrar por tipo |
| `categoryId` | `string` | Filtrar por categoría |

### Budgets

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/budgets` | Listar presupuestos del mes (requiere `?month=&year=`) |
| `POST` | `/api/budgets` | Crear presupuesto |
| `PUT` | `/api/budgets/:id` | Actualizar presupuesto |
| `DELETE` | `/api/budgets/:id` | Eliminar presupuesto |

### Reports

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/reports/monthly?month=&year=` | Resumen mensual (ingresos, gastos, balance, desglose por categoría) |
| `GET` | `/api/reports/budget?month=&year=` | Comparación presupuesto vs gasto real |
| `GET` | `/api/reports/trends?months=6` | Tendencia mensual para gráficos recharts |

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** con el siguiente flujo:

1. **Registro** (`POST /api/auth/register`) → crea usuario + devuelve `{ token, user }`
2. **Login** (`POST /api/auth/login`) → credenciales válidas → devuelve `{ token, user }`
3. **Rutas protegidas** → enviar `Authorization: Bearer <token>` en el header

### Payload del JWT

```typescript
interface JwtPayload {
  userId: string;  // Solo el ID del usuario (principio de mínimo privilegio)
}
```

### Middleware de autenticación

- `authMiddleware`: verifica el token JWT e inyecta `req.user`
- `getAuthUserId(req)`: helper tipado que extrae el userId o lanza `401`

### Rate Limiting

Las rutas de autenticación (`/api/auth/*`) tienen un límite de **10 solicitudes por minuto** para prevenir ataques de fuerza bruta.

---

## ✅ Validación y Errores

### Validación con Zod

Cada endpoint `POST` y `PUT` valida el body/query/params contra un esquema Zod definido en `src/schemas/`. Si la validación falla, retorna:

```json
{
  "success": false,
  "status": 400,
  "message": "Error de validación",
  "errors": [
    { "field": "email", "message": "Email inválido" }
  ],
  "timestamp": "2026-07-26T..."
}
```

### Formato de Respuesta Estandarizado

Todas las respuestas siguen la interfaz `ApiResponse<T>`:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}
```

| Código | Significado |
|--------|-------------|
| `200` | Operación exitosa |
| `201` | Recurso creado |
| `204` | Recurso eliminado (sin contenido) |
| `400` | Error de validación |
| `401` | No autorizado / Token inválido |
| `403` | Acceso denegado (ownership check) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (duplicado) |
| `429` | Demasiadas solicitudes (rate limit) |
| `500` | Error interno del servidor |

---

## 🛡️ Seguridad

| Medida | Implementación |
|--------|---------------|
| **Contraseñas** | Hash con bcrypt (10 rondas) |
| **JWT** | Firma HMAC, payload mínimo (solo `userId`), expiración configurable |
| **CORS** | Orígenes permitidos desde variable de entorno |
| **Helmet** | Headers de seguridad HTTP (X-Frame-Options, CSP, etc.) |
| **Rate Limiting** | 10 req/min en rutas de autenticación |
| **JSON Limit** | Tamaño máximo de body: 1 MB |
| **Ownership Check** | Cada mutación verifica que el recurso pertenezca al usuario autenticado |
| **No exponer errores** | Los errores no controlados devuelven `500` sin detalles internos |

---

## 📊 Diagrama ER

```
┌─────────────────┐          ┌──────────────────┐
│      User       │          │     Category      │
├─────────────────┤          ├──────────────────┤
│ id (PK)         │──┐       │ id (PK)          │
│ email (UQ)      │  │       │ name             │
│ name            │  │       │ type (INCOME/    │
│ password (hash) │  │       │       EXPENSE)   │
│ createdAt       │  │       │ icon?            │
│ updatedAt       │  │       │ color?           │
└─────────────────┘  │       │ userId? (FK)     │
                     │       └────────┬─────────┘
                     │                │
                     │  ┌─────────────┘
                     ▼  ▼
               ┌──────────────────┐
               │   Transaction     │
               ├──────────────────┤
               │ id (PK)          │
               │ amount (Decimal) │
               │ description      │
               │ date             │
               │ type             │
               │ userId (FK)      │
               │ categoryId (FK)  │
               └──────────────────┘
                     │
                     │
                     ▼
               ┌──────────────────┐
               │     Budget        │
               ├──────────────────┤
               │ id (PK)          │
               │ amount (Decimal) │
               │ month (1-12)     │
               │ year             │
               │ categoryId? (FK) │
               │ userId (FK)      │
               └──────────────────┘
```

---

## 🚧 Mejoras Futuras

- [ ] **Roles y permisos** — Admin / User con diferentes niveles de acceso
- [ ] **Tags / Etiquetas** — Modelo N:M para clasificación adicional de transacciones
- [ ] **Presupuestos recurrentes** — Campo `isRecurring` + regla de copia automática
- [ ] **Notificaciones** — Alertas cuando un presupuesto está cerca del límite
- [ ] **Gráficos avanzados** — Endpoints optimizados para recharts (distribución por categoría, proyecciones)
- [ ] **Exportación CSV/PDF** — Descarga de reportes mensuales
- [ ] **Múltiples monedas** — Soporte para diferentes divisas con tasa de cambio
- [ ] **Refresh tokens** — Rotación de tokens JWT para mayor seguridad
- [ ] **Pruebas automatizadas** — Tests unitarios con Jest, tests de integración con Supertest
- [ ] **CI/CD** — Pipeline de GitHub Actions para lint, test y deploy

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**.

---

<p align="center">
  Desarrollado con ❤️ para el control de gastos personales
</p>
