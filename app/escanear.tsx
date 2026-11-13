import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CampoTexto } from '@/componentes/campo-texto';
import { PREFIJO_QR } from '@/componentes/modal-qr';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import { traducirError } from '@/utilidades/errores';

export default function PantallaEscanear() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { vincularPorCodigo } = usarPetcare();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [codigoManual, setCodigoManual] = useState('');

  const vincular = async (texto: string) => {
    if (procesando) {
      return;
    }
    setProcesando(true);
    setMensaje('');
    try {
      await vincularPorCodigo(texto.replace(PREFIJO_QR, '').trim());
      router.back();
    } catch (fallo) {
      setMensaje(fallo instanceof Error ? traducirError(fallo.message) : 'No se pudo vincular la mascota.');
      setTimeout(() => setProcesando(false), 2500);
    }
  };

  return (
    <ScrollView contentContainerStyle={[estilos.contenido, { paddingTop: top + 24 }]} keyboardShouldPersistTaps="handled">
      <TextoTema tipo="subtitulo" style={estilos.titulo}>Vincular una mascota</TextoTema>
      <TextoTema style={estilos.subtitulo}>
        Escanea el código QR que te muestra el tutor para acceder a la ficha y poder actualizarla.
      </TextoTema>

      {permiso?.granted ? (
        <View style={estilos.contenedorCamara}>
          <CameraView
            style={estilos.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={procesando ? undefined : ({ data }) => vincular(data)}
          />
        </View>
      ) : (
        <View style={estilos.sinCamara}>
          <TextoTema style={estilos.textoSinCamara}>
            Para escanear necesitamos acceso a la cámara. También puedes escribir el código manualmente.
          </TextoTema>
          <BotonPrincipal texto="Permitir cámara" variante="contorno" alPresionar={() => solicitarPermiso()} />
        </View>
      )}

      {mensaje !== '' && <TextoTema style={estilos.error}>{mensaje}</TextoTema>}

      <View style={estilos.bloqueManual}>
        <CampoTexto
          etiqueta="O escribe el código"
          value={codigoManual}
          onChangeText={setCodigoManual}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <BotonPrincipal
          texto="Vincular con este código"
          alPresionar={() => vincular(codigoManual)}
          deshabilitado={procesando || codigoManual.trim() === ''}
        />
        <BotonPrincipal texto="Cerrar" variante="contorno" alPresionar={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 24, paddingTop: 36, backgroundColor: Colores.marca.fondo, flexGrow: 1 },
  titulo: { color: Colores.marca.tinta, fontSize: 22 },
  subtitulo: { color: Colores.marca.apagado, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 20 },
  contenedorCamara: { height: 300, borderRadius: 22, overflow: 'hidden', marginBottom: 14 },
  camara: { flex: 1 },
  sinCamara: { backgroundColor: Colores.marca.blanco, borderRadius: 18, padding: 18, marginBottom: 14, gap: 12 },
  textoSinCamara: { color: Colores.marca.apagado, fontSize: 13, lineHeight: 19 },
  error: { color: Colores.marca.error, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  bloqueManual: { marginTop: 10 },
});