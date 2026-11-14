import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AvatarMascota } from '@/componentes/avatar-mascota';
import { BotonPrincipal } from '@/componentes/boton-principal';
import { CortinaEstado } from '@/componentes/cortina-estado';
import { FilaRegistro } from '@/componentes/fila-registro';
import { ModalFormulario } from '@/componentes/modal-formulario';
import { ModalMascota } from '@/componentes/modal-mascota';
import { ModalQr } from '@/componentes/modal-qr';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores, Fuentes } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import type { DatosMascota, FotoElegida, Mascota } from '@/tipos/modelos';
import { confirmar } from '@/utilidades/alertas';
import { formatearFechaCompleta } from '@/utilidades/fechas';
import { formatearCodigo } from '@/utilidades/mascotas';
import { generarResumenVeterinario } from '@/utilidades/resumen';
import { obtenerProximoEvento, obtenerUltimaVisita } from '@/utilidades/visitas';

type ModoFormulario = 'cerrado' | 'agregar' | 'editar';

const DATOS_VACIOS: DatosMascota = {
  nombre: '',
  tipo: 'Perro',
  sexo: 'Macho',
  raza: '',
  fechaNacimiento: '',
  colorPelaje: '',
  pesoKg: '',
  detalle: '',
};

function extraerDatos(mascota: Mascota): DatosMascota {
  return {
    nombre: mascota.nombre,
    tipo: mascota.tipo,
    sexo: mascota.sexo,
    raza: mascota.raza,
    fechaNacimiento: mascota.fechaNacimiento,
    colorPelaje: mascota.colorPelaje,
    pesoKg: mascota.pesoKg,
    detalle: mascota.detalle,
  };
}

export default function PantallaInicio() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const {
    usuario,
    cerrarSesion,
    mascotas,
    mascotaSeleccionada,
    seleccionarMascota,
    agregarMascota,
    actualizarMascota,
    eliminarMascota,
    renovarCodigoQr,
    quitarAcceso,
    actualizarObservaciones,
  } = usarPetcare();
  const [modo, setModo] = useState<ModoFormulario>('cerrado');
  const [fichaVetAbierta, setFichaVetAbierta] = useState(false);
  const [qrAbierto, setQrAbierto] = useState(false);
  const [observacionesAbiertas, setObservacionesAbiertas] = useState(false);

  const esVeterinario = usuario?.rol === 'veterinario';
  const primerNombre = usuario?.nombre.trim().split(' ')[0] ?? '';

  const confirmarCierreSesion = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => cerrarSesion() },
    ]);
  };

  const confirmarEliminacion = (mascota: Mascota) => {
    confirmar(
      `Eliminar a ${mascota.nombre}`,
      'Se borrarán su ficha y todo su historial. Esta acción no se puede deshacer.',
      'Eliminar',
      () => {
        eliminarMascota(mascota.id);
        setModo('cerrado');
      }
    );
  };

  const confirmarRenovacion = (mascota: Mascota) => {
    confirmar(
      'Renovar código',
      'El código actual dejará de servir para vincular nuevos veterinarios. Los que ya tienen acceso lo conservan.',
      'Renovar',
      () => renovarCodigoQr(mascota.id)
    );
  };

  const compartirResumen = async () => {
    if (!mascotaSeleccionada || !usuario) {
      return;
    }
    try {
      await Share.share({
        title: `Ficha de ${mascotaSeleccionada.nombre}`,
        message: generarResumenVeterinario(mascotaSeleccionada, usuario),
      });
    } catch {
      Alert.alert('No se pudo compartir', 'Intenta nuevamente en unos segundos.');
    }
  };

  const guardarFormulario = (datos: DatosMascota, foto: FotoElegida | null) => {
    if (modo === 'agregar') {
      agregarMascota(datos, foto);
    } else if (mascotaSeleccionada) {
      actualizarMascota(mascotaSeleccionada.id, datos, foto);
    }
    setModo('cerrado');
  };

  const proximoEvento = mascotaSeleccionada ? obtenerProximoEvento(mascotaSeleccionada) : undefined;
  const ultimaVisita = mascotaSeleccionada ? obtenerUltimaVisita(mascotaSeleccionada.visitas) : undefined;
  const referenciaClinica = proximoEvento ?? ultimaVisita;

  return (
    <View style={estilos.pantalla}>
      <CortinaEstado />
      <ScrollView contentContainerStyle={[estilos.contenido, width >= 900 && estilos.contenidoAncho]} showsVerticalScrollIndicator={false}>
        <View style={estilos.barraSuperior}>
          <View>
            <TextoTema style={estilos.sobretitulo}>{esVeterinario ? 'PETCARE · VETERINARIO' : 'PETCARE CLUB'}</TextoTema>
            <TextoTema tipo="titulo" style={estilos.saludo}>
              Hola, {primerNombre} <TextoTema style={estilos.adorno}>✦</TextoTema>
            </TextoTema>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={confirmarCierreSesion} style={estilos.botonIcono}>
            <MaterialIcons name="logout" size={22} color={Colores.marca.tinta} />
          </Pressable>
        </View>

        <View style={estilos.portada}>
          <View style={estilos.portadaTexto}>
            <TextoTema style={estilos.portadaSobretitulo}>{esVeterinario ? 'TUS PACIENTES, AL DÍA' : 'TU CLUB, SIEMPRE CERCA'}</TextoTema>
            <TextoTema style={estilos.portadaTitulo}>
              {esVeterinario ? 'Atiende y actualiza sus fichas.' : 'Cuida cada momento juntos.'}
            </TextoTema>
            <TextoTema style={estilos.portadaDescripcion}>
              {esVeterinario
                ? 'Escanea el QR del tutor para acceder al historial clínico.'
                : 'Guarda su información y mantén su bienestar al día.'}
            </TextoTema>
          </View>
          <View style={estilos.portadaIcono}>
            <TextoTema style={estilos.portadaHuella}>🐾</TextoTema>
          </View>
        </View>

        <View style={estilos.encabezadoSeccion}>
          <View>
            <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>{esVeterinario ? 'Mis pacientes' : 'Mis mascotas'}</TextoTema>
            <TextoTema style={estilos.leyendaSeccion}>
              {mascotas.length} {mascotas.length === 1 ? (esVeterinario ? 'paciente' : 'compañero registrado') : esVeterinario ? 'pacientes' : 'compañeros registrados'}
            </TextoTema>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={esVeterinario ? 'Escanear código QR' : 'Agregar mascota'}
            onPress={() => (esVeterinario ? router.push('/escanear') : setModo('agregar'))}
            style={estilos.botonAgregar}>
            <MaterialIcons name={esVeterinario ? 'qr-code-scanner' : 'add'} size={21} color={Colores.marca.blanco} />
          </Pressable>
        </View>

        {mascotaSeleccionada === null ? (
          <View style={estilos.tarjetaVacia}>
            <MaterialIcons name="pets" size={30} color={Colores.marca.coral} />
            <TextoTema tipo="seminegrita" style={estilos.tituloVacio}>
              {esVeterinario ? 'Aún no tienes pacientes' : 'Aún no tienes mascotas'}
            </TextoTema>
            <TextoTema style={estilos.textoVacio}>
              {esVeterinario
                ? 'Escanea el código QR de una mascota para vincularla a tu cuenta.'
                : 'Registra a tu primera mascota para comenzar a guardar su información.'}
            </TextoTema>
            <View style={estilos.botonVacio}>
              <BotonPrincipal
                texto={esVeterinario ? 'Escanear código QR' : 'Agregar mi primera mascota'}
                alPresionar={() => (esVeterinario ? router.push('/escanear') : setModo('agregar'))}
              />
            </View>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.listaMascotas}>
              {mascotas.map((mascota) => (
                <Pressable
                  key={mascota.id}
                  onPress={() => seleccionarMascota(mascota.id)}
                  style={[estilos.tarjetaMascota, mascotaSeleccionada.id === mascota.id && estilos.tarjetaMascotaSeleccionada]}>
                  <View style={estilos.avatar}>
                    <AvatarMascota mascota={mascota} tamano={48} radio={16} />
                  </View>
                  <TextoTema tipo="subtitulo" style={estilos.nombreMascota}>{mascota.nombre}</TextoTema>
                  <TextoTema style={estilos.tipoMascota}>{mascota.tipo} · {formatearCodigo(mascota)}</TextoTema>
                  <TextoTema numberOfLines={1} style={estilos.detalleMascota}>{mascota.detalle || mascota.raza}</TextoTema>
                  {mascotaSeleccionada.id === mascota.id && (
                    <View style={estilos.marcaSeleccion}>
                      <MaterialIcons name="check" size={13} color={Colores.marca.blanco} />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <View style={estilos.encabezadoSeccion}>
              <View>
                <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Ficha de {mascotaSeleccionada.nombre}</TextoTema>
                <TextoTema style={estilos.leyendaSeccion}>
                  {esVeterinario ? `Tutor: ${mascotaSeleccionada.tutorNombre}` : 'Información para su cuidado diario'}
                </TextoTema>
              </View>
              {!esVeterinario && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ficha de ${mascotaSeleccionada.nombre}`}
                  onPress={() => setModo('editar')}
                  style={estilos.botonEditar}>
                  <MaterialIcons name="edit" size={17} color={Colores.marca.azul} />
                  <TextoTema style={estilos.etiquetaEditar}>Editar</TextoTema>
                </Pressable>
              )}
            </View>

            <View style={estilos.tarjetaInfo}>
              <View style={estilos.infoSuperior}>
                <AvatarMascota mascota={mascotaSeleccionada} tamano={48} radio={15} />
                <View style={estilos.infoNombre}>
                  <TextoTema tipo="subtitulo" style={estilos.infoTitulo}>{mascotaSeleccionada.nombre}</TextoTema>
                  <TextoTema style={estilos.infoSubtitulo}>
                    {mascotaSeleccionada.raza}
                    {mascotaSeleccionada.colorPelaje ? ` · ${mascotaSeleccionada.colorPelaje}` : ''}
                  </TextoTema>
                </View>
                <View style={estilos.pildoraId}>
                  <TextoTema style={estilos.textoId}>{formatearCodigo(mascotaSeleccionada)}</TextoTema>
                </View>
              </View>
              <View style={estilos.filaEstadisticas}>
                <Estadistica icono="cake" etiqueta="Edad" valor={mascotaSeleccionada.edad || '—'} />
                <Estadistica icono="monitor-weight" etiqueta="Peso" valor={mascotaSeleccionada.peso || '—'} />
                <Estadistica icono={mascotaSeleccionada.sexo === 'Hembra' ? 'female' : 'male'} etiqueta="Sexo" valor={mascotaSeleccionada.sexo} />
                <Estadistica icono="pets" etiqueta="Especie" valor={mascotaSeleccionada.tipo} />
              </View>
            </View>

            <Pressable accessibilityRole="button" onPress={() => setFichaVetAbierta(true)} style={estilos.tarjetaVet}>
              <View style={estilos.iconoVet}>
                <MaterialIcons name="medical-services" size={22} color={Colores.marca.coral} />
              </View>
              <View style={estilos.textoVet}>
                <TextoTema tipo="seminegrita" style={estilos.tituloVet}>Ficha veterinaria</TextoTema>
                <TextoTema style={estilos.descripcionVet}>
                  {proximoEvento ? `Próxima visita · ${formatearFechaCompleta(proximoEvento.fecha)}` : 'Sin visitas programadas'}
                </TextoTema>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Colores.marca.apagado} />
            </Pressable>

            <View style={estilos.bloqueAcciones}>
              {!esVeterinario && <BotonPrincipal texto="Mostrar código QR" alPresionar={() => setQrAbierto(true)} />}
              <BotonPrincipal texto="Compartir ficha con el veterinario" variante="contorno" alPresionar={compartirResumen} />
              {esVeterinario && (
                <BotonPrincipal
                  texto="Dejar de atender a esta mascota"
                  variante="contorno"
                  alPresionar={() =>
                    confirmar(
                      'Dejar de atender',
                      `Dejarás de ver la ficha de ${mascotaSeleccionada.nombre}. Podrás vincularla de nuevo con su código QR.`,
                      'Confirmar',
                      () => quitarAcceso(mascotaSeleccionada.id, usuario?.id ?? '')
                    )
                  }
                />
              )}
            </View>

            {!esVeterinario && (
              <View style={estilos.bloqueVeterinarios}>
                <TextoTema tipo="subtitulo" style={estilos.tituloSeccion}>Veterinarios con acceso</TextoTema>
                <View style={estilos.listaVeterinarios}>
                  {mascotaSeleccionada.veterinarios.length === 0 && (
                    <TextoTema style={estilos.textoVacio}>
                      Nadie más puede ver esta ficha. Muestra el código QR a tu veterinario para darle acceso.
                    </TextoTema>
                  )}
                  {mascotaSeleccionada.veterinarios.map((veterinario) => (
                    <FilaRegistro
                      key={veterinario.id}
                      icono="medical-services"
                      color={Colores.marca.azul}
                      titulo={veterinario.nombre}
                      detalle={veterinario.clinica || 'Veterinario'}
                      alEliminar={() =>
                        confirmar(
                          'Quitar acceso',
                          `${veterinario.nombre} dejará de ver y editar la ficha de ${mascotaSeleccionada.nombre}.`,
                          'Quitar',
                          () => quitarAcceso(mascotaSeleccionada.id, veterinario.id)
                        )
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {modo !== 'cerrado' && (
        <ModalMascota
          titulo={modo === 'agregar' ? 'Agregar mascota' : 'Editar ficha'}
          subtitulo={
            modo === 'agregar'
              ? 'Completa los datos para registrarla'
              : `Actualiza los datos de ${mascotaSeleccionada?.nombre ?? ''}`
          }
          textoBoton={modo === 'agregar' ? 'Agregar mascota' : 'Guardar cambios'}
          valorInicial={modo === 'editar' && mascotaSeleccionada ? extraerDatos(mascotaSeleccionada) : DATOS_VACIOS}
          fotoActual={modo === 'editar' ? (mascotaSeleccionada?.fotoUrl ?? null) : null}
          nombresEnUso={mascotas
            .filter((mascota) => modo === 'agregar' || mascota.id !== mascotaSeleccionada?.id)
            .map((mascota) => mascota.nombre)}
          alGuardar={guardarFormulario}
          alCerrar={() => setModo('cerrado')}
          alEliminar={modo === 'editar' && mascotaSeleccionada ? () => confirmarEliminacion(mascotaSeleccionada) : undefined}
        />
      )}

      {qrAbierto && mascotaSeleccionada && (
        <ModalQr
          mascota={mascotaSeleccionada}
          alRenovar={() => confirmarRenovacion(mascotaSeleccionada)}
          alCerrar={() => setQrAbierto(false)}
        />
      )}

      {observacionesAbiertas && mascotaSeleccionada && (
        <ModalFormulario
          titulo="Observaciones clínicas"
          subtitulo={`Ficha de ${mascotaSeleccionada.nombre}. Las pueden editar el dueño y los veterinarios con acceso.`}
          textoBoton="Guardar observaciones"
          campos={[
            {
              clave: 'texto',
              etiqueta: 'Observaciones',
              multilinea: true,
              largoMaximo: 500,
              placeholder: 'Ej: Alergia a la penicilina. Control de peso cada 3 meses.',
              valorInicial: mascotaSeleccionada.observaciones,
            },
          ]}
          alCerrar={() => setObservacionesAbiertas(false)}
          alGuardar={(valores) => {
            actualizarObservaciones(mascotaSeleccionada.id, valores.texto);
            setObservacionesAbiertas(false);
          }}
        />
      )}

      {mascotaSeleccionada && (
        <Modal animationType="fade" transparent visible={fichaVetAbierta} onRequestClose={() => setFichaVetAbierta(false)}>
          <View style={estilos.fondoModal}>
            <View style={estilos.tarjetaModalVet}>
              <ScrollView showsVerticalScrollIndicator={false}>
              <View style={estilos.iconoModalVet}>
                <MaterialIcons name="medical-services" size={27} color={Colores.marca.coral} />
              </View>
              <TextoTema tipo="subtitulo" style={estilos.tituloModal}>Ficha veterinaria</TextoTema>
              <TextoTema style={estilos.mascotaModalVet}>{mascotaSeleccionada.nombre} · {formatearCodigo(mascotaSeleccionada)}</TextoTema>
              <FilaDetalle etiqueta="Clínica" valor={referenciaClinica?.clinica ?? 'Sin registro'} />
              <FilaDetalle
                etiqueta="Próxima visita"
                valor={proximoEvento ? `${formatearFechaCompleta(proximoEvento.fecha)} · ${proximoEvento.titulo}` : 'Sin programar'}
              />
              <FilaDetalle etiqueta="Última visita" valor={ultimaVisita ? formatearFechaCompleta(ultimaVisita.fecha) : 'Sin registro'} />
              <FilaDetalle etiqueta="Visitas registradas" valor={String(mascotaSeleccionada.visitas.length)} />
              <FilaDetalle etiqueta="Vacunas registradas" valor={String(mascotaSeleccionada.vacunas.length)} />
              <View style={estilos.bloqueObservaciones}>
                <TextoTema style={estilos.etiquetaDetalleVet}>Observaciones clínicas</TextoTema>
                <TextoTema style={estilos.textoObservaciones}>
                  {mascotaSeleccionada.observaciones || 'Sin observaciones registradas.'}
                </TextoTema>
              </View>
              <BotonPrincipal
                texto="Editar observaciones"
                alPresionar={() => {
                  setFichaVetAbierta(false);
                  setObservacionesAbiertas(true);
                }}
              />
              <BotonPrincipal texto="Cerrar" variante="contorno" alPresionar={() => setFichaVetAbierta(false)} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function Estadistica({ icono, etiqueta, valor }: { icono: keyof typeof MaterialIcons.glyphMap; etiqueta: string; valor: string }) {
  return (
    <View style={estilos.estadistica}>
      <MaterialIcons name={icono} size={18} color={Colores.marca.coral} />
      <TextoTema style={estilos.etiquetaEstadistica}>{etiqueta}</TextoTema>
      <TextoTema tipo="seminegrita" style={estilos.valorEstadistica}>{valor}</TextoTema>
    </View>
  );
}

function FilaDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.filaDetalleVet}>
      <TextoTema style={estilos.etiquetaDetalleVet}>{etiqueta}</TextoTema>
      <TextoTema style={estilos.valorDetalleVet}>{valor}</TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.marca.fondo },
  contenido: { padding: 24, paddingTop: 62, paddingBottom: 32 },
  contenidoAncho: { width: '100%', maxWidth: 980, alignSelf: 'center' },
  barraSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sobretitulo: { color: Colores.marca.coral, fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 7 },
  saludo: { color: Colores.marca.tinta, fontSize: 28, lineHeight: 34 },
  adorno: { color: Colores.marca.coral, fontSize: 24 },
  botonIcono: { backgroundColor: Colores.marca.blanco, borderRadius: 14, padding: 12, shadowColor: Colores.marca.tinta, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  portada: { backgroundColor: Colores.marca.azul, borderRadius: 24, padding: 22, minHeight: 150, flexDirection: 'row', overflow: 'hidden', marginBottom: 29 },
  portadaTexto: { flex: 1, paddingRight: 8 },
  portadaSobretitulo: { color: '#B7E9E1', fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginBottom: 10 },
  portadaTitulo: { color: Colores.marca.blanco, fontFamily: Fuentes.redondeada, fontSize: 25, lineHeight: 29, fontWeight: '800', marginBottom: 9 },
  portadaDescripcion: { color: '#D5F1ED', fontSize: 13, lineHeight: 19 },
  portadaIcono: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#2D8B8D', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  portadaHuella: { fontSize: 37, lineHeight: 44 },
  encabezadoSeccion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  tituloSeccion: { color: Colores.marca.tinta, fontSize: 20 },
  leyendaSeccion: { color: Colores.marca.apagado, fontSize: 12, marginTop: 3 },
  botonAgregar: { backgroundColor: Colores.marca.coral, borderRadius: 12, padding: 9 },
  listaMascotas: { gap: 12, paddingBottom: 28 },
  tarjetaMascota: { width: 178, backgroundColor: Colores.marca.blanco, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: 'transparent', shadowColor: Colores.marca.tinta, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tarjetaMascotaSeleccionada: { borderColor: Colores.marca.coral },
  avatar: { marginBottom: 13 },
  nombreMascota: { color: Colores.marca.tinta, fontSize: 18, marginBottom: 2 },
  tipoMascota: { color: Colores.marca.azul, fontSize: 11, fontWeight: '700', marginBottom: 9 },
  detalleMascota: { color: Colores.marca.apagado, fontSize: 12 },
  marcaSeleccion: { position: 'absolute', right: 12, top: 12, backgroundColor: Colores.marca.coral, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  botonEditar: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 5 },
  etiquetaEditar: { color: Colores.marca.azul, fontSize: 13, fontWeight: '700' },
  tarjetaInfo: { backgroundColor: Colores.marca.blanco, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: Colores.marca.tinta, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  infoSuperior: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoNombre: { flex: 1, marginLeft: 12 },
  infoTitulo: { color: Colores.marca.tinta, fontSize: 18 },
  infoSubtitulo: { color: Colores.marca.apagado, fontSize: 12, marginTop: 3 },
  pildoraId: { backgroundColor: Colores.marca.azulSuave, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  textoId: { color: Colores.marca.azul, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  filaEstadisticas: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colores.marca.linea, paddingTop: 15 },
  estadistica: { flex: 1, borderRightWidth: 1, borderRightColor: Colores.marca.linea, paddingLeft: 3 },
  etiquetaEstadistica: { color: Colores.marca.apagado, fontSize: 10, marginTop: 5 },
  valorEstadistica: { color: Colores.marca.tinta, fontSize: 12, marginTop: 2 },
  tarjetaVet: { backgroundColor: Colores.marca.coralSuave, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' },
  iconoVet: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colores.marca.blanco, justifyContent: 'center', alignItems: 'center' },
  textoVet: { flex: 1, marginLeft: 12 },
  tituloVet: { color: Colores.marca.tinta, fontSize: 14 },
  descripcionVet: { color: Colores.marca.apagado, fontSize: 12, marginTop: 4 },
  bloqueAcciones: { marginTop: 14, gap: 10 },
  bloqueVeterinarios: { marginTop: 28 },
  listaVeterinarios: { marginTop: 14 },
  tarjetaVacia: { backgroundColor: Colores.marca.blanco, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  tituloVacio: { color: Colores.marca.tinta, fontSize: 16, marginTop: 4 },
  textoVacio: { color: Colores.marca.apagado, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  botonVacio: { alignSelf: 'stretch', marginTop: 8 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(20, 47, 57, 0.42)', justifyContent: 'center' },
  tarjetaModalVet: { backgroundColor: Colores.marca.fondo, borderRadius: 24, margin: 24, padding: 24, maxHeight: '88%' },
  iconoModalVet: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colores.marca.coralSuave, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  tituloModal: { color: Colores.marca.tinta, fontSize: 22 },
  mascotaModalVet: { color: Colores.marca.apagado, fontSize: 13, marginTop: 4, marginBottom: 20 },
  filaDetalleVet: { borderTopWidth: 1, borderTopColor: Colores.marca.linea, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  etiquetaDetalleVet: { color: Colores.marca.apagado, fontSize: 12 },
  bloqueObservaciones: { borderTopWidth: 1, borderTopColor: Colores.marca.linea, paddingVertical: 13, marginBottom: 12 },
  textoObservaciones: { color: Colores.marca.tinta, fontSize: 12, lineHeight: 18, marginTop: 6 },
  valorDetalleVet: { flex: 1, color: Colores.marca.tinta, fontSize: 12, fontWeight: '700', textAlign: 'right' },
});