import type { Mascota } from '@/tipos/modelos';
import { hoyIso, isoADmy } from '@/utilidades/fechas';

export const FORMATO_CORREO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
export const CARACTERES_NO_ASCII = /[^\u0020-\u007E]/;
export const FORMATO_CODIGO_QR = /^[0-9a-f]{32}$/i;
export const CONTIENE_LETRAS = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/;

export function validarCorreo(correo: string): string | null {
  const texto = correo.trim();
  if (!texto) {
    return 'Ingresa tu correo.';
  }
  if (CARACTERES_NO_ASCII.test(texto)) {
    return 'El correo no puede tener tildes ni la letra ñ. Por ejemplo: duenomascota@gmail.com';
  }
  if (!FORMATO_CORREO.test(texto)) {
    return 'Ingresa un correo válido, por ejemplo nombre@gmail.com.';
  }
  return null;
}

export function validarClave(clave: string): string | null {
  if (clave.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (clave.length > 72) {
    return 'La contraseña no puede superar los 72 caracteres.';
  }
  if (!/[A-Za-z]/.test(clave) || !/\d/.test(clave)) {
    return 'La contraseña debe incluir letras y números.';
  }
  return null;
}

export function validarTextoConLetras(texto: string, etiqueta: string, minimo: number, maximo: number): string | null {
  const limpio = texto.trim();
  if (limpio.length < minimo) {
    return `${etiqueta}: escribe al menos ${minimo} caracteres.`;
  }
  if (limpio.length > maximo) {
    return `${etiqueta}: máximo ${maximo} caracteres.`;
  }
  if (!CONTIENE_LETRAS.test(limpio)) {
    return `${etiqueta}: debe contener letras, no solo números o símbolos.`;
  }
  return null;
}

export function mensajeAnteriorNacimiento(
  fechaIso: string,
  mascota: Pick<Mascota, 'nombre' | 'fechaNacimiento'>
): string | null {
  if (mascota.fechaNacimiento && fechaIso < mascota.fechaNacimiento) {
    return `La fecha no puede ser anterior al nacimiento de ${mascota.nombre} (${isoADmy(mascota.fechaNacimiento)}).`;
  }
  return null;
}

export function mensajeEnElPasado(fechaIso: string, hora: string): string | null {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const [horas, minutos] = (hora || '23:59').split(':').map(Number);
  const momento = new Date(anio, mes - 1, dia, horas, minutos).getTime();
  return momento < Date.now() ? 'La fecha y la hora no pueden estar en el pasado.' : null;
}

export function nacimientoIrreal(fechaIso: string): boolean {
  const limite = `${new Date().getFullYear() - 40}${hoyIso().slice(4)}`;
  return fechaIso < limite;
}