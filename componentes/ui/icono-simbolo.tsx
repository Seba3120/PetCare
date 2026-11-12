import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MapaIconos = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type NombreIcono = keyof typeof EQUIVALENCIAS;

const EQUIVALENCIAS = {
  'house.fill': 'home',
  'heart.fill': 'favorite',
  calendar: 'event',
  'doc.text.fill': 'description',
} as MapaIconos;

export function IconoSimbolo({
  name,
  size = 24,
  color,
  style,
}: {
  name: NombreIcono;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={EQUIVALENCIAS[name]} style={style} />;
}
