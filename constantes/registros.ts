import type { TipoIndicador, TipoVacuna } from '@/tipos/modelos';

export const ETIQUETAS_TIPO_VACUNA: Record<TipoVacuna, string> = {
  vacuna: 'Vacuna',
  desparasitacion: 'Desparasitación',
};

export const NOMBRES_INDICADOR: Record<TipoIndicador, string> = {
  peso: 'Peso',
  temperatura: 'Temperatura',
};

export const UNIDADES_INDICADOR: Record<TipoIndicador, string> = {
  peso: 'kg',
  temperatura: '°C',
};
