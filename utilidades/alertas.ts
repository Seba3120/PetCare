import { Alert } from 'react-native';

export function confirmar(titulo: string, mensaje: string, textoAccion: string, alAceptar: () => void) {
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: 'destructive', onPress: alAceptar },
  ]);
}
