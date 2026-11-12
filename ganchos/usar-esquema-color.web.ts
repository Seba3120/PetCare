import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export function usarEsquemaColor() {
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setHidratado(true);
  }, []);

  const esquema = useColorScheme();

  if (hidratado) {
    return esquema;
  }

  return 'light';
}
