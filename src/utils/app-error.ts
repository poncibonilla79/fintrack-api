// ═══════════════════════════════════════════════════════════════════════════
// Error controlado de aplicación
//
// Lleva un status HTTP para que el error middleware lo use directamente.
// Diferencia errores conocidos (AppError) de errores inesperados (500).
//
// Uso:
//   throw new AppError(404, 'Usuario no encontrado');
//   throw new AppError(409, 'El email ya existe');
//
// Para agregar metadata adicional (errores de validación):
//   Extender la clase con campo details: Record<string, string[]>
// ═══════════════════════════════════════════════════════════════════════════

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}
