import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { EncabezadoPantalla } from '@/componentes/encabezado-pantalla';
import { EstadoVacio } from '@/componentes/estado-vacio';
import { FilaRegistro } from '@/componentes/fila-registro';
import { FiltroChips } from '@/componentes/filtro-chips';
import { GraficoBarras } from '@/componentes/grafico-barras';
import { ModalFormulario, type CampoFormulario } from '@/componentes/modal-formulario';
import { SelectorMascota } from '@/componentes/selector-mascota';
import { TextoTema } from '@/componentes/texto-tema';
import { ETIQUETAS_TIPO_VACUNA, NOMBRES_INDICADOR, UNIDADES_INDICADOR } from '@/constantes/registros';
import { Colores } from '@/constantes/tema';
import { usarPetcare } from '@/contextos/contexto-petcare';
import type { TipoIndicador, TipoVacuna } from '@/tipos/modelos';
import { confirmar } from '@/utilidades/alertas';
import { formatearDia, formatearFechaCompleta, hoyIso } from '@/utilidades/fechas';

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
    eliminarVacuna,
    agregarIndicador,
    eliminarIndicador,
    agregarMedicamento,
    alternarMedicamento,
    eliminarMedicamento,
  } = usarPetcare();
  const [seccion, setSeccion] = useState<Seccion>('vacunas');
  const [tipoIndicador, setTipoIndicador] = useState<TipoIndicador>('peso');
  const [formulario, setFormulario] = useState<Formulario>('ninguno');

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
    { clave: 'nombre', etiqueta: 'Nombre', obligatorio: true, placeholder: 'Ej: Antirrábica' },
    { clave: 'tipo', etiqueta: 'Tipo', tipo: 'opciones', opciones: OPCIONES_VACUNA },
    { clave: 'fecha', etiqueta: 'Fecha de aplicación', tipo: 'fecha', obligatorio: true, noFutura: true, valorInicial: hoyIso() },
    { clave: 'proximaDosis', etiqueta: 'Próxima dosis (opcional)', tipo: 'fecha' },
    { clave: 'clinica', etiqueta: 'Clínica (opcional)' },
  ];

  const camposIndicador: CampoFormulario[] = [
    { clave: 'tipo', etiqueta: 'Indicador', tipo: 'opciones', opciones: OPCIONES_INDICADOR, valorInicial: tipoIndicador },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true, noFutura: true, valorInicial: hoyIso() },
    { clave: 'valor', etiqueta: 'Valor', tipo: 'numero', obligatorio: true, placeholder: 'Ej: 18.5' },
  ];

  const camposMedicamento: CampoFormulario[] = [
    { clave: 'nombre', etiqueta: 'Medicamento', obligatorio: true },
    { clave: 'dosis', etiqueta: 'Dosis', obligatorio: true, placeholder: 'Ej: 1 comprimido' },
    { clave: 'frecuencia', etiqueta: 'Frecuencia', obligatorio: true, placeholder: 'Ej: cada 12 horas' },
    { clave: 'inicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', obligatorio: true, valorInicial: hoyIso() },
    { clave: 'hora', etiqueta: 'Hora del recordatorio diario (opcional)', tipo: 'hora' },
  ];

  const validarVacuna = (valores: Record<string, string>) => {
    if (valores.proximaDosis && valores.proximaDosis < valores.fecha) {
      return 'La próxima dosis no puede ser anterior a la fecha de aplicación.';
    }
    const repetida = mascota.vacunas.some(
      (vacuna) => vacuna.nombre.trim().toLowerCase() === valores.nombre.toLowerCase() && vacuna.fecha === valores.fecha
    );
    return repetida ? 'Ya registraste esta vacuna en esa fecha.' : null;
  };

  const validarIndicador = (valores: Record<string, string>) => {
    const valor = Number(valores.valor);
    if (valores.tipo === 'peso' && (valor < 0.1 || valor > 150)) {
      return 'El peso debe estar entre 0,1 y 150 kg.';
    }
    if (valores.tipo === 'temperatura' && (valor < 30 || valor > 45)) {
      return 'La temperatura debe estar entre 30 y 45 °C.';
    }
    return null;
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <EncabezadoPantalla sobretitulo="SALUD" titulo="Salud" subtitulo="Vacunas, indicadores y tratamientos de tu mascota." />
        <View style={estilos.filtros}>
          <SelectorMascota />
          <FiltroChips opciones={SECCIONES} valor={seccion} alCambiar={setSeccion} />
        </View>

        {seccion === 'vacunas' && (
          <>
            <BotonPrincipal texto="Registrar vacuna o desparasitación" alPresionar={() => setFormulario('vacuna')} />
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
              <BotonPrincipal texto="Registrar medición" alPresionar={() => setFormulario('indicador')} />
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
                  alEliminar={() => confirmar('Eliminar medición', '¿Eliminar esta medición?', 'Eliminar', () => eliminarIndicador(mascota.id, indicador.id))}
                />
              ))}
            </View>
          </>
        )}

        {seccion === 'medicamentos' && (
          <>
            <BotonPrincipal texto="Registrar medicamento" alPresionar={() => setFormulario('medicamento')} />
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
          titulo="Vacuna o desparasitación"
          subtitulo={`Registro para ${mascota.nombre}. Si indicas próxima dosis, recibirás un aviso.`}
          campos={camposVacuna}
          validar={validarVacuna}
          alCerrar={() => setFormulario('ninguno')}
          alGuardar={(valores) => {
            agregarVacuna(mascota.id, {
              nombre: valores.nombre,
              tipo: valores.tipo as TipoVacuna,
              fecha: valores.fecha,
              proximaDosis: valores.proximaDosis,
              clinica: valores.clinica || 'Sin clínica indicada',
            });
            setFormulario('ninguno');
          }}
        />
      )}

      {formulario === 'indicador' && (
        <ModalFormulario
          titulo="Registrar medición"
          subtitulo={`Seguimiento de ${mascota.nombre}`}
          campos={camposIndicador}
          validar={validarIndicador}
          alCerrar={() => setFormulario('ninguno')}
          alGuardar={(valores) => {
            agregarIndicador(mascota.id, {
              tipo: valores.tipo as TipoIndicador,
              fecha: valores.fecha,
              valor: Number(valores.valor.replace(',', '.')),
            });
            setTipoIndicador(valores.tipo as TipoIndicador);
            setFormulario('ninguno');
          }}
        />
      )}

      {formulario === 'medicamento' && (
        <ModalFormulario
          titulo="Medicamento o tratamiento"
          subtitulo={`Indicado para ${mascota.nombre}. Con hora de aviso recibirás un recordatorio diario.`}
          campos={camposMedicamento}
          alCerrar={() => setFormulario('ninguno')}
          alGuardar={(valores) => {
            agregarMedicamento(mascota.id, {
              nombre: valores.nombre,
              dosis: valores.dosis,
              frecuencia: valores.frecuencia,
              inicio: valores.inicio,
              hora: valores.hora,
            });
            setFormulario('ninguno');
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
