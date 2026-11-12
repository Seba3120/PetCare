import { Pressable, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Opcion<T extends string> = { valor: T; etiqueta: string };

type Propiedades<T extends string> = {
  etiqueta: string;
  opciones: Opcion<T>[];
  valor: T;
  alCambiar: (valor: T) => void;
};

export function SelectorOpciones<T extends string>({ etiqueta, opciones, valor, alCambiar }: Propiedades<T>) {
  return (
    <View style={estilos.contenedor}>
      <TextoTema style={estilos.etiqueta}>{etiqueta}</TextoTema>
      <View style={estilos.fila}>
        {opciones.map((opcion) => {
          const activa = opcion.valor === valor;
          return (
            <Pressable
              key={opcion.valor}
              accessibilityRole="button"
              onPress={() => alCambiar(opcion.valor)}
              style={[estilos.opcion, activa && estilos.opcionActiva]}>
              <TextoTema style={[estilos.textoOpcion, activa && estilos.textoOpcionActiva]}>
                {opcion.etiqueta}
              </TextoTema>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 15 },
  etiqueta: { color: Colores.marca.apagado, fontSize: 12, fontWeight: '700', marginBottom: 7 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colores.marca.linea,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  opcionActiva: { backgroundColor: Colores.marca.azul, borderColor: Colores.marca.azul },
  textoOpcion: { color: Colores.marca.azul, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  textoOpcionActiva: { color: Colores.marca.blanco },
});
