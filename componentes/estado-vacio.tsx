import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  icono: keyof typeof MaterialIcons.glyphMap;
  texto: string;
};

export function EstadoVacio({ icono, texto }: Propiedades) {
  return (
    <View style={estilos.tarjeta}>
      <MaterialIcons name={icono} size={23} color={Colores.marca.apagado} />
      <TextoTema style={estilos.texto}>{texto}</TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  texto: { color: Colores.marca.apagado, fontSize: 12, lineHeight: 18, flex: 1 },
});
