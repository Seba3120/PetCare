import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const LLAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigurado = URL_SUPABASE !== '' && LLAVE_SUPABASE !== '';

export const supabase = createClient(
  supabaseConfigurado ? URL_SUPABASE : 'https://sin-configurar.supabase.co',
  supabaseConfigurado ? LLAVE_SUPABASE : 'sin-configurar',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

AppState.addEventListener('change', (estado) => {
  if (estado === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});