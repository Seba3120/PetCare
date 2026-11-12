import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AvatarMascota } from '@/componentes/avatar-mascota';
import { ModalFormulario, type CampoFormulario } from '@/componentes/modal-formulario';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import type { DatosMascota, FotoElegida, Sexo, TipoMascota } from '@/tipos/modelos';
import { calcularIniciales } from '@/utilidades/mascotas';

const OPCIONES_TIPO: { valor: TipoMascota; etiqueta: string }[] = [
  { valor: 'Perro', etiqueta: 'Perro' },
  { valor: 'Gato', etiqueta: 'Gato' },
  { valor: 'Otro', etiqueta: 'Otro' },
];

const OPCIONES_SEXO: { valor: Sexo; etiqueta: string }[] = [
  { valor: 'Macho', etiqueta: 'Macho' },
  { valor: 'Hembra', etiqueta: 'Hembra' },
];

type Propiedades = {
  titulo: string;
  subtitulo: string;
  textoBoton: string;
  valorInicial: DatosMascota;
  fotoActual?: string | null;
  nombresEnUso: string[];
  alGuardar: (datos: DatosMascota, foto: FotoElegida | null) => void;
  alCerrar: () => void;
  alEliminar?: () => void;
};

export function ModalMascota({
  titulo,
  subtitulo,
  textoBoton,
  valorInicial,
  fotoActual = null,
  nombresEnUso,
  alGuardar,
  alCerrar,
  alEliminar,
}: Propiedades) {
  const [foto, setFoto] = useState<FotoElegida | null>(null);

  const elegirFoto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (resultado.canceled) {
      return;
    }
    const elegida = resultado.assets[0];
    if (elegida.base64) {
      setFoto({ uri: elegida.uri, base64: elegida.base64 });
    }
  };

  const campos: CampoFormulario[] = [
    { clave: 'nombre', etiqueta: 'Nombre de la mascota', obligatorio: true, placeholder: 'Ej: Luna', largoMaximo: 40, valorInicial: valorInicial.nombre },
    { clave: 'tipo', etiqueta: 'Especie', tipo: 'opciones', opciones: OPCIONES_TIPO, valorInicial: valorInicial.tipo },
    { clave: 'raza', etiqueta: 'Raza', placeholder: 'Ej: Golden Retriever', largoMaximo: 40, valorInicial: valorInicial.raza },
    {
      clave: 'fechaNacimiento',
      etiqueta: 'Fecha de nacimiento (DD-MM-AAAA)',
      tipo: 'fecha',
      obligatorio: true,
      noFutura: true,
      placeholder: 'Ej: 10-05-2023',
      valorInicial: valorInicial.fechaNacimiento,
    },
    { clave: 'pesoKg', etiqueta: 'Peso (kg)', tipo: 'numero', minimo: 0.1, maximo: 150, placeholder: 'Ej: 28,5', valorInicial: valorInicial.pesoKg },
    { clave: 'sexo', etiqueta: 'Sexo', tipo: 'opciones', opciones: OPCIONES_SEXO, valorInicial: valorInicial.sexo },
    { clave: 'colorPelaje', etiqueta: 'Color de pelaje', placeholder: 'Ej: Dorado', largoMaximo: 30, valorInicial: valorInicial.colorPelaje },
    { clave: 'detalle', etiqueta: 'Detalle (opcional)', placeholder: 'Ej: Cariñosa y juguetona', largoMaximo: 80, valorInicial: valorInicial.detalle },
  ];

  const encabezado = (
    <View style={estilos.bloqueFoto}>
      <Pressable accessibilityRole="button" accessibilityLabel="Elegir foto" onPress={elegirFoto} style={estilos.botonFoto}>
        <AvatarMascota
          mascota={{
            fotoUrl: foto?.uri ?? fotoActual,
            color: Colores.marca.azul,
            iniciales: valorInicial.nombre ? calcularIniciales(valorInicial.nombre) : '🐾',
          }}
          tamano={92}
          radio={28}
        />
        <TextoTema style={estilos.textoFoto}>{foto || fotoActual ? 'Cambiar foto' : 'Agregar foto'}</TextoTema>
      </Pressable>
    </View>
  );

  const validar = (valores: Record<string, string>) => {
    const nombre = valores.nombre.trim().toLowerCase();
    if (nombresEnUso.some((existente) => existente.trim().toLowerCase() === nombre)) {
      return 'Ya tienes una mascota con ese nombre.';
    }
    return null;
  };

  return (
    <ModalFormulario
      titulo={titulo}
      subtitulo={subtitulo}
      textoBoton={textoBoton}
      campos={campos}
      encabezado={encabezado}
      validar={validar}
      alCerrar={alCerrar}
      textoEliminar="Eliminar mascota"
      alEliminar={alEliminar}
      alGuardar={(valores) =>
        alGuardar(
          {
            nombre: valores.nombre,
            tipo: valores.tipo as TipoMascota,
            sexo: valores.sexo as Sexo,
            raza: valores.raza,
            fechaNacimiento: valores.fechaNacimiento,
            colorPelaje: valores.colorPelaje,
            pesoKg: valores.pesoKg,
            detalle: valores.detalle,
          },
          foto
        )
      }
    />
  );
}

const estilos = StyleSheet.create({
  bloqueFoto: { alignItems: 'center', marginBottom: 20 },
  botonFoto: { alignItems: 'center' },
  textoFoto: { color: Colores.marca.azul, fontSize: 13, fontWeight: '800', marginTop: 10, lineHeight: 18 },
});
