import { Colores } from '@/constantes/tema';
import { usarEsquemaColor } from '@/ganchos/usar-esquema-color';

export function usarColorTema(
  propiedades: { claro?: string; oscuro?: string },
  nombreColor: keyof typeof Colores.claro & keyof typeof Colores.oscuro
) {
  const esquema = usarEsquemaColor() ?? 'light';
  const colorDePropiedad = esquema === 'dark' ? propiedades.oscuro : propiedades.claro;

  if (colorDePropiedad) {
    return colorDePropiedad;
  }

  return esquema === 'dark' ? Colores.oscuro[nombreColor] : Colores.claro[nombreColor];
}
