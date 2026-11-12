import { StyleSheet, Text, type TextProps } from 'react-native';

import { usarColorTema } from '@/ganchos/usar-color-tema';

export type PropiedadesTextoTema = TextProps & {
  colorClaro?: string;
  colorOscuro?: string;
  tipo?: 'normal' | 'titulo' | 'seminegrita' | 'subtitulo' | 'enlace';
};

export function TextoTema({
  style,
  colorClaro,
  colorOscuro,
  tipo = 'normal',
  ...resto
}: PropiedadesTextoTema) {
  const color = usarColorTema({ claro: colorClaro, oscuro: colorOscuro }, 'texto');

  return (
    <Text
      style={[
        { color },
        tipo === 'normal' ? estilos.normal : undefined,
        tipo === 'titulo' ? estilos.titulo : undefined,
        tipo === 'seminegrita' ? estilos.seminegrita : undefined,
        tipo === 'subtitulo' ? estilos.subtitulo : undefined,
        tipo === 'enlace' ? estilos.enlace : undefined,
        style,
      ]}
      {...resto}
    />
  );
}

const estilos = StyleSheet.create({
  normal: {
    fontSize: 16,
    lineHeight: 24,
  },
  seminegrita: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  enlace: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
