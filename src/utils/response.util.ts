// ═══════════════════════════════════════════════════════════════════════════
// Estandarización de respuestas HTTP
//
// Todas las respuestas de la API siguen esta estructura:
//   { success, status, message, data?, error?, timestamp }
//
// El frontend (recharts, tablas) depende de este formato consistente.
// Si se cambia la estructura, actualizar también el tipo ApiResponse.
//
// Para agregar nuevos status:
//   1. Añadir entrada en MESSAGES
//   2. Crear nueva función sendX si tiene comportamiento distinto
// ═══════════════════════════════════════════════════════════════════════════

import { Response } from 'express';
import { ApiResponse } from '../types/api-response.types';

const MESSAGES: Record<number, string> = {
  200: 'Operación exitosa',
  201: 'Recurso creado exitosamente',
  204: 'Recurso eliminado exitosamente',
  400: 'Solicitud inválida',
  401: 'No autorizado',
  403: 'Acceso denegado',
  404: 'Recurso no encontrado',
  409: 'Conflicto',
  500: 'Error interno del servidor',
};

function timestamp(): string {
  return new Date().toISOString();
}

export function sendSuccess<T>(res: Response, data: T, message?: string) {
  const body: ApiResponse<T> = {
    success: true,
    status: 200,
    message: message ?? MESSAGES[200],
    data,
    timestamp: timestamp(),
  };
  res.json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string) {
  const body: ApiResponse<T> = {
    success: true,
    status: 201,
    message: message ?? MESSAGES[201],
    data,
    timestamp: timestamp(),
  };
  res.status(201).json(body);
}

export function sendError(res: Response, status: number, message?: string) {
  const msg = message ?? MESSAGES[status] ?? MESSAGES[500];
  const body: ApiResponse = {
    success: false,
    status,
    message: msg,
    error: msg,
    timestamp: timestamp(),
  };
  res.status(status).json(body);
}

export function sendNoContent(res: Response) {
  res.status(204).send();
}
