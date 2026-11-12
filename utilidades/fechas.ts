const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

export function hoyIso(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function obtenerAnio(fechaIso: string): string {
  return fechaIso.slice(0, 4);
}

export function formatearDia(fechaIso: string): string {
  const [, mes, dia] = fechaIso.split('-');
  return `${dia} ${MESES[Number(mes) - 1]}`;
}

export function formatearFechaCompleta(fechaIso: string): string {
  return `${formatearDia(fechaIso)} ${obtenerAnio(fechaIso)}`;
}

export function isoADmy(fechaIso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
    return fechaIso;
  }
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}-${mes}-${anio}`;
}

export function dmyAIso(texto: string): string {
  const coincidencia = texto.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!coincidencia) {
    return texto.trim();
  }
  return `${coincidencia[3]}-${coincidencia[2].padStart(2, '0')}-${coincidencia[1].padStart(2, '0')}`;
}

export function calcularEdad(nacimientoIso: string): string {
  if (!fechaValida(nacimientoIso)) {
    return '';
  }
  const [anioNac, mesNac, diaNac] = nacimientoIso.split('-').map(Number);
  const [anioHoy, mesHoy, diaHoy] = hoyIso().split('-').map(Number);
  let meses = (anioHoy - anioNac) * 12 + (mesHoy - mesNac);
  if (diaHoy < diaNac) {
    meses -= 1;
  }
  if (meses < 0) {
    return '';
  }
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoMeses = `${resto} ${resto === 1 ? 'mes' : 'meses'}`;
  if (anios === 0) {
    return textoMeses;
  }
  const textoAnios = `${anios} ${anios === 1 ? 'año' : 'años'}`;
  return resto === 0 ? textoAnios : `${textoAnios} y ${textoMeses}`;
}
