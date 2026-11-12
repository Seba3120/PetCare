import { StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Punto = { etiqueta: string; valor: number };

type Propiedades = {
  puntos: Punto[];
  unidad: string;
};

const ALTURA_MINIMA = 24;
const ALTURA_MAXIMA = 110;

export function GraficoBarras({ puntos, unidad }: Propiedades) {
  const valores = puntos.map((punto) => punto.valor);
  const minimo = Math.min(...valores);
  const rango = Math.max(...valores) - minimo || 1;

  return (
    <View style={estilos.contenedor}>
      {puntos.map((punto, indice) => {
        const altura = ALTURA_MINIMA + ((punto.valor - minimo) / rango) * (ALTURA_MAXIMA - ALTURA_MINIMA);
        return (
          <View key={`${punto.etiqueta}-${indice}`} style={estilos.columna}>
            <TextoTema style={estilos.valor}>{punto.valor}</TextoTema>
            <View style={[estilos.barra, { height: altura }]} />
            <TextoTema style={estilos.etiqueta}>{punto.etiqueta}</TextoTema>
          </View>
        );
      })}
      <TextoTema style={estilos.unidad}>{unidad}</TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 20,
    padding: 16,
    paddingTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  columna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barra: { width: '70%', borderRadius: 8, backgroundColor: Colores.marca.menta },
  valor: { color: Colores.marca.tinta, fontSize: 10, fontWeight: '700', marginBottom: 4, lineHeight: 14 },
  etiqueta: { color: Colores.marca.apagado, fontSize: 9, marginTop: 6, lineHeight: 12 },
  unidad: { position: 'absolute', top: 6, right: 12, color: Colores.marca.apagado, fontSize: 10, lineHeight: 14 },
});
