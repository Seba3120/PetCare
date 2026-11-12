import { ETIQUETAS_TIPO_VACUNA, NOMBRES_INDICADOR, UNIDADES_INDICADOR } from '@/constantes/registros';
import type { Mascota, Usuario } from '@/tipos/modelos';
import { formatearFechaCompleta, hoyIso } from '@/utilidades/fechas';
import { formatearCodigo } from '@/utilidades/mascotas';

function seccion(titulo: string, lineas: string[]): string {
  return [titulo, ...(lineas.length > 0 ? lineas.map((linea) => `- ${linea}`) : ['- Sin registros'])].join('\n');
}

export function generarResumenVeterinario(mascota: Mascota, usuario: Usuario): string {
  const hoy = hoyIso();

  const vacunas = mascota.vacunas.map((vacuna) => {
    const proxima = vacuna.proximaDosis ? ` (próxima: ${formatearFechaCompleta(vacuna.proximaDosis)})` : '';
    return `${vacuna.nombre} · ${ETIQUETAS_TIPO_VACUNA[vacuna.tipo]} · ${formatearFechaCompleta(vacuna.fecha)}${proxima}`;
  });

  const mediciones = mascota.indicadores
    .slice(0, 5)
    .map(
      (indicador) =>
        `${NOMBRES_INDICADOR[indicador.tipo]}: ${indicador.valor} ${UNIDADES_INDICADOR[indicador.tipo]} · ${formatearFechaCompleta(indicador.fecha)}`
    );

  const medicamentos = mascota.medicamentos
    .filter((medicamento) => medicamento.activo)
    .map((medicamento) => `${medicamento.nombre} · ${medicamento.dosis} · ${medicamento.frecuencia}`);

  const visitas = mascota.visitas
    .filter((visita) => visita.fecha <= hoy)
    .slice(0, 5)
    .map((visita) => `${formatearFechaCompleta(visita.fecha)} · ${visita.titulo} · ${visita.clinica}`);

  const controles = mascota.controles
    .filter((control) => control.fecha >= hoy)
    .map((control) => `${formatearFechaCompleta(control.fecha)} ${control.hora} · ${control.titulo}`);

  return [
    `FICHA DE ${mascota.nombre.toUpperCase()} (${formatearCodigo(mascota)})`,
    `Especie: ${mascota.tipo} · Raza: ${mascota.raza} · Sexo: ${mascota.sexo}`,
    `Nacimiento: ${mascota.fechaNacimiento ? formatearFechaCompleta(mascota.fechaNacimiento) : 'sin dato'} (${mascota.edad || 'edad sin dato'})`,
    `Color de pelaje: ${mascota.colorPelaje || 'sin dato'} · Peso: ${mascota.peso || 'sin dato'}`,
    usuario.rol === 'tutor'
      ? `Tutor: ${usuario.nombre} (${usuario.correo})`
      : `Tutor: ${mascota.tutorNombre}`,
    '',
    seccion('VACUNAS Y DESPARASITACIONES', vacunas),
    '',
    seccion('ÚLTIMAS MEDICIONES', mediciones),
    '',
    seccion('MEDICAMENTOS ACTIVOS', medicamentos),
    '',
    seccion('ÚLTIMAS VISITAS', visitas),
    '',
    seccion('PRÓXIMOS CONTROLES', controles),
    '',
    'Generado con PetCare Club',
  ].join('\n');
}
