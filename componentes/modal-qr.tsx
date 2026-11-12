import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { HojaModal } from '@/componentes/hoja-modal';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import type { Mascota } from '@/tipos/modelos';

export const PREFIJO_QR = 'PETCARE:';

type Propiedades = {
  mascota: Mascota;
  alRenovar: () => void;
  alCerrar: () => void;
};

export function ModalQr({ mascota, alRenovar, alCerrar }: Propiedades) {
  return (
    <HojaModal
      titulo={`Código QR de ${mascota.nombre}`}
      subtitulo="Muéstralo a tu veterinario para que pueda ver y actualizar su ficha."
      alCerrar={alCerrar}>
      <View style={estilos.centrado}>
        <View style={estilos.marco}>
          <QRCode value={`${PREFIJO_QR}${mascota.codigoQr}`} size={210} />
        </View>
        <TextoTema style={estilos.etiqueta}>Código manual</TextoTema>
        <TextoTema selectable style={estilos.codigo}>{mascota.codigoQr}</TextoTema>
      </View>
      <BotonPrincipal texto="Renovar código" variante="contorno" alPresionar={alRenovar} />
    </HojaModal>
  );
}

const estilos = StyleSheet.create({
  centrado: { alignItems: 'center', marginBottom: 20 },
  marco: { backgroundColor: Colores.marca.blanco, borderRadius: 20, padding: 18 },
  etiqueta: { color: Colores.marca.apagado, fontSize: 11, marginTop: 18, lineHeight: 15 },
  codigo: { color: Colores.marca.tinta, fontSize: 12, fontWeight: '700', marginTop: 4, lineHeight: 18 },
});
