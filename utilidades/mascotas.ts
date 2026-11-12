import type { Mascota } from '@/tipos/modelos';

export function formatearCodigo(mascota: Pick<Mascota, 'numero'>): string {
  return `PC-${String(mascota.numero).padStart(3, '0')}`;
}

export function calcularIniciales(nombre: string): string {
  return nombre.trim().slice(0, 2).toUpperCase() || '??';
}
