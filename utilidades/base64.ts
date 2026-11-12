const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const TABLA = new Int16Array(128).fill(-1);

for (let indice = 0; indice < ALFABETO.length; indice++) {
  TABLA[ALFABETO.charCodeAt(indice)] = indice;
}

export function decodificarBase64(texto: string): ArrayBuffer {
  const limpio = texto.replace(/[^A-Za-z0-9+/]/g, '');
  const memoria = new ArrayBuffer(Math.floor((limpio.length * 3) / 4));
  const bytes = new Uint8Array(memoria);
  let posicion = 0;

  for (let indice = 0; indice < limpio.length; indice += 4) {
    const a = TABLA[limpio.charCodeAt(indice)];
    const b = TABLA[limpio.charCodeAt(indice + 1)];
    const c = indice + 2 < limpio.length ? TABLA[limpio.charCodeAt(indice + 2)] : -1;
    const d = indice + 3 < limpio.length ? TABLA[limpio.charCodeAt(indice + 3)] : -1;

    bytes[posicion++] = (a << 2) | (b >> 4);
    if (c !== -1) {
      bytes[posicion++] = ((b & 15) << 4) | (c >> 2);
    }
    if (d !== -1) {
      bytes[posicion++] = ((c & 3) << 6) | d;
    }
  }

  return memoria.slice(0, posicion);
}
