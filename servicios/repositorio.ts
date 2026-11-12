import { Colores } from '@/constantes/tema';
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
  Sexo,
  TipoIndicador,
  TipoMascota,
  TipoVacuna,
  TipoVisita,
  Usuario,
} from '@/tipos/modelos';
import { decodificarBase64 } from '@/utilidades/base64';
import { traducirError } from '@/utilidades/errores';
import { calcularEdad } from '@/utilidades/fechas';
import { calcularIniciales } from '@/utilidades/mascotas';
import { ordenarAscendente, ordenarDescendente } from '@/utilidades/orden';

const BUCKET_FOTOS = 'fotos-mascotas';
const COLORES_MASCOTA = [Colores.marca.coral, Colores.marca.azul, Colores.marca.menta];

const CONSULTA_MASCOTAS = [
  '*',
  'tutor:perfiles!tutor_id(nombre)',
  'visitas(*)',
  'vacunas(*)',
  'indicadores(*)',
  'medicamentos(*)',
  'controles(*)',
  'recordatorios(*)',
  'acceso_veterinarios(veterinario_id, perfiles(nombre, clinica))',
].join(', ');

type FilaVisita = { id: string; tipo: string; titulo: string; clinica: string; fecha: string };
type FilaVacuna = { id: string; nombre: string; tipo: string; fecha: string; proxima_dosis: string | null; clinica: string };
type FilaIndicador = { id: string; tipo: string; fecha: string; valor: number | string };
type FilaMedicamento = { id: string; nombre: string; dosis: string; frecuencia: string; inicio: string; hora: string; activo: boolean };
type FilaControl = { id: string; titulo: string; fecha: string; hora: string; clinica: string };
type FilaRecordatorio = { id: string; titulo: string; fecha: string; hora: string };
type FilaAcceso = { veterinario_id: string; perfiles: { nombre: string; clinica: string | null } | null };

type FilaMascota = {
  id: string;
  numero: number | string;
  tutor_id: string;
  nombre: string;
  tipo: string;
  sexo: string;
  raza: string;
  fecha_nacimiento: string | null;
  color_pelaje: string;
  peso_kg: number | string | null;
  detalle: string;
  foto_url: string | null;
  codigo_qr: string;
  tutor: { nombre: string } | null;
  visitas: FilaVisita[];
  vacunas: FilaVacuna[];
  indicadores: FilaIndicador[];
  medicamentos: FilaMedicamento[];
  controles: FilaControl[];
  recordatorios: FilaRecordatorio[];
  acceso_veterinarios: FilaAcceso[];
};

export type TablaRegistro = 'visitas' | 'vacunas' | 'indicadores' | 'medicamentos' | 'controles' | 'recordatorios';

function verificar(error: { message: string } | null) {
  if (error) {
    throw new Error(traducirError(error.message));
  }
}

function aMascota(fila: FilaMascota): Mascota {
  const numero = Number(fila.numero);
  const indicadores = ordenarDescendente(
    fila.indicadores.map((indicador) => ({
      id: indicador.id,
      tipo: indicador.tipo as TipoIndicador,
      fecha: indicador.fecha,
      valor: Number(indicador.valor),
    }))
  );
  const ultimoPeso = indicadores.find((indicador) => indicador.tipo === 'peso');
  const pesoBase = fila.peso_kg === null ? '' : String(Number(fila.peso_kg));
  return {
    id: fila.id,
    numero,
    tutorId: fila.tutor_id,
    tutorNombre: fila.tutor?.nombre ?? '',
    nombre: fila.nombre,
    tipo: fila.tipo as TipoMascota,
    sexo: (fila.sexo === 'Hembra' ? 'Hembra' : 'Macho') as Sexo,
    raza: fila.raza,
    fechaNacimiento: fila.fecha_nacimiento ?? '',
    colorPelaje: fila.color_pelaje,
    pesoKg: pesoBase,
    detalle: fila.detalle,
    edad: calcularEdad(fila.fecha_nacimiento ?? ''),
    peso: ultimoPeso ? `${ultimoPeso.valor} kg` : pesoBase ? `${pesoBase} kg` : '',
    fotoUrl: fila.foto_url,
    codigoQr: fila.codigo_qr,
    color: COLORES_MASCOTA[numero % COLORES_MASCOTA.length],
    iniciales: calcularIniciales(fila.nombre),
    visitas: ordenarDescendente(
      fila.visitas.map((visita) => ({
        id: visita.id,
        tipo: visita.tipo as TipoVisita,
        titulo: visita.titulo,
        clinica: visita.clinica,
        fecha: visita.fecha,
      }))
    ),
    vacunas: ordenarDescendente(
      fila.vacunas.map((vacuna) => ({
        id: vacuna.id,
        nombre: vacuna.nombre,
        tipo: vacuna.tipo as TipoVacuna,
        fecha: vacuna.fecha,
        proximaDosis: vacuna.proxima_dosis ?? '',
        clinica: vacuna.clinica,
      }))
    ),
    indicadores,
    medicamentos: fila.medicamentos
      .map((medicamento) => ({
        id: medicamento.id,
        nombre: medicamento.nombre,
        dosis: medicamento.dosis,
        frecuencia: medicamento.frecuencia,
        inicio: medicamento.inicio,
        hora: medicamento.hora,
        activo: medicamento.activo,
      }))
      .sort((a, b) => b.inicio.localeCompare(a.inicio)),
    controles: ordenarAscendente(fila.controles),
    recordatorios: ordenarAscendente(fila.recordatorios),
    veterinarios: fila.acceso_veterinarios.map((acceso) => ({
      id: acceso.veterinario_id,
      nombre: acceso.perfiles?.nombre ?? 'Veterinario',
      clinica: acceso.perfiles?.clinica ?? '',
    })),
  };
}

export async function obtenerPerfil(id: string, correo: string): Promise<Usuario> {
  const { data, error } = await supabase.from('perfiles').select('nombre, rol, clinica').eq('id', id).single();
  verificar(error);
  return {
    id,
    correo,
    nombre: data.nombre,
    rol: data.rol === 'veterinario' ? 'veterinario' : 'tutor',
    clinica: data.clinica ?? '',
  };
}

export async function cargarMascotas(): Promise<Mascota[]> {
  const { data, error } = await supabase.from('mascotas').select(CONSULTA_MASCOTAS).order('numero');
  verificar(error);
  return ((data ?? []) as unknown as FilaMascota[]).map(aMascota);
}

function aFilaMascota(datos: DatosMascota) {
  return {
    nombre: datos.nombre,
    tipo: datos.tipo,
    sexo: datos.sexo,
    raza: datos.raza,
    fecha_nacimiento: datos.fechaNacimiento || null,
    color_pelaje: datos.colorPelaje,
    peso_kg: datos.pesoKg ? Number(datos.pesoKg) : null,
    detalle: datos.detalle,
  };
}

export async function crearMascota(tutorId: string, datos: DatosMascota): Promise<string> {
  const { data, error } = await supabase
    .from('mascotas')
    .insert({ tutor_id: tutorId, ...aFilaMascota(datos) })
    .select('id')
    .single();
  verificar(error);
  return data.id as string;
}

export async function actualizarMascota(id: string, datos: DatosMascota): Promise<void> {
  const { error } = await supabase.from('mascotas').update(aFilaMascota(datos)).eq('id', id);
  verificar(error);
}

export async function borrarMascota(id: string): Promise<void> {
  const { error } = await supabase.from('mascotas').delete().eq('id', id);
  verificar(error);
}

export async function borrarFoto(url: string | null): Promise<void> {
  if (!url) {
    return;
  }
  const marca = `/${BUCKET_FOTOS}/`;
  const indice = url.indexOf(marca);
  if (indice === -1) {
    return;
  }
  await supabase.storage.from(BUCKET_FOTOS).remove([url.slice(indice + marca.length)]);
}

export async function subirFotoMascota(
  tutorId: string,
  mascotaId: string,
  foto: FotoElegida,
  urlAnterior: string | null
): Promise<void> {
  const ruta = `${tutorId}/${mascotaId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(ruta, decodificarBase64(foto.base64), { contentType: 'image/jpeg' });
  verificar(error);

  const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta);
  const { error: errorActualizacion } = await supabase
    .from('mascotas')
    .update({ foto_url: data.publicUrl })
    .eq('id', mascotaId);
  verificar(errorActualizacion);

  await borrarFoto(urlAnterior);
}

async function insertar(tabla: TablaRegistro, valores: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(tabla).insert(valores);
  verificar(error);
}

export async function eliminarRegistro(tabla: TablaRegistro, id: string): Promise<void> {
  const { error } = await supabase.from(tabla).delete().eq('id', id);
  verificar(error);
}

export function agregarVisita(mascotaId: string, datos: DatosVisita) {
  return insertar('visitas', {
    mascota_id: mascotaId,
    tipo: datos.tipo,
    titulo: datos.titulo,
    clinica: datos.clinica,
    fecha: datos.fecha,
  });
}

export function agregarVacuna(mascotaId: string, datos: DatosVacuna) {
  return insertar('vacunas', {
    mascota_id: mascotaId,
    nombre: datos.nombre,
    tipo: datos.tipo,
    fecha: datos.fecha,
    proxima_dosis: datos.proximaDosis || null,
    clinica: datos.clinica,
  });
}

export function agregarIndicador(mascotaId: string, datos: DatosIndicador) {
  return insertar('indicadores', {
    mascota_id: mascotaId,
    tipo: datos.tipo,
    fecha: datos.fecha,
    valor: datos.valor,
  });
}

export function agregarMedicamento(mascotaId: string, datos: DatosMedicamento) {
  return insertar('medicamentos', {
    mascota_id: mascotaId,
    nombre: datos.nombre,
    dosis: datos.dosis,
    frecuencia: datos.frecuencia,
    inicio: datos.inicio,
    hora: datos.hora,
  });
}

export function agregarControl(mascotaId: string, datos: DatosControl) {
  return insertar('controles', {
    mascota_id: mascotaId,
    titulo: datos.titulo,
    fecha: datos.fecha,
    hora: datos.hora,
    clinica: datos.clinica,
  });
}

export function agregarRecordatorio(mascotaId: string, datos: DatosRecordatorio) {
  return insertar('recordatorios', {
    mascota_id: mascotaId,
    titulo: datos.titulo,
    fecha: datos.fecha,
    hora: datos.hora,
  });
}

export async function cambiarEstadoMedicamento(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('medicamentos').update({ activo }).eq('id', id);
  verificar(error);
}

export async function vincularPorCodigo(codigo: string): Promise<string> {
  const { data, error } = await supabase.rpc('vincular_por_codigo', { p_codigo: codigo });
  verificar(error);
  return data as string;
}

export async function renovarCodigo(mascotaId: string): Promise<void> {
  const { error } = await supabase.rpc('renovar_codigo_qr', { p_mascota: mascotaId });
  verificar(error);
}

export async function quitarAcceso(mascotaId: string, veterinarioId: string): Promise<void> {
  const { error } = await supabase
    .from('acceso_veterinarios')
    .delete()
    .eq('mascota_id', mascotaId)
    .eq('veterinario_id', veterinarioId);
  verificar(error);
}
