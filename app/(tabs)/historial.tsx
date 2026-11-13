import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CortinaEstado } from '@/componentes/cortina-estado';
import { EncabezadoPantalla } from '@/componentes/encabezado-pantalla';
import { EstadoVacio } from '@/componentes/estado-vacio';
import { FiltroChips } from '@/componentes/filtro-chips';
import { ModalFormulario, type CampoFormulario } from '@/componentes/modal-formulario';
import { SelectorMascota } from '@/componentes/selector-mascota';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { ESTILOS_VISITA, TIPOS_VISITA } from '@/constantes/visitas';
import { usarPetcare } from '@/contextos/contexto-petcare';
import type { TipoVisita } from '@/tipos/modelos';
import { confirmar } from '@/utilidades/alertas';
import { formatearDia, formatearFechaCompleta, hoyIso, obtenerAnio } from '@/utilidades/fechas';
import { construirEventos } from '@/utilidades/historial';
import { obtenerProximoEvento } from '@/utilidades/visitas';

export default function PantallaHistorial() {
  const { mascotas, mascotaSeleccionada, agregarVisita, eliminarVisita } = usarPetcare();
  const anioActual = String(new Date().getFullYear());
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [registrando, setRegistrando] = useState(false);

  if (mascotaSeleccionada === null) {
    return (
      <View style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <EncabezadoPantalla sobretitulo="BIENESTAR Y SALUD" titulo="Historial" />
          <EstadoVacio icono="event-busy" texto="Registra una mascota en la pestaña Club para ver su historial." />
        </View>
      </View>
    );
  }

  const mascota = mascotaSeleccionada;
  const eventos = construirEventos(mascota);
  const eventosDelAnio = eventos.filter((evento) => obtenerAnio(evento.fecha) === anioSeleccionado);
  const proximoEvento = obtenerProximoEvento(mascota);

  const anios = Array.from(
    new Set([
      anioActual,
      ...mascotas.flatMap((candidata) => construirEventos(candidata).map((evento) => obtenerAnio(evento.fecha))),
    ])
  )
    .sort()
    .reverse();

  const camposVisita: CampoFormulario[] = [
    {
      clave: 'tipo',
      etiqueta: 'Tipo de registro',
      tipo: 'opciones',
      opciones: TIPOS_VISITA.map((tipo) => ({ valor: tipo, etiqueta: ESTILOS_VISITA[tipo].etiqueta })),
    },
    { clave: 'titulo', etiqueta: 'Título', obligatorio: true, placeholder: 'Ej: Revisión general' },
    { clave: 'clinica', etiqueta: 'Clínica', placeholder: 'Ej: Clínica Vet Salud' },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, valorInicial: hoyIso() },
  ];

  return (
    <View style={estilos.pantalla}>
      <CortinaEstado />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <EncabezadoPantalla
          sobretitulo="BIENESTAR Y SALUD"
          titulo="Historial"
          subtitulo="Todo lo registrado de tus mascotas, en un solo lugar."
        />

        <View style={estilos.filtros}>
          <SelectorMascota />
          <FiltroChips opciones={anios.map((anio) => ({ valor: anio, etiqueta: anio }))} valor={anioSeleccionado} alCambiar={setAnioSeleccionado} />
        </View>

        <BotonPrincipal texto="Registrar visita" alPresionar={() => setRegistrando(true)} />

        <View style={estilos.bloqueProximo}>
          {proximoEvento ? (
            <View style={estilos.tarjetaProxima}>
              <View style={estilos.iconoProxima}>
                <MaterialIcons name="event" size={23} color={Colores.marca.coral} />
              </View>
              <View style={estilos.textoProxima}>
                <TextoTema style={estilos.etiquetaProxima}>PRÓXIMO EVENTO</TextoTema>
                <TextoTema tipo="seminegrita" style={estilos.tituloProxima}>{proximoEvento.titulo}</TextoTema>
                <TextoTema style={estilos.fechaProxima}>{formatearFechaCompleta(proximoEvento.fecha)}</TextoTema>
              </View>
            </View>
          ) : (
            <EstadoVacio icono="event-busy" texto={`No hay eventos próximos para ${mascota.nombre}.`} />
          )}
        </View>

        <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Actividad registrada</TextoTema>
        {eventosDelAnio.length > 0 ? (
          <View style={estilos.lineaDeTiempo}>
            {eventosDelAnio.map((evento, indice) => (
              <View key={evento.id} style={estilos.filaEvento}>
                <View style={estilos.fecha}>
                  <TextoTema style={estilos.fechaDia}>{formatearDia(evento.fecha)}</TextoTema>
                  <TextoTema style={estilos.fechaAnio}>{obtenerAnio(evento.fecha)}</TextoTema>
                </View>
                <View style={estilos.envolturaLinea}>
                  <View style={[estilos.iconoEvento, { backgroundColor: evento.color }]}>
                    <MaterialIcons name={evento.icono} size={17} color={Colores.marca.blanco} />
                  </View>
                  {indice < eventosDelAnio.length - 1 && <View style={estilos.linea} />}
                </View>
                <View style={estilos.textoEvento}>
                  <TextoTema tipo="seminegrita" style={estilos.tituloEvento}>{evento.titulo}</TextoTema>
                  <TextoTema style={estilos.detalleEvento}>{evento.detalle}</TextoTema>
                </View>
                {evento.origen === 'visita' && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${evento.titulo}`}
                    onPress={() =>
                      confirmar('Eliminar visita', `¿Eliminar "${evento.titulo}" del historial?`, 'Eliminar', () =>
                        eliminarVisita(mascota.id, evento.id)
                      )
                    }
                    style={estilos.eliminarEvento}>
                    <MaterialIcons name="delete-outline" size={21} color={Colores.marca.apagado} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ) : (
          <TextoTema style={estilos.sinActividad}>Aún no hay actividad para este filtro.</TextoTema>
        )}

        <View style={estilos.consejo}>
          <MaterialIcons name="lightbulb-outline" size={20} color={Colores.marca.coral} />
          <TextoTema style={estilos.textoConsejo}>Mantener sus vacunas al día ayuda a que vivan más y mejor.</TextoTema>
        </View>
      </ScrollView>

      {registrando && (
        <ModalFormulario
          titulo="Registrar visita"
          subtitulo={`Agrega un evento al historial de ${mascota.nombre}`}
          campos={camposVisita}
          alCerrar={() => setRegistrando(false)}
          alGuardar={(valores) => {
            agregarVisita(mascota.id, {
              tipo: valores.tipo as TipoVisita,
              titulo: valores.titulo,
              clinica: valores.clinica || 'Sin clínica indicada',
              fecha: valores.fecha,
            });
            setAnioSeleccionado(obtenerAnio(valores.fecha));
            setRegistrando(false);
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.marca.fondo },
  contenido: { padding: 24, paddingTop: 64, paddingBottom: 36 },
  filtros: { gap: 10, marginBottom: 20 },
  bloqueProximo: { marginTop: 20, marginBottom: 31 },
  tarjetaProxima: { backgroundColor: Colores.marca.coralSuave, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' },
  iconoProxima: { width: 43, height: 43, borderRadius: 13, backgroundColor: Colores.marca.blanco, justifyContent: 'center', alignItems: 'center' },
  textoProxima: { flex: 1, marginLeft: 12 },
  etiquetaProxima: { color: Colores.marca.coral, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  tituloProxima: { color: Colores.marca.tinta, fontSize: 14, marginTop: 4 },
  fechaProxima: { color: Colores.marca.apagado, fontSize: 11, marginTop: 3 },
  tituloSeccion: { color: Colores.marca.tinta, fontSize: 20, marginBottom: 19 },
  lineaDeTiempo: { backgroundColor: Colores.marca.blanco, borderRadius: 20, padding: 18, paddingBottom: 5 },
  filaEvento: { flexDirection: 'row', minHeight: 75 },
  fecha: { width: 51, paddingTop: 2 },
  fechaDia: { color: Colores.marca.tinta, fontSize: 12, fontWeight: '800' },
  fechaAnio: { color: Colores.marca.apagado, fontSize: 11, marginTop: 3 },
  envolturaLinea: { width: 32, alignItems: 'center' },
  iconoEvento: { width: 32, height: 32, borderRadius: 11, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  linea: { position: 'absolute', top: 31, bottom: 0, width: 1, backgroundColor: Colores.marca.linea },
  textoEvento: { flex: 1, paddingLeft: 12, paddingTop: 1 },
  tituloEvento: { color: Colores.marca.tinta, fontSize: 14 },
  eliminarEvento: { padding: 6 },
  detalleEvento: { color: Colores.marca.apagado, fontSize: 12, marginTop: 5 },
  sinActividad: { color: Colores.marca.apagado, fontSize: 13, paddingVertical: 8 },
  consejo: { marginTop: 18, backgroundColor: Colores.marca.azulSuave, borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  textoConsejo: { flex: 1, color: Colores.marca.azul, fontSize: 12, lineHeight: 18 },
});