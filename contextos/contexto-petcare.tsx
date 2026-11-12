import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState } from 'react-native';

import * as repositorio from '@/servicios/repositorio';
import { cancelarTodas, pedirPermiso, sincronizarNotificaciones } from '@/servicios/notificaciones';
import { supabase } from '@/servicios/supabase';
import type {
  DatosControl,
  DatosIndicador,
  DatosMascota,
  DatosMedicamento,
  DatosRecordatorio,
  DatosVacuna,
  DatosVisita,
  FotoElegida,
  Mascota,
  Rol,
  Usuario,
} from '@/tipos/modelos';
import { traducirError } from '@/utilidades/errores';

const TABLAS_OBSERVADAS = [
  'mascotas',
  'visitas',
  'vacunas',
  'indicadores',
  'medicamentos',
  'controles',
  'recordatorios',
  'acceso_veterinarios',
];

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizarDatos(datos: DatosMascota): DatosMascota {
  return {
    ...datos,
    nombre: datos.nombre.trim(),
    raza: datos.raza.trim() || 'Sin raza indicada',
    colorPelaje: datos.colorPelaje.trim(),
    pesoKg: datos.pesoKg.trim(),
    detalle: datos.detalle.trim(),
  };
}

type ValorContextoPetcare = {
  cargando: boolean;
  usuario: Usuario | null;
  iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string, rol: Rol, clinica: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  activarNotificaciones: () => Promise<boolean>;
  mascotas: Mascota[];
  mascotaSeleccionada: Mascota | null;
  seleccionarMascota: (id: string) => void;
  agregarMascota: (datos: DatosMascota, foto: FotoElegida | null) => Promise<void>;
  actualizarMascota: (id: string, datos: DatosMascota, foto: FotoElegida | null) => Promise<void>;
  eliminarMascota: (id: string) => Promise<void>;
  renovarCodigoQr: (mascotaId: string) => Promise<void>;
  vincularPorCodigo: (codigo: string) => Promise<void>;
  quitarAcceso: (mascotaId: string, veterinarioId: string) => Promise<void>;
  agregarVisita: (mascotaId: string, datos: DatosVisita) => Promise<void>;
  eliminarVisita: (mascotaId: string, id: string) => Promise<void>;
  agregarVacuna: (mascotaId: string, datos: DatosVacuna) => Promise<void>;
  eliminarVacuna: (mascotaId: string, id: string) => Promise<void>;
  agregarIndicador: (mascotaId: string, datos: DatosIndicador) => Promise<void>;
  eliminarIndicador: (mascotaId: string, id: string) => Promise<void>;
  agregarMedicamento: (mascotaId: string, datos: DatosMedicamento) => Promise<void>;
  alternarMedicamento: (mascotaId: string, id: string) => Promise<void>;
  eliminarMedicamento: (mascotaId: string, id: string) => Promise<void>;
  agregarControl: (mascotaId: string, datos: DatosControl) => Promise<void>;
  eliminarControl: (mascotaId: string, id: string) => Promise<void>;
  agregarRecordatorio: (mascotaId: string, datos: DatosRecordatorio) => Promise<void>;
  eliminarRecordatorio: (mascotaId: string, id: string) => Promise<void>;
};

const ContextoPetcare = createContext<ValorContextoPetcare | null>(null);

export function ProveedorPetcare({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [idSeleccionado, setIdSeleccionado] = useState<string | null>(null);
  const referenciaUsuario = useRef<Usuario | null>(null);
  const referenciaMascotas = useRef<Mascota[]>([]);
  const referenciaVersion = useRef(0);
  const referenciaTemporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mascotaSeleccionada = mascotas.find((mascota) => mascota.id === idSeleccionado) ?? mascotas[0] ?? null;

  const fijarUsuario = (siguiente: Usuario | null) => {
    referenciaUsuario.current = siguiente;
    setUsuario(siguiente);
  };

  const limpiar = () => {
    referenciaVersion.current += 1;
    fijarUsuario(null);
    referenciaMascotas.current = [];
    setMascotas([]);
    setIdSeleccionado(null);
  };

  const recargar = async (pedirNotificaciones = false) => {
    const version = ++referenciaVersion.current;
    const lista = await repositorio.cargarMascotas();
    if (version !== referenciaVersion.current) {
      return;
    }
    referenciaMascotas.current = lista;
    setMascotas(lista);
    if (referenciaUsuario.current?.rol === 'tutor') {
      await sincronizarNotificaciones(lista, pedirNotificaciones);
    }
  };

  const programarRecarga = () => {
    if (referenciaTemporizador.current) {
      clearTimeout(referenciaTemporizador.current);
    }
    referenciaTemporizador.current = setTimeout(() => {
      recargar().catch(() => undefined);
    }, 400);
  };

  const abrirSesion = async (sesion: Session) => {
    const perfil = await repositorio.obtenerPerfil(sesion.user.id, sesion.user.email ?? '');
    fijarUsuario(perfil);
    await recargar();
  };

  useEffect(() => {
    const restaurarSesion = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await abrirSesion(data.session);
        }
      } catch {
        limpiar();
      } finally {
        setCargando(false);
      }
    };

    restaurarSesion();

    const { data: suscripcion } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') {
        setTimeout(limpiar, 0);
      }
    });

    return () => suscripcion.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const canal = supabase.channel(`cambios-${usuario.id}`);
    TABLAS_OBSERVADAS.forEach((tabla) => {
      canal.on('postgres_changes', { event: '*', schema: 'public', table: tabla }, programarRecarga);
    });
    canal.subscribe();

    const suscripcionEstado = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        programarRecarga();
      }
    });

    return () => {
      supabase.removeChannel(canal);
      suscripcionEstado.remove();
    };
  }, [usuario?.id]);

  const iniciarSesion = async (correo: string, clave: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (error) {
      throw new Error(traducirError(error.message));
    }
    await abrirSesion(data.session);
  };

  const registrarse = async (nombre: string, correo: string, clave: string, rol: Rol, clinica: string) => {
    if (!nombre.trim()) {
      throw new Error('Escribe tu nombre.');
    }
    if (rol === 'veterinario' && !clinica.trim()) {
      throw new Error('Indica el nombre de tu clínica o consulta.');
    }
    if (!FORMATO_CORREO.test(correo.trim())) {
      throw new Error('Ingresa un correo válido.');
    }
    if (clave.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: { data: { nombre: nombre.trim(), rol, clinica: clinica.trim() } },
    });
    if (error) {
      throw new Error(traducirError(error.message));
    }
    if (!data.session) {
      throw new Error('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
    }
    await abrirSesion(data.session);
  };

  const cerrarSesion = async () => {
    await cancelarTodas();
    await supabase.auth.signOut();
    limpiar();
  };

  const activarNotificaciones = async () => {
    const concedido = await pedirPermiso();
    if (concedido) {
      await sincronizarNotificaciones(referenciaMascotas.current, false);
    }
    return concedido;
  };

  const intentar = async (accion: () => Promise<void>, pedirNotificaciones = false) => {
    try {
      await accion();
      await recargar(pedirNotificaciones);
    } catch (fallo) {
      Alert.alert(
        'No se pudo completar la acción',
        fallo instanceof Error ? traducirError(fallo.message) : 'Intenta nuevamente.'
      );
    }
  };

  const buscarMascota = (id: string) => referenciaMascotas.current.find((mascota) => mascota.id === id);

  const agregarMascota = (datos: DatosMascota, foto: FotoElegida | null) =>
    intentar(async () => {
      if (!usuario) {
        return;
      }
      const id = await repositorio.crearMascota(usuario.id, normalizarDatos(datos));
      if (foto) {
        await repositorio.subirFotoMascota(usuario.id, id, foto, null);
      }
      setIdSeleccionado(id);
    });

  const actualizarMascota = (id: string, datos: DatosMascota, foto: FotoElegida | null) =>
    intentar(async () => {
      await repositorio.actualizarMascota(id, normalizarDatos(datos));
      if (foto && usuario) {
        await repositorio.subirFotoMascota(usuario.id, id, foto, buscarMascota(id)?.fotoUrl ?? null);
      }
    });

  const eliminarMascota = (id: string) =>
    intentar(async () => {
      const fotoUrl = buscarMascota(id)?.fotoUrl ?? null;
      await repositorio.borrarMascota(id);
      await repositorio.borrarFoto(fotoUrl);
      if (idSeleccionado === id) {
        setIdSeleccionado(null);
      }
    });

  const renovarCodigoQr = (mascotaId: string) => intentar(() => repositorio.renovarCodigo(mascotaId));

  const vincularPorCodigo = async (codigo: string) => {
    const mascotaId = await repositorio.vincularPorCodigo(codigo);
    await recargar();
    setIdSeleccionado(mascotaId);
  };

  const quitarAcceso = (mascotaId: string, veterinarioId: string) =>
    intentar(() => repositorio.quitarAcceso(mascotaId, veterinarioId));

  const agregarVisita = (mascotaId: string, datos: DatosVisita) =>
    intentar(() => repositorio.agregarVisita(mascotaId, datos));

  const eliminarVisita = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('visitas', id));

  const agregarVacuna = (mascotaId: string, datos: DatosVacuna) =>
    intentar(() => repositorio.agregarVacuna(mascotaId, datos), true);

  const eliminarVacuna = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('vacunas', id));

  const agregarIndicador = (mascotaId: string, datos: DatosIndicador) =>
    intentar(() => repositorio.agregarIndicador(mascotaId, datos));

  const eliminarIndicador = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('indicadores', id));

  const agregarMedicamento = (mascotaId: string, datos: DatosMedicamento) =>
    intentar(() => repositorio.agregarMedicamento(mascotaId, datos), true);

  const alternarMedicamento = (mascotaId: string, id: string) =>
    intentar(async () => {
      const medicamento = buscarMascota(mascotaId)?.medicamentos.find((candidato) => candidato.id === id);
      if (medicamento) {
        await repositorio.cambiarEstadoMedicamento(id, !medicamento.activo);
      }
    });

  const eliminarMedicamento = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('medicamentos', id));

  const agregarControl = (mascotaId: string, datos: DatosControl) =>
    intentar(() => repositorio.agregarControl(mascotaId, datos), true);

  const eliminarControl = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('controles', id));

  const agregarRecordatorio = (mascotaId: string, datos: DatosRecordatorio) =>
    intentar(() => repositorio.agregarRecordatorio(mascotaId, datos), true);

  const eliminarRecordatorio = (_mascotaId: string, id: string) =>
    intentar(() => repositorio.eliminarRegistro('recordatorios', id));

  const valor: ValorContextoPetcare = {
    cargando,
    usuario,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    activarNotificaciones,
    mascotas,
    mascotaSeleccionada,
    seleccionarMascota: setIdSeleccionado,
    agregarMascota,
    actualizarMascota,
    eliminarMascota,
    renovarCodigoQr,
    vincularPorCodigo,
    quitarAcceso,
    agregarVisita,
    eliminarVisita,
    agregarVacuna,
    eliminarVacuna,
    agregarIndicador,
    eliminarIndicador,
    agregarMedicamento,
    alternarMedicamento,
    eliminarMedicamento,
    agregarControl,
    eliminarControl,
    agregarRecordatorio,
    eliminarRecordatorio,
  };

  return <ContextoPetcare.Provider value={valor}>{children}</ContextoPetcare.Provider>;
}

export function usarPetcare() {
  const contexto = useContext(ContextoPetcare);
  if (!contexto) {
    throw new Error('usarPetcare debe usarse dentro de ProveedorPetcare');
  }
  return contexto;
}
