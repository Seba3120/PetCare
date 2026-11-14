import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

type Propiedades = {
  icono: keyof typeof MaterialIcons.glyphMap;
  color: string;
  titulo: string;
  detalle: string;
  atenuada?: boolean;
  textoAccion?: string;
  alAccion?: () => void;
  alEditar?: () => void;
  alEliminar: () => void;
};

export function FilaRegistro({ icono, color, titulo, detalle, atenuada = false, textoAccion, alAccion, alEditar, alEliminar }: Propiedades) {
  return (
    <View style={[estilos.fila, atenuada && estilos.atenuada]}>
      <View style={[estilos.icono, { backgroundColor: color }]}>
        <MaterialIcons name={icono} size={18} color={Colores.marca.blanco} />
      </View>
      <View style={estilos.textos}>
        <TextoTema tipo="seminegrita" style={estilos.titulo}>{titulo}</TextoTema>
        <TextoTema style={estilos.detalle}>{detalle}</TextoTema>
        {textoAccion && alAccion && (
          <Pressable accessibilityRole="button" onPress={alAccion}>
            <TextoTema style={estilos.accion}>{textoAccion}</TextoTema>
          </Pressable>
        )}
      </View>
      {alEditar && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${titulo}`} onPress={alEditar} style={estilos.eliminar}>
          <MaterialIcons name="edit" size={20} color={Colores.marca.azul} />
        </Pressable>
      )}
      <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${titulo}`} onPress={alEliminar} style={estilos.eliminar}>
        <MaterialIcons name="delete-outline" size={21} color={Colores.marca.apagado} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    backgroundColor: Colores.marca.blanco,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  atenuada: { opacity: 0.55 },
  icono: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textos: { flex: 1, marginLeft: 12 },
  titulo: { color: Colores.marca.tinta, fontSize: 14, lineHeight: 20 },
  detalle: { color: Colores.marca.apagado, fontSize: 12, lineHeight: 17, marginTop: 3 },
  accion: { color: Colores.marca.azul, fontSize: 12, fontWeight: '800', marginTop: 8, lineHeight: 17 },
  eliminar: { padding: 6 },
});