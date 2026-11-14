import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CortinaEstado } from '@/componentes/cortina-estado';
import { EncabezadoPantalla } from '@/componentes/encabezado-pantalla';
import { EstadoVacio } from '@/componentes/estado-vacio';
import { FilaRegistro } from '@/componentes/fila-registro';
import { FiltroChips } from '@/componentes/filtro-chips';
import { GraficoBarras } from '@/componentes/grafico-barras';
import { ModalFormulario, type CampoFormulario } from '@/componentes/modal-formulario';
import { SelectorMascota } from '@/componentes/selector-mascota';
import { TextoTema } from '@/componentes/texto-tema';
import {
  CLINICA_SIN_INDICAR,
  clinicaEditable,
  ETIQUETAS_TIPO_VACUNA,
  NOMBRES_INDICADOR,
  UNIDADES_INDICADOR,
} from '@/constantes/registros';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import type { TipoIndicador, TipoVacuna } from '@/tipos/modelos';
import { confirmar } from '@/utilidades/alertas';
import { formatearDia, formatearFechaCompleta, hoyIso } from '@/utilidades/fechas';
import { mensajeAnteriorNacimiento } from '@/utilidades/validaciones';

type Seccion = 'vacunas' | 'indicadores' | 'medicamentos' | 'estadisticas';
type Formulario = 'ninguno' | 'vacuna' | 'indicador' | 'medicamento';

const SECCIONES: { valor: Seccion; etiqueta: string }[] = [
  { valor: 'vacunas', etiqueta: 'Vacunas' },
  { valor: 'indicadores', etiqueta: 'Indicadores' },
  { valor: 'medicamentos', etiqueta: 'Medicamentos' },
  { valor: 'estadisticas', etiqueta: 'Estadísticas' },
];

const OPCIONES_INDICADOR = (Object.keys(NOMBRES_INDICADOR) as TipoIndicador[]).map((tipo) => ({
  valor: tipo,
  etiqueta: `${NOMBRES_INDICADOR[tipo]} (${UNIDADES_INDICADOR[tipo]})`,
}));

const OPCIONES_VACUNA = (Object.keys(ETIQUETAS_TIPO_VACUNA) as TipoVacuna[]).map((tipo) => ({
  valor: tipo,
  etiqueta: ETIQUETAS_TIPO_VACUNA[tipo],
}));

export default function PantallaSalud() {
  const {
    mascotaSeleccionada,
    agregarVacuna,
    actualizarVacuna,
    eliminarVacuna,
    agregarIndicador,
    actualizarIndicador,
    eliminarIndicador,
    agregarMedicamento,
    actualizarMedicamento,
    alternarMedicamento,
    eliminarMedicamento,
  } = usarPetcare();
  const [seccion, setSeccion] = useState<Seccion>('vacunas');
  const [tipoIndicador, setTipoIndicador] = useState<TipoIndicador>('peso');
  const [formulario, setFormulario] = useState<Formulario>('ninguno');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  if (mascotaSeleccionada === null) {
    return (
      <View style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <EncabezadoPantalla sobretitulo="SALUD" titulo="Salud" />
          <EstadoVacio icono="pets" texto="Registra una mascota en la pestaña Club para llevar su control de salud." />
        </View>
      </View>
    );
  }

  const mascota = mascotaSeleccionada;

  const abrir = (tipo: Formulario, id: string | null = null) => {
    setEditandoId(id);
    setFormulario(tipo);
  };

  const cerrar = () => {
    setFormulario('ninguno');
    setEditandoId(null);
  };

  const vacunaEditada = mascota.vacunas.find((vacuna) => vacuna.id === editandoId);
  const indicadorEditado = mascota.indicadores.find((indicador) => indicador.id === editandoId);
  const medicamentoEditado = mascota.medicamentos.find((medicamento) => medicamento.id === editandoId);

  const indicadoresDelTipo = mascota.indicadores.filter((indicador) => indicador.tipo === tipoIndicador);
  const puntosGrafico = [...indicadoresDelTipo]
    .reverse()
    .slice(-8)
    .map((indicador) => ({ etiqueta: formatearDia(indicador.fecha), valor: indicador.valor }));

  const pesos = mascota.indicadores.filter((indicador) => indicador.tipo === 'peso').map((indicador) => indicador.valor);
  const pesosPuntos = mascota.indicadores
    .filter((indicador) => indicador.tipo === 'peso')
    .reverse()
    .slice(-8)
    .map((indicador) => ({ etiqueta: formatearDia(indicador.fecha), valor: indicador.valor }));
  const variacionPeso = pesos.length > 1 ? Math.round((pesos[0] - pesos[pesos.length - 1]) * 100) / 100 : 0;

  const camposVacuna: CampoFormulario[] = [
    { clave: 'nombre', etiqueta: 'Nombre', obligatorio: true, conLetras: true, largoMaximo: 60, placeholder: 'Ej: Antirrábica', valorInicial: vacunaEditada?.nombre },
    { clave: 'tipo', etiqueta: 'Tipo', tipo: 'opciones', opciones: OPCIONES_VACUNA, valorInicial: vacunaEditada?.tipo },
    { clave: 'fecha', etiqueta: 'Fecha de aplicación', tipo: 'fecha', obligatorio: true, noFutura: true, valorInicial: vacunaEditada?.fecha ?? hoyIso() },
    { clave: 'proximaDosis', etiqueta: 'Próxima dosis (opcional)', tipo: 'fecha', valorInicial: vacunaEditada?.proximaDosis },
    { clave: 'clinica', etiqueta: 'Clínica (opcional)', conLetras: true, largoMaximo: 60, valorInicial: clinicaEditable(vacunaEditada?.clinica) },
  ];

  const camposIndicador: CampoFormulario[] = [
    { clave: 'tipo', etiqueta: 'Indicador', tipo: 'opciones', opciones: OPCIONES_INDICADOR, valorInicial: indicadorEditado?.tipo ?? tipoIndicador },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, noFutura: true, valorInicial: indicadorEditado?.fecha ?? hoyIso() },
    { clave: 'valor', etiqueta: 'Valor', tipo: 'numero', obligatorio: true, placeholder: 'Ej: 18,5', valorInicial: indicadorEditado ? String(indicadorEditado.valor) : undefined },
  ];

  const camposMedicamento: CampoFormulario[] = [
    { clave: 'nombre', etiqueta: 'Medicamento', obligatorio: true, conLetras: true, largoMaximo: 60, valorInicial: medicamentoEditado?.nombre },
    { clave: 'dosis', etiqueta: 'Dosis', obligatorio: true, conLetras: true, largoMaximo: 40, placeholder: 'Ej: 1 comprimido', valorInicial: medicamentoEditado?.dosis },
    { clave: 'frecuencia', etiqueta: 'Frecuencia', obligatorio: true, conLetras: true, largoMaximo: 40, placeholder: 'Ej: cada 12 horas', valorInicial: medicamentoEditado?.frecuencia },
    { clave: 'inicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', obligatorio: true, valorInicial: medicamentoEditado?.inicio ?? hoyIso() },
    { clave: 'hora', etiqueta: 'Hora del recordatorio diario (opcional)', tipo: 'hora', valorInicial: medicamentoEditado?.hora },
  ];

  const validarVacuna = (valores: Record<string, string>) => {
    const anterior = mensajeAnteriorNacimiento(valores.fecha, mascota);
    if (anterior) {
      return anterior;
    }
    if (valores.proximaDosis && valores.proximaDosis < valores.fecha) {
      return 'La próxima dosis no puede ser anterior a la fecha de aplicación.';
    }
    const repetida = mascota.vacunas.some(
      (vacuna) =>
        vacuna.id !== editandoId &&
        vacuna.nombre.trim().toLowerCase() === valores.nombre.toLowerCase() &&
        vacuna.fecha === valores.fecha
    );
    return repetida ? 'Ya registraste esta vacuna en esa fecha.' : null;
  };

  const validarIndicador = (valores: Record<string, string>) => {
    const anterior = mensajeAnteriorNacimiento(valores.fecha, mascota);
    if (anterior) {
      return anterior;
    }
    const valor = Number(valores.valor);
    if (valores.tipo === 'peso' && (valor < 0.1 || valor > 150)) {
      return 'El peso debe estar entre 0,1 y 150 kg.';
    }
    if (valores.tipo === 'temperatura' && (valor < 30 || valor > 45)) {
      return 'La temperatura debe estar entre 30 y 45 °C.';
    }
    return null;
  };

  const validarMedicamento = (valores: Record<string, string>) => mensajeAnteriorNacimiento(valores.inicio, mascota);

  return (
    <View style={estilos.pantalla}>
      <CortinaEstado />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <EncabezadoPantalla sobretitulo="SALUD" titulo="Salud" subtitulo="Vacunas, indicadores y tratamientos de tu mascota." />
        <View style={estilos.filtros}>
          <SelectorMascota />
          <FiltroChips opciones={SECCIONES} valor={seccion} alCambiar={setSeccion} />
        </View>

        {seccion === 'vacunas' && (
          <>
            <BotonPrincipal texto="Registrar vacuna o desparasitación" alPresionar={() => abrir('vacuna')} />
            <View style={estilos.lista}>
              {mascota.vacunas.length === 0 && <EstadoVacio icono="vaccines" texto="Aún no hay vacunas ni desparasitaciones registradas." />}
              {mascota.vacunas.map((vacuna) => (
                <FilaRegistro
                  key={vacuna.id}
                  icono="vaccines"
                  color={Colores.marca.azul}
                  titulo={vacuna.nombre}
                  detalle={`${ETIQUETAS_TIPO_VACUNA[vacuna.tipo]} · ${formatearFechaCompleta(vacuna.fecha)}${
                    vacuna.proximaDosis ? ` · Próxima: ${formatearFechaCompleta(vacuna.proximaDosis)}` : ''
                  }`}
                  alEditar={() => abrir('vacuna', vacuna.id)}
                  alEliminar={() => confirmar('Eliminar registro', `¿Eliminar "${vacuna.nombre}"?`, 'Eliminar', () => eliminarVacuna(mascota.id, vacuna.id))}
                />
              ))}
            </View>
          </>
        )}

        {seccion === 'indicadores' && (
          <>
            <FiltroChips opciones={OPCIONES_INDICADOR} valor={tipoIndicador} alCambiar={setTipoIndicador} />
            <View style={estilos.separador}>
              <BotonPrincipal texto="Registrar medición" alPresionar={() => abrir('indicador')} />
            </View>
            {puntosGrafico.length > 0 && <GraficoBarras puntos={puntosGrafico} unidad={UNIDADES_INDICADOR[tipoIndicador]} />}
            <View style={estilos.lista}>
              {indicadoresDelTipo.length === 0 && <EstadoVacio icono="monitor-weight" texto="Aún no hay mediciones de este indicador." />}
              {indicadoresDelTipo.map((indicador) => (
                <FilaRegistro
                  key={indicador.id}
                  icono={indicador.tipo === 'peso' ? 'monitor-weight' : 'thermostat'}
                  color={Colores.marca.menta}
                  titulo={`${indicador.valor} ${UNIDADES_INDICADOR[indicador.tipo]}`}
                  detalle={formatearFechaCompleta(indicador.fecha)}
                  alEditar={() => abrir('indicador', indicador.id)}
                  alEliminar={() => confirmar('Eliminar medición', '¿Eliminar esta medición?', 'Eliminar', () => eliminarIndicador(mascota.id, indicador.id))}
                />
              ))}
            </View>
          </>
        )}

        {seccion === 'medicamentos' && (
          <>
            <BotonPrincipal texto="Registrar medicamento" alPresionar={() => abrir('medicamento')} />
            <View style={estilos.lista}>
              {mascota.medicamentos.length === 0 && <EstadoVacio icono="medication" texto="Aún no hay medicamentos ni tratamientos registrados." />}
              {mascota.medicamentos.map((medicamento) => (
                <FilaRegistro
                  key={medicamento.id}
                  icono="medication"
                  color={Colores.marca.coral}
                  titulo={medicamento.nombre}
                  detalle={`${medicamento.dosis} · ${medicamento.frecuencia} · Desde ${formatearFechaCompleta(medicamento.inicio)}${
                    medicamento.hora ? ` · Aviso ${medicamento.hora}` : ''
                  }`}
                  atenuada={!medicamento.activo}
                  textoAccion={medicamento.activo ? 'Marcar como finalizado' : 'Reactivar tratamiento'}
                  alAccion={() => alternarMedicamento(mascota.id, medicamento.id)}
                  alEditar={() => abrir('medicamento', medicamento.id)}
                  alEliminar={() => confirmar('Eliminar medicamento', `¿Eliminar "${medicamento.nombre}"?`, 'Eliminar', () => eliminarMedicamento(mascota.id, medicamento.id))}
                />
              ))}
            </View>
          </>
        )}

        {seccion === 'estadisticas' && (
          <>
            <View style={estilos.cuadricula}>
              <TarjetaDato etiqueta="Vacunas" valor={String(mascota.vacunas.filter((vacuna) => vacuna.tipo === 'vacuna').length)} />
              <TarjetaDato etiqueta="Desparasitaciones" valor={String(mascota.vacunas.filter((vacuna) => vacuna.tipo === 'desparasitacion').length)} />
              <TarjetaDato etiqueta="Visitas" valor={String(mascota.visitas.length)} />
              <TarjetaDato etiqueta="Tratamientos activos" valor={String(mascota.medicamentos.filter((medicamento) => medicamento.activo).length)} />
            </View>
            <TextoTema tipo="subtitulo" style={estilos.subtituloSeccion}>Evolución del peso</TextoTema>
            {pesos.length > 0 ? (
              <>
                <View style={estilos.cuadricula}>
                  <TarjetaDato etiqueta="Último peso" valor={`${pesos[0]} kg`} />
                  <TarjetaDato etiqueta="Variación" valor={`${variacionPeso > 0 ? '+' : ''}${variacionPeso} kg`} />
                  <TarjetaDato etiqueta="Mínimo" valor={`${Math.min(...pesos)} kg`} />
                  <TarjetaDato etiqueta="Máximo" valor={`${Math.max(...pesos)} kg`} />
                </View>
                <GraficoBarras puntos={pesosPuntos} unidad="kg" />
              </>
            ) : (
              <EstadoVacio icono="monitor-weight" texto="Registra al menos un peso en Indicadores para ver estadísticas." />
            )}
          </>
        )}
      </ScrollView>

      {formulario === 'vacuna' && (
        <ModalFormulario
          titulo={editandoId ? 'Editar vacuna o desparasitación' : 'Vacuna o desparasitación'}
          subtitulo={`Registro de ${mascota.nombre}. Si indicas próxima dosis, recibirás un aviso.`}
          textoBoton={editandoId ? 'Guardar cambios' : 'Guardar'}
          campos={camposVacuna}
          validar={validarVacuna}
          alCerrar={cerrar}
          alGuardar={(valores) => {
            const datos = {
              nombre: valores.nombre,
              tipo: valores.tipo as TipoVacuna,
              fecha: valores.fecha,
              proximaDosis: valores.proximaDosis,
              clinica: valores.clinica || CLINICA_SIN_INDICAR,
            };
            if (editandoId) {
              actualizarVacuna(mascota.id, editandoId, datos);
            } else {
              agregarVacuna(mascota.id, datos);
            }
            cerrar();
          }}
        />
      )}

      {formulario === 'indicador' && (
        <ModalFormulario
          titulo={editandoId ? 'Editar medición' : 'Registrar medición'}
          subtitulo={`Seguimiento de ${mascota.nombre}`}
          textoBoton={editandoId ? 'Guardar cambios' : 'Guardar'}
          campos={camposIndicador}
          validar={validarIndicador}
          alCerrar={cerrar}
          alGuardar={(valores) => {
            const datos = {
              tipo: valores.tipo as TipoIndicador,
              fecha: valores.fecha,
              valor: Number(valores.valor),
            };
            if (editandoId) {
              actualizarIndicador(mascota.id, editandoId, datos);
            } else {
              agregarIndicador(mascota.id, datos);
            }
            setTipoIndicador(datos.tipo);
            cerrar();
          }}
        />
      )}

      {formulario === 'medicamento' && (
        <ModalFormulario
          titulo={editandoId ? 'Editar medicamento' : 'Medicamento o tratamiento'}
          subtitulo={`Indicado para ${mascota.nombre}. Con hora de aviso recibirás un recordatorio diario.`}
          textoBoton={editandoId ? 'Guardar cambios' : 'Guardar'}
          campos={camposMedicamento}
          validar={validarMedicamento}
          alCerrar={cerrar}
          alGuardar={(valores) => {
            const datos = {
              nombre: valores.nombre,
              dosis: valores.dosis,
              frecuencia: valores.frecuencia,
              inicio: valores.inicio,
              hora: valores.hora,
            };
            if (editandoId) {
              actualizarMedicamento(mascota.id, editandoId, datos);
            } else {
              agregarMedicamento(mascota.id, datos);
            }
            cerrar();
          }}
        />
      )}
    </View>
  );
}

function TarjetaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.tarjetaDato}>
      <TextoTema style={estilos.etiquetaDato}>{etiqueta}</TextoTema>
      <TextoTema tipo="subtitulo" style={estilos.valorDato}>{valor}</TextoTema>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.marca.fondo },
  contenido: { padding: 24, paddingTop: 64, paddingBottom: 36 },
  filtros: { gap: 10, marginBottom: 20 },
  lista: { marginTop: 18 },
  separador: { marginTop: 14, marginBottom: 16 },
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  tarjetaDato: { width: '48%', flexGrow: 1, backgroundColor: Colores.marca.blanco, borderRadius: 16, padding: 14 },
  etiquetaDato: { color: Colores.marca.apagado, fontSize: 11, lineHeight: 15 },
  valorDato: { color: Colores.marca.tinta, fontSize: 20, marginTop: 4 },
  subtituloSeccion: { color: Colores.marca.tinta, fontSize: 18, marginBottom: 14 },
});