import { Image, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import type { Mascota } from '@/tipos/modelos';

type Propiedades = {
  mascota: Pick<Mascota, 'fotoUrl' | 'color' | 'iniciales'>;
  tamano: number;
  radio?: number;
};

export function AvatarMascota({ mascota, tamano, radio }: Propiedades) {
  const caja = { width: tamano, height: tamano, borderRadius: radio ?? tamano / 3 };

  if (mascota.fotoUrl) {
    return <Image source={{ uri: mascota.fotoUrl }} style={caja} />;
  }

  return (
    <View style={[caja, estilos.centrado, { backgroundColor: mascota.color }]}>
      <TextoTema style={[estilos.texto, { fontSize: tamano / 3.2, lineHeight: tamano / 2.4 }]}>
        {mascota.iniciales}
      </TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  centrado: { justifyContent: 'center', alignItems: 'center' },
  texto: { color: '#FFFFFF', fontWeight: '800' },
});
