import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  titulo: string;
  subtitulo: string;
  alCerrar: () => void;
  children: ReactNode;
};

export function HojaModal({ titulo, subtitulo, alCerrar, children }: Propiedades) {
  return (
    <Modal animationType="slide" transparent visible onRequestClose={alCerrar}>
      <KeyboardAvoidingView behavior="padding" style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <View style={estilos.encabezado}>
            <View style={estilos.textos}>
              <TextoTema tipo="subtitulo" style={estilos.titulo}>{titulo}</TextoTema>
              <TextoTema style={estilos.subtitulo}>{subtitulo}</TextoTema>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={alCerrar}>
              <MaterialIcons name="close" size={23} color={Colores.marca.tinta} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(20, 47, 57, 0.42)', justifyContent: 'flex-end' },
  tarjeta: {
    backgroundColor: Colores.marca.fondo,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 34,
    maxHeight: '92%',
  },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  textos: { flex: 1, paddingRight: 12 },
  titulo: { color: Colores.marca.tinta, fontSize: 22 },
  subtitulo: { color: Colores.marca.apagado, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
