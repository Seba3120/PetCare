import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '@/global.css';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { ProveedorPetcare, usarPetcare } from '@/contextos/contexto-petcare';
import { usarEsquemaColor } from '@/ganchos/usar-esquema-color';
import { supabaseConfigurado } from '@/servicios/supabase';

const estiloCentrado = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: Colores.marca.fondo,
  padding: 32,
};

function NavegacionRaiz() {
  const { usuario, cargando } = usarPetcare();

  if (!supabaseConfigurado) {
    return (
      <View style={estiloCentrado}>
        <TextoTema tipo="subtitulo" style={{ color: Colores.marca.tinta, textAlign: 'center' }}>
          Falta configurar Supabase
        </TextoTema>
        <TextoTema style={{ color: Colores.marca.apagado, textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 21 }}>
          Crea el archivo .env a partir de .env.example con la URL y la llave pública de tu proyecto, y reinicia la app.
        </TextoTema>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={estiloCentrado}>
        <ActivityIndicator size="large" color={Colores.marca.azul} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={usuario !== null}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="escanear" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={usuario === null}>
        <Stack.Screen name="acceso" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}

export default function DisposicionRaiz() {
  const esquemaColor = usarEsquemaColor();

  return (
    <ProveedorPetcare>
      <ThemeProvider value={esquemaColor === 'dark' ? DarkTheme : DefaultTheme}>
        <NavegacionRaiz />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ProveedorPetcare>
  );
}
