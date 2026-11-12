const TRADUCCIONES: [string, string][] = [
  ['Invalid login credentials', 'Correo o contraseña incorrectos.'],
  ['User already registered', 'Ya existe una cuenta con ese correo.'],
  ['Password should be at least', 'La contraseña debe tener al menos 6 caracteres.'],
  ['Unable to validate email address', 'Ingresa un correo válido.'],
  ['Email not confirmed', 'Debes confirmar tu correo antes de iniciar sesión.'],
  ['Network request failed', 'No hay conexión con el servidor. Revisa tu internet.'],
  ['mascotas_nombre_unico', 'Ya tienes una mascota con ese nombre.'],
  ['vacunas_unica', 'Ya registraste esta vacuna en esa fecha.'],
  ['duplicate key', 'Ya existe un registro igual.'],
  ['violates check constraint', 'Algún valor está fuera del rango permitido.'],
  ['row-level security', 'No tienes permiso para realizar esta acción.'],
];

export function traducirError(mensaje: string): string {
  const coincidencia = TRADUCCIONES.find(([fragmento]) => mensaje.includes(fragmento));
  return coincidencia ? coincidencia[1] : mensaje;
}
