export type Rol = 'tutor' | 'veterinario';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  clinica: string;
};

export type TipoVisita = 'consulta' | 'vacuna' | 'peso';

export type Visita = {
  id: string;
  fecha: string;
  tipo: TipoVisita;
  titulo: string;
  clinica: string;
};

export type TipoVacuna = 'vacuna' | 'desparasitacion';

export type Vacuna = {
  id: string;
  nombre: string;
  tipo: TipoVacuna;
  fecha: string;
  proximaDosis: string;
  clinica: string;
};

export type TipoIndicador = 'peso' | 'temperatura';

export type Indicador = {
  id: string;
  tipo: TipoIndicador;
  fecha: string;
  valor: number;
};

export type Medicamento = {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  inicio: string;
  hora: string;
  activo: boolean;
};

export type Control = {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  clinica: string;
};

export type Recordatorio = {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
};

export type TipoMascota = 'Perro' | 'Gato' | 'Otro';

export type Sexo = 'Macho' | 'Hembra';

export type VeterinarioConAcceso = {
  id: string;
  nombre: string;
  clinica: string;
};

export type Mascota = {
  id: string;
  numero: number;
  tutorId: string;
  tutorNombre: string;
  nombre: string;
  tipo: TipoMascota;
  sexo: Sexo;
  raza: string;
  fechaNacimiento: string;
  colorPelaje: string;
  pesoKg: string;
  detalle: string;
  observaciones: string;
  edad: string;
  peso: string;
  fotoUrl: string | null;
  codigoQr: string;
  color: string;
  iniciales: string;
  visitas: Visita[];
  vacunas: Vacuna[];
  indicadores: Indicador[];
  medicamentos: Medicamento[];
  controles: Control[];
  recordatorios: Recordatorio[];
  veterinarios: VeterinarioConAcceso[];
};

export type FotoElegida = {
  uri: string;
  base64: string;
};

export type DatosMascota = Pick<
  Mascota,
  'nombre' | 'tipo' | 'sexo' | 'raza' | 'fechaNacimiento' | 'colorPelaje' | 'pesoKg' | 'detalle'
>;
export type DatosVisita = Omit<Visita, 'id'>;
export type DatosVacuna = Omit<Vacuna, 'id'>;
export type DatosIndicador = Omit<Indicador, 'id'>;
export type DatosMedicamento = Omit<Medicamento, 'id' | 'activo'>;
export type DatosControl = Omit<Control, 'id'>;
export type DatosRecordatorio = Omit<Recordatorio, 'id'>;