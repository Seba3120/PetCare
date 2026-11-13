import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colores } from '@/constantes/tema';

export function CortinaEstado() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top, backgroundColor: Colores.marca.fondo, zIndex: 10 }}
    />
  );
}