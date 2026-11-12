import { Pressable, StyleSheet } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  texto: string;
  alPresionar: () => void;
  variante?: 'relleno' | 'contorno';
  deshabilitado?: boolean;
};

export function BotonPrincipal({ texto, alPresionar, variante = 'relleno', deshabilitado = false }: Propiedades) {
  const esContorno = variante === 'contorno';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={deshabilitado}
      onPress={alPresionar}
      style={[estilos.boton, esContorno && estilos.contorno, deshabilitado && estilos.deshabilitado]}>
      <TextoTema style={[estilos.texto, esContorno && estilos.textoContorno]}>{texto}</TextoTema>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    backgroundColor: Colores.marca.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 3,
  },
  contorno: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colores.marca.coral,
  },
  deshabilitado: { opacity: 0.6 },
  texto: { color: Colores.marca.blanco, fontWeight: '800', fontSize: 15, lineHeight: 20 },
  textoContorno: { color: Colores.marca.coral },
});
