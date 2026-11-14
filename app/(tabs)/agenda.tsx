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
import { clinicaEditable } from '@/constantes/registros';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import { notificacionesDisponibles, obtenerPermiso } from '@/servicios/notificaciones';
import { confirmar } from '@/utilidades/alertas';
import { formatearFechaCompleta, hoyIso } from '@/utilidades/fechas';
import { mensajeEnElPasado } from '@/utilidades/validaciones';

type Formulario = 'ninguno' | 'control' | 'recordatorio';

export default function PantallaAgenda() {
  const {
    usuario,
    mascotas,
    mascotaSeleccionada,
    agregarControl,
    actualizarControl,
    eliminarControl,
    agregarRecordatorio,
    actualizarRecordatorio,
    eliminarRecordatorio,
    activarNotificaciones,
  } = usarPetcare();
  const esVeterinario = usuario?.rol === 'veterinario';
  const [formulario, setFormulario] = useState<Formulario>('ninguno');
  const [editandoId, setEditandoId] = useState<string | null>(null);
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

  const abrir = (tipo: Formulario, id: string | null = null) => {
    setEditandoId(id);
    setFormulario(tipo);
  };

  const cerrar = () => {
    setFormulario('ninguno');
    setEditandoId(null);
  };

  const controlEditado = mascota.controles.find((control) => control.id === editandoId);
  const recordatorioEditado = mascota.recordatorios.find((recordatorio) => recordatorio.id === editandoId);

  const camposControl: CampoFormulario[] = [
    { clave: 'titulo', etiqueta: 'Motivo del control', obligatorio: true, conLetras: true, largoMaximo: 80, placeholder: 'Ej: Control anual', valorInicial: controlEditado?.titulo },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, valorInicial: controlEditado?.fecha ?? hoy },
    { clave: 'hora', etiqueta: 'Hora', tipo: 'hora', obligatorio: true, valorInicial: controlEditado?.hora ?? '10:00' },
    { clave: 'clinica', etiqueta: 'Clínica (opcional)', conLetras: true, largoMaximo: 60, valorInicial: clinicaEditable(controlEditado?.clinica) },
  ];

  const camposRecordatorio: CampoFormulario[] = [
    { clave: 'titulo', etiqueta: 'Recordatorio', obligatorio: true, conLetras: true, largoMaximo: 80, placeholder: 'Ej: Comprar alimento', valorInicial: recordatorioEditado?.titulo },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, valorInicial: recordatorioEditado?.fecha ?? hoy },
    { clave: 'hora', etiqueta: 'Hora', tipo: 'hora', obligatorio: true, valorInicial: recordatorioEditado?.hora ?? '09:00' },
  ];

  const validarProgramacion = (original?: { fecha: string; hora: string }) => (valores: Record<string, string>) => {
    const sinCambios = original && original.fecha === valores.fecha && original.hora === valores.hora;
    return sinCambios ? null : mensajeEnElPasado(valores.fecha, valores.hora);
  };

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
        <BotonPrincipal texto="Agendar control" alPresionar={() => abrir('control')} />
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
              alEditar={() => abrir('control', control.id)}
              alEliminar={() => confirmar('Eliminar control', `¿Eliminar "${control.titulo}"?`, 'Eliminar', () => eliminarControl(mascota.id, control.id))}
            />
          ))}
        </View>

        {!esVeterinario && (
          <>
            <View style={estilos.encabezadoSeccion}>
              <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Recordatorios</TextoTema>
            </View>
            <BotonPrincipal texto="Crear recordatorio" alPresionar={() => abrir('recordatorio')} />
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
                  alEditar={() => abrir('recordatorio', recordatorio.id)}
                  alEliminar={() => confirmar('Eliminar recordatorio', `¿Eliminar "${recordatorio.titulo}"?`, 'Eliminar', () => eliminarRecordatorio(mascota.id, recordatorio.id))}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {formulario === 'control' && (
        <ModalFormulario
          titulo={editandoId ? 'Editar control' : 'Agendar control'}
          subtitulo={`Control veterinario de ${mascota.nombre}. Recibirás un aviso a la hora indicada.`}
          textoBoton={editandoId ? 'Guardar cambios' : 'Guardar'}
          campos={camposControl}
          validar={validarProgramacion(controlEditado)}
          alCerrar={cerrar}
          alGuardar={(valores) => {
            const datos = { titulo: valores.titulo, fecha: valores.fecha, hora: valores.hora, clinica: valores.clinica };
            if (editandoId) {
              actualizarControl(mascota.id, editandoId, datos);
            } else {
              agregarControl(mascota.id, datos);
            }
            cerrar();
          }}
        />
      )}

      {formulario === 'recordatorio' && (
        <ModalFormulario
          titulo={editandoId ? 'Editar recordatorio' : 'Crear recordatorio'}
          subtitulo={`Aviso para ${mascota.nombre}`}
          textoBoton={editandoId ? 'Guardar cambios' : 'Guardar'}
          campos={camposRecordatorio}
          validar={validarProgramacion(recordatorioEditado)}
          alCerrar={cerrar}
          alGuardar={(valores) => {
            const datos = { titulo: valores.titulo, fecha: valores.fecha, hora: valores.hora };
            if (editandoId) {
              actualizarRecordatorio(mascota.id, editandoId, datos);
            } else {
              agregarRecordatorio(mascota.id, datos);
            }
            cerrar();
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