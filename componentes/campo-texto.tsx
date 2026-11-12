import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = TextInputProps & {
  etiqueta: string;
};

export function CampoTexto({ etiqueta, style, ...resto }: Propiedades) {
  return (
    <View style={estilos.campo}>
      <TextoTema style={estilos.etiqueta}>{etiqueta}</TextoTema>
      <TextInput
        placeholderTextColor={Colores.marca.apagado}
        style={[estilos.entrada, style]}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: 15 },
  etiqueta: { color: Colores.marca.apagado, fontSize: 12, fontWeight: '700', marginBottom: 7 },
  entrada: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colores.marca.linea,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colores.marca.tinta,
    fontSize: 15,
  },
});
