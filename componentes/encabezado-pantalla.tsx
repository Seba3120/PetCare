import { StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  sobretitulo: string;
  titulo: string;
  subtitulo?: string;
};

export function EncabezadoPantalla({ sobretitulo, titulo, subtitulo }: Propiedades) {
  return (
    <View style={estilos.contenedor}>
      <TextoTema style={estilos.sobretitulo}>{sobretitulo}</TextoTema>
      <TextoTema tipo="titulo" style={estilos.titulo}>{titulo}</TextoTema>
      {subtitulo && <TextoTema style={estilos.subtitulo}>{subtitulo}</TextoTema>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 22 },
  sobretitulo: { color: Colores.marca.coral, fontSize: 11, letterSpacing: 1.7, fontWeight: '800', marginBottom: 7 },
  titulo: { color: Colores.marca.tinta, fontSize: 30, lineHeight: 36 },
  subtitulo: { color: Colores.marca.apagado, fontSize: 14, lineHeight: 21, marginTop: 7, maxWidth: 300 },
});
