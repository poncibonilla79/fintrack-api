import type { OpenAPIV3 } from 'openapi-types';

export const openapiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'FinTrack API',
    version: '1.0.0',
    description: 'API de control de gastos personales',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Desarrollo' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          status: { type: 'integer' },
          message: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar estado del servidor y base de datos',
        responses: {
          '200': { description: 'API funcionando correctamente' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Usuario Demo' },
                  email: { type: 'string', format: 'email', example: 'demo@fintrack.com' },
                  password: { type: 'string', format: 'password', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario registrado exitosamente' },
          '409': { description: 'Email ya registrado' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'demo@fintrack.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Inicio de sesion exitoso' },
          '401': { description: 'Credenciales invalidas' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener perfil del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil obtenido exitosamente' },
          '401': { description: 'No autenticado' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar todos los usuarios',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de usuarios' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Crear un nuevo usuario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Nuevo Usuario' },
                  email: { type: 'string', format: 'email', example: 'nuevo@email.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Usuario creado' } },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Usuario encontrado' }, '404': { description: 'No encontrado' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar usuario (solo propio)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Nombre Actualizado' },
                  email: { type: 'string', format: 'email', example: 'actualizado@email.com' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Usuario actualizado' }, '404': { description: 'No encontrado' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Eliminar usuario (solo propio)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Eliminado' }, '404': { description: 'No encontrado' } },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorias (globales + propias)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de categorias' } },
      },
      post: {
        tags: ['Categories'],
        summary: 'Crear categoria personal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Transporte' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                  icon: { type: 'string', example: 'car' },
                  color: { type: 'string', example: '#3b82f6' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Categoria creada' } },
      },
    },
    '/api/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Actualizar categoria (solo propias)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Categoria actualizada' } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Eliminar categoria (solo propias)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Eliminada' } },
      },
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Listar transacciones (?month=&year= opcional)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Lista de transacciones' } },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Crear transaccion',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'description', 'date', 'type', 'categoryId'],
                properties: {
                  amount: { type: 'number', example: 150.50 },
                  description: { type: 'string', example: 'Gasolina' },
                  date: { type: 'string', format: 'date-time' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Transaccion creada' } },
      },
    },
    '/api/transactions/{id}': {
      put: {
        tags: ['Transactions'],
        summary: 'Actualizar transaccion (solo propia)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Transaccion actualizada' } },
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Eliminar transaccion (solo propia)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Eliminada' } },
      },
    },
    '/api/budgets': {
      get: {
        tags: ['Budgets'],
        summary: 'Listar presupuestos (?month=&year= obligatorio)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Lista de presupuestos' } },
      },
      post: {
        tags: ['Budgets'],
        summary: 'Crear presupuesto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'month', 'year'],
                properties: {
                  amount: { type: 'number', example: 5000 },
                  month: { type: 'integer', example: 7 },
                  year: { type: 'integer', example: 2026 },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Presupuesto creado' } },
      },
    },
    '/api/budgets/{id}': {
      put: {
        tags: ['Budgets'],
        summary: 'Actualizar presupuesto',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Presupuesto actualizado' } },
      },
      delete: {
        tags: ['Budgets'],
        summary: 'Eliminar presupuesto',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Eliminado' } },
      },
    },
    '/api/reports/monthly': {
      get: {
        tags: ['Reports'],
        summary: 'Resumen mensual de ingresos/gastos',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Resumen mensual' } },
      },
    },
    '/api/reports/budget': {
      get: {
        tags: ['Reports'],
        summary: 'Comparacion presupuesto vs real',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Comparacion presupuesto vs real' } },
      },
    },
    '/api/reports/trends': {
      get: {
        tags: ['Reports'],
        summary: 'Tendencia mensual (ultimos N meses)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'months', in: 'query', schema: { type: 'integer', default: 6 } },
        ],
        responses: { '200': { description: 'Tendencia mensual' } },
      },
    },
  },
};
