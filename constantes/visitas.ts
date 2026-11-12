import type { MaterialIcons } from '@expo/vector-icons';

import { Colores } from '@/constantes/tema';
import type { TipoVisita } from '@/tipos/modelos';

export const TIPOS_VISITA: TipoVisita[] = ['consulta', 'vacuna', 'peso'];

export const ESTILOS_VISITA: Record<
  TipoVisita,
  { etiqueta: string; icono: keyof typeof MaterialIcons.glyphMap; color: string }
> = {
  consulta: { etiqueta: 'Consulta', icono: 'medical-services', color: Colores.marca.coral },
  vacuna: { etiqueta: 'Vacuna', icono: 'vaccines', color: Colores.marca.azul },
  peso: { etiqueta: 'Control de peso', icono: 'monitor-weight', color: Colores.marca.menta },
};
