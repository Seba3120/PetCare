import type { Mascota, Visita } from '@/tipos/modelos';
import { hoyIso } from '@/utilidades/fechas';

export type EventoProximo = {
  fecha: string;
  titulo: string;
  clinica: string;
};

export function obtenerProximoEvento(mascota: Mascota): EventoProximo | undefined {
  const hoy = hoyIso();
  const candidatos: EventoProximo[] = [
    ...mascota.visitas.map((visita) => ({ fecha: visita.fecha, titulo: visita.titulo, clinica: visita.clinica })),
    ...mascota.controles.map((control) => ({ fecha: control.fecha, titulo: control.titulo, clinica: control.clinica })),
  ];
  return candidatos
    .filter((evento) => evento.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
}

export function obtenerUltimaVisita(visitas: Visita[]): Visita | undefined {
  const hoy = hoyIso();
  return visitas
    .filter((visita) => visita.fecha < hoy)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}
