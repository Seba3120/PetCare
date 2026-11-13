import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CampoTexto } from '@/componentes/campo-texto';
import { MarcoAcceso } from '@/componentes/marco-acceso';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';

export default function PantallaAcceso() {
  const { iniciarSesion, errorInicio } = usarPetcare();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(correo, clave);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo iniciar sesión.');
      setEnviando(false);
    }
  };

  return (
    <MarcoAcceso titulo="Bienvenido de vuelta" subtitulo="Inicia sesión para ver la información de tus mascotas.">
      <CampoTexto
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto etiqueta="Contraseña" value={clave} onChangeText={setClave} secureTextEntry autoCapitalize="none" />
      {(error || errorInicio) !== '' && <TextoTema style={estilos.error}>{error || errorInicio}</TextoTema>}
      <BotonPrincipal texto={enviando ? 'Ingresando...' : 'Iniciar sesión'} alPresionar={entrar} deshabilitado={enviando} />
      <View style={estilos.pie}>
        <TextoTema style={estilos.textoPie}>¿Aún no tienes cuenta? </TextoTema>
        <Link href="/registro" style={estilos.enlace}>Regístrate</Link>
      </View>
    </MarcoAcceso>
  );
}

const estilos = StyleSheet.create({
  error: { color: Colores.marca.error, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  pie: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  textoPie: { color: Colores.marca.apagado, fontSize: 13, lineHeight: 20 },
  enlace: { color: Colores.marca.coral, fontSize: 13, fontWeight: '800', lineHeight: 20 },
});