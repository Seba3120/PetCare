import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CortinaEstado } from '@/componentes/cortina-estado';
import { EncabezadoPantalla } from '@/componentes/encabezado-pantalla';
import { EstadoVacio } from '@/componentes/estado-vacio';
import { FilaRegistro } from '@/componentes/fila-registro';
import { ModalFormulario, type CampoFormulario } from '@/componentes/modal-formulario';
import { SelectorMascota } from '@/componentes/selector-mascota';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import { notificacionesDisponibles, obtenerPermiso } from '@/servicios/notificaciones';
import { confirmar } from '@/utilidades/alertas';
import { formatearFechaCompleta, hoyIso } from '@/utilidades/fechas';

type Formulario = 'ninguno' | 'control' | 'recordatorio';

export default function PantallaAgenda() {
  const { usuario, mascotas, mascotaSeleccionada, agregarControl, eliminarControl, agregarRecordatorio, eliminarRecordatorio, activarNotificaciones } = usarPetcare();
  const esVeterinario = usuario?.rol === 'veterinario';
  const [formulario, setFormulario] = useState<Formulario>('ninguno');
  const [permiso, setPermiso] = useState<boolean | null>(null);

  useEffect(() => {
    obtenerPermiso().then(setPermiso);
  }, [mascotas]);

  const solicitarNotificaciones = async () => {
    setPermiso(await activarNotificaciones());
  };

  if (mascotaSeleccionada === null) {
    return (
      <View style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <EncabezadoPantalla sobretitulo="AGENDA" titulo="Agenda" />
          <EstadoVacio icono="pets" texto="Registra una mascota en la pestaña Club para organizar sus controles." />
        </View>
      </View>
    );
  }

  const mascota = mascotaSeleccionada;
  const hoy = hoyIso();

  const camposControl: CampoFormulario[] = [
    { clave: 'titulo', etiqueta: 'Motivo del control', obligatorio: true, placeholder: 'Ej: Control anual' },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, valorInicial: hoy },
    { clave: 'hora', etiqueta: 'Hora', tipo: 'hora', obligatorio: true, valorInicial: '10:00' },
    { clave: 'clinica', etiqueta: 'Clínica (opcional)' },
  ];

  const camposRecordatorio: CampoFormulario[] = [
    { clave: 'titulo', etiqueta: 'Recordatorio', obligatorio: true, placeholder: 'Ej: Comprar alimento' },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, valorInicial: hoy },
    { clave: 'hora', etiqueta: 'Hora', tipo: 'hora', obligatorio: true, valorInicial: '09:00' },
  ];

  const validarFecha = (valores: Record<string, string>) =>
    valores.fecha < hoy ? 'La fecha no puede estar en el pasado.' : null;

  return (
    <View style={estilos.pantalla}>
      <CortinaEstado />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <EncabezadoPantalla sobretitulo="AGENDA" titulo="Agenda" subtitulo="Controles veterinarios y recordatorios con aviso." />
        <View style={estilos.selector}>
          <SelectorMascota />
        </View>

        {!esVeterinario && notificacionesDisponibles && (
          <>
        <View style={estilos.tarjetaNotificaciones}>
          <View style={estilos.iconoNotificaciones}>
            <MaterialIcons name="notifications-active" size={22} color={Colores.marca.coral} />
          </View>
          <View style={estilos.textoNotificaciones}>
            <TextoTema tipo="seminegrita" style={estilos.tituloNotificaciones}>Notificaciones</TextoTema>
            <TextoTema style={estilos.descripcionNotificaciones}>
              {permiso
                ? 'Activadas: recibirás avisos de controles, vacunas y medicamentos.'
                : 'Desactivadas: actívalas para recibir avisos en tu teléfono.'}
            </TextoTema>
          </View>
        </View>
        {!permiso && <BotonPrincipal texto="Activar notificaciones" variante="contorno" alPresionar={solicitarNotificaciones} />}
          </>
        )}

        <View style={estilos.encabezadoSeccion}>
          <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Controles veterinarios</TextoTema>
        </View>
        <BotonPrincipal texto="Agendar control" alPresionar={() => setFormulario('control')} />
        <View style={estilos.lista}>
          {mascota.controles.length === 0 && <EstadoVacio icono="event-busy" texto="No hay controles agendados." />}
          {mascota.controles.map((control) => (
            <FilaRegistro
              key={control.id}
              icono="event"
              color={Colores.marca.coral}
              titulo={control.titulo}
              detalle={`${formatearFechaCompleta(control.fecha)} · ${control.hora}${control.clinica ? ` · ${control.clinica}` : ''}`}
              atenuada={control.fecha < hoy}
              alEliminar={() => confirmar('Eliminar control', `¿Eliminar "${control.titulo}"?`, 'Eliminar', () => eliminarControl(mascota.id, control.id))}
            />
          ))}
        </View>

        {!esVeterinario && (
          <>
        <View style={estilos.encabezadoSeccion}>
          <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Recordatorios</TextoTema>
        </View>
        <BotonPrincipal texto="Crear recordatorio" alPresionar={() => setFormulario('recordatorio')} />
        <View style={estilos.lista}>
          {mascota.recordatorios.length === 0 && <EstadoVacio icono="notifications-none" texto="No hay recordatorios creados." />}
          {mascota.recordatorios.map((recordatorio) => (
            <FilaRegistro
              key={recordatorio.id}
              icono="notifications"
              color={Colores.marca.azul}
              titulo={recordatorio.titulo}
              detalle={`${formatearFechaCompleta(recordatorio.fecha)} · ${recordatorio.hora}`}
              atenuada={recordatorio.fecha < hoy}
              alEliminar={() => confirmar('Eliminar recordatorio', `¿Eliminar "${recordatorio.titulo}"?`, 'Eliminar', () => eliminarRecordatorio(mascota.id, recordatorio.id))}
            />
          ))}
        </View>
          </>
        )}
      </ScrollView>

      {formulario === 'control' && (
        <ModalFormulario
          titulo="Agendar control"
          subtitulo={`Control veterinario de ${mascota.nombre}. Recibirás un aviso a la hora indicada.`}
          campos={camposControl}
          validar={validarFecha}
          alCerrar={() => setFormulario('ninguno')}
          alGuardar={(valores) => {
            agregarControl(mascota.id, {
              titulo: valores.titulo,
              fecha: valores.fecha,
              hora: valores.hora,
              clinica: valores.clinica,
            });
            setFormulario('ninguno');
          }}
        />
      )}

      {formulario === 'recordatorio' && (
        <ModalFormulario
          titulo="Crear recordatorio"
          subtitulo={`Aviso para ${mascota.nombre}`}
          campos={camposRecordatorio}
          validar={validarFecha}
          alCerrar={() => setFormulario('ninguno')}
          alGuardar={(valores) => {
            agregarRecordatorio(mascota.id, { titulo: valores.titulo, fecha: valores.fecha, hora: valores.hora });
            setFormulario('ninguno');
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.marca.fondo },
  contenido: { padding: 24, paddingTop: 64, paddingBottom: 36 },
  selector: { marginBottom: 20 },
  tarjetaNotificaciones: {
    backgroundColor: Colores.marca.coralSuave,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconoNotificaciones: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colores.marca.blanco, justifyContent: 'center', alignItems: 'center' },
  textoNotificaciones: { flex: 1, marginLeft: 12 },
  tituloNotificaciones: { color: Colores.marca.tinta, fontSize: 14, lineHeight: 20 },
  descripcionNotificaciones: { color: Colores.marca.apagado, fontSize: 12, lineHeight: 17, marginTop: 3 },
  encabezadoSeccion: { marginTop: 26, marginBottom: 14 },
  tituloSeccion: { color: Colores.marca.tinta, fontSize: 18 },
  lista: { marginTop: 18 },
});