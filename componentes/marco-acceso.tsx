import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
};

export function MarcoAcceso({ titulo, subtitulo, children }: Propiedades) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={estilos.marca}>
          <View style={estilos.icono}>
            <TextoTema style={estilos.huella}>🐾</TextoTema>
          </View>
          <TextoTema style={estilos.sobretitulo}>PETCARE CLUB</TextoTema>
          <TextoTema tipo="titulo" style={estilos.titulo}>{titulo}</TextoTema>
          <TextoTema style={estilos.subtitulo}>{subtitulo}</TextoTema>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.marca.fondo },
  contenido: { padding: 24, paddingTop: 72, paddingBottom: 36, width: '100%', maxWidth: 520, alignSelf: 'center' },
  marca: { marginBottom: 28 },
  icono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colores.marca.azul,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  huella: { fontSize: 30, lineHeight: 36 },
  sobretitulo: { color: Colores.marca.coral, fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 7 },
  titulo: { color: Colores.marca.tinta, fontSize: 28, lineHeight: 34 },
  subtitulo: { color: Colores.marca.apagado, fontSize: 14, lineHeight: 21, marginTop: 7 },
});
