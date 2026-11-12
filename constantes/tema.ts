import { Platform } from 'react-native';

export const Colores = {
  marca: {
    azul: '#176B70',
    coral: '#F47B63',
    tinta: '#17343A',
    fondo: '#F7F8F5',
    blanco: '#FFFFFF',
    apagado: '#789096',
    linea: '#E5ECEA',
    azulSuave: '#E3F2EF',
    coralSuave: '#FFF0EA',
    menta: '#65BFAE',
    error: '#C0392B',
  },
  claro: {
    texto: '#11181C',
    fondo: '#fff',
  },
  oscuro: {
    texto: '#ECEDEE',
    fondo: '#151718',
  },
};

export const Fuentes = Platform.select({
  ios: {
    redondeada: 'ui-rounded',
  },
  default: {
    redondeada: 'normal',
  },
  web: {
    redondeada: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
  },
});
