import type { MaterialIcons } from '@expo/vector-icons';

import { Colores } from '@/constantes/tema';
import { ETIQUETAS_TIPO_VACUNA, NOMBRES_INDICADOR, UNIDADES_INDICADOR } from '@/constantes/registros';
import { ESTILOS_VISITA } from '@/constantes/visitas';
import type { Mascota } from '@/tipos/modelos';

export type EventoHistorial = {
  id: string;
  origen: 'visita' | 'vacuna' | 'indicador' | 'medicamento';
  fecha: string;
  titulo: string;
  detalle: string;
  icono: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

export function construirEventos(mascota: Mascota): EventoHistorial[] {
  const eventos: EventoHistorial[] = [
    ...mascota.visitas.map((visita) => ({
      id: visita.id,
      origen: 'visita' as const,
      fecha: visita.fecha,
      titulo: visita.titulo,
      detalle: visita.clinica,
      icono: ESTILOS_VISITA[visita.tipo].icono,
      color: ESTILOS_VISITA[visita.tipo].color,
    })),
    ...mascota.vacunas.map((vacuna) => ({
      id: vacuna.id,
      origen: 'vacuna' as const,
      fecha: vacuna.fecha,
      titulo: vacuna.nombre,
      detalle: ETIQUETAS_TIPO_VACUNA[vacuna.tipo],
      icono: 'vaccines' as const,
      color: Colores.marca.azul,
    })),
    ...mascota.indicadores.map((indicador) => ({
      id: indicador.id,
      origen: 'indicador' as const,
      fecha: indicador.fecha,
      titulo: `${NOMBRES_INDICADOR[indicador.tipo]}: ${indicador.valor} ${UNIDADES_INDICADOR[indicador.tipo]}`,
      detalle: 'Medición registrada',
      icono: 'monitor-weight' as const,
      color: Colores.marca.menta,
    })),
    ...mascota.medicamentos.map((medicamento) => ({
      id: medicamento.id,
      origen: 'medicamento' as const,
      fecha: medicamento.inicio,
      titulo: medicamento.nombre,
      detalle: `Inicio de tratamiento · ${medicamento.dosis}`,
      icono: 'medication' as const,
      color: Colores.marca.coral,
    })),
  ];
  return eventos.sort((a, b) => b.fecha.localeCompare(a.fecha));
}
