import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { Mascota } from '@/tipos/modelos';

type ModuloNotificaciones = typeof import('expo-notifications');

const CANAL = 'recordatorios';

export const notificacionesDisponibles =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

let promesaModulo: Promise<ModuloNotificaciones> | null = null;

function cargarModulo(): Promise<ModuloNotificaciones> {
  if (!promesaModulo) {
    promesaModulo = import('expo-notifications').then((modulo) => {
      modulo.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return modulo;
    });
  }
  return promesaModulo;
}

async function asegurarCanal(Notifications: ModuloNotificaciones): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function obtenerPermiso(): Promise<boolean> {
  if (!notificacionesDisponibles) {
    return false;
  }
  try {
    const Notifications = await cargarModulo();
    const permisos = await Notifications.getPermissionsAsync();
    return permisos.granted;
  } catch {
    return false;
  }
}

export async function pedirPermiso(): Promise<boolean> {
  if (!notificacionesDisponibles) {
    return false;
  }
  try {
    const Notifications = await cargarModulo();
    await asegurarCanal(Notifications);
    if (await obtenerPermiso()) {
      return true;
    }
    const respuesta = await Notifications.requestPermissionsAsync();
    return respuesta.granted;
  } catch {
    return false;
  }
}

export async function cancelarTodas(): Promise<void> {
  if (!notificacionesDisponibles) {
    return;
  }
  try {
    const Notifications = await cargarModulo();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    return;
  }
}

async function programarEnFecha(
  Notifications: ModuloNotificaciones,
  titulo: string,
  cuerpo: string,
  fechaIso: string,
  hora: string
) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);
  const fecha = new Date(anio, mes - 1, dia, horas, minutos);
  if (fecha.getTime() <= Date.now()) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fecha, channelId: CANAL },
  });
}

async function programarDiaria(Notifications: ModuloNotificaciones, titulo: string, cuerpo: string, hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: horas,
      minute: minutos,
      channelId: CANAL,
    },
  });
}

export async function sincronizarNotificaciones(mascotas: Mascota[], pedir: boolean): Promise<void> {
  if (!notificacionesDisponibles) {
    return;
  }
  const permitido = pedir ? await pedirPermiso() : await obtenerPermiso();
  if (!permitido) {
    return;
  }
  try {
    const Notifications = await cargarModulo();
    await asegurarCanal(Notifications);
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const mascota of mascotas) {
      for (const vacuna of mascota.vacunas) {
        if (vacuna.proximaDosis) {
          await programarEnFecha(Notifications, `Próxima dosis de ${mascota.nombre}`, vacuna.nombre, vacuna.proximaDosis, '09:00');
        }
      }
      for (const control of mascota.controles) {
        const detalle = control.clinica ? `${control.titulo} · ${control.clinica}` : control.titulo;
        await programarEnFecha(Notifications, `Control veterinario de ${mascota.nombre}`, detalle, control.fecha, control.hora || '09:00');
      }
      for (const recordatorio of mascota.recordatorios) {
        await programarEnFecha(Notifications, `Recordatorio de ${mascota.nombre}`, recordatorio.titulo, recordatorio.fecha, recordatorio.hora);
      }
      for (const medicamento of mascota.medicamentos) {
        if (medicamento.activo && medicamento.hora) {
          await programarDiaria(Notifications, `Medicamento de ${mascota.nombre}`, `${medicamento.nombre} · ${medicamento.dosis}`, medicamento.hora);
        }
      }
    }
  } catch {
    return;
  }
}