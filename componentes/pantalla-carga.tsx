import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';

export function PantallaCarga() {
  const [lenta, setLenta] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setLenta(true), 10000);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <View style={estilos.pantalla}>
      <ActivityIndicator size="large" color={Colores.marca.azul} />
      <TextoTema style={estilos.texto}>
        {lenta ? 'Esto está tardando más de lo normal. Revisa tu conexión a internet.' : 'Conectando...'}
      </TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colores.marca.fondo,
    padding: 32,
  },
  texto: { color: Colores.marca.apagado, textAlign: 'center', marginTop: 12, fontSize: 13, lineHeight: 19 },
});