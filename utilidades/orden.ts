export function ordenarDescendente<T extends { fecha: string }>(registros: T[]): T[] {
  return [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function ordenarAscendente<T extends { fecha: string }>(registros: T[]): T[] {
  return [...registros].sort((a, b) => a.fecha.localeCompare(b.fecha));
}
