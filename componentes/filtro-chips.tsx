import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades<T extends string> = {
  opciones: { valor: T; etiqueta: string }[];
  valor: T;
  alCambiar: (valor: T) => void;
};

export function FiltroChips<T extends string>({ opciones, valor, alCambiar }: Propiedades<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            accessibilityRole="button"
            onPress={() => alCambiar(opcion.valor)}
            style={[estilos.chip, activa && estilos.chipActivo]}>
            <TextoTema style={[estilos.texto, activa && estilos.textoActivo]}>{opcion.etiqueta}</TextoTema>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 10 },
  chip: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colores.marca.linea,
  },
  chipActivo: { backgroundColor: Colores.marca.azul, borderColor: Colores.marca.azul },
  texto: { color: Colores.marca.azul, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  textoActivo: { color: Colores.marca.blanco },
});
