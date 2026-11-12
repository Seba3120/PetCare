import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CampoTexto } from '@/componentes/campo-texto';
import { MarcoAcceso } from '@/componentes/marco-acceso';
import { SelectorOpciones } from '@/componentes/selector-opciones';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import type { Rol } from '@/tipos/modelos';

const OPCIONES_ROL: { valor: Rol; etiqueta: string }[] = [
  { valor: 'tutor', etiqueta: 'Dueño de mascota' },
  { valor: 'veterinario', etiqueta: 'Veterinario' },
];

export default function PantallaRegistro() {
  const { registrarse } = usarPetcare();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [repetirClave, setRepetirClave] = useState('');
  const [rol, setRol] = useState<Rol>('tutor');
  const [clinica, setClinica] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const crearCuenta = async () => {
    setError('');
    if (clave !== repetirClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await registrarse(nombre, correo, clave, rol, clinica);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo crear la cuenta.');
      setEnviando(false);
    }
  };

  return (
    <MarcoAcceso titulo="Crea tu cuenta" subtitulo="Registra a tus mascotas y mantén su bienestar al día.">
      <SelectorOpciones etiqueta="Tipo de cuenta" opciones={OPCIONES_ROL} valor={rol} alCambiar={setRol} />
      <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
      {rol === 'veterinario' && (
        <CampoTexto etiqueta="Clínica o consulta" value={clinica} onChangeText={setClinica} autoCapitalize="words" />
      )}
      <CampoTexto
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto etiqueta="Contraseña" value={clave} onChangeText={setClave} secureTextEntry autoCapitalize="none" />
      <CampoTexto
        etiqueta="Repetir contraseña"
        value={repetirClave}
        onChangeText={setRepetirClave}
        secureTextEntry
        autoCapitalize="none"
      />
      {error !== '' && <TextoTema style={estilos.error}>{error}</TextoTema>}
      <BotonPrincipal texto={enviando ? 'Creando cuenta...' : 'Crear cuenta'} alPresionar={crearCuenta} deshabilitado={enviando} />
      <View style={estilos.pie}>
        <TextoTema style={estilos.textoPie}>¿Ya tienes cuenta? </TextoTema>
        <Link href="/acceso" style={estilos.enlace}>Inicia sesión</Link>
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
