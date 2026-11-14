import { useState, type ReactNode } from 'react';

import { BotonPrincipal } from '@/componentes/boton-principal';
import { CampoTexto } from '@/componentes/campo-texto';
import { HojaModal } from '@/componentes/hoja-modal';
import { SelectorOpciones } from '@/componentes/selector-opciones';
import { TextoTema } from '@/componentes/texto-tema';
import { Colores } from '@/constantes/tema';
import { dmyAIso, fechaValida, hoyIso, isoADmy } from '@/utilidades/fechas';
import { CONTIENE_LETRAS } from '@/utilidades/validaciones';

export type CampoFormulario = {
  clave: string;
  etiqueta: string;
  tipo?: 'texto' | 'fecha' | 'hora' | 'numero' | 'opciones';
  opciones?: { valor: string; etiqueta: string }[];
  obligatorio?: boolean;
  placeholder?: string;
  valorInicial?: string;
  minimo?: number;
  maximo?: number;
  noFutura?: boolean;
  largoMaximo?: number;
  conLetras?: boolean;
  multilinea?: boolean;
};

type Propiedades = {
  titulo: string;
  subtitulo: string;
  textoBoton?: string;
  campos: CampoFormulario[];
  encabezado?: ReactNode;
  validar?: (valores: Record<string, string>) => string | null;
  alGuardar: (valores: Record<string, string>) => void;
  alCerrar: () => void;
  textoEliminar?: string;
  alEliminar?: () => void;
};

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function formatearFechaEscrita(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) {
    return digitos;
  }
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2)}`;
  }
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 4)}-${digitos.slice(4)}`;
}

function formatearHoraEscrita(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 4);
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}

function validarCampo(campo: CampoFormulario, valor: string): string | null {
  const texto = valor.trim();
  if (!texto) {
    return campo.obligatorio ? `Completa el campo "${campo.etiqueta}".` : null;
  }
  if (campo.largoMaximo && texto.length > campo.largoMaximo) {
    return `${campo.etiqueta}: máximo ${campo.largoMaximo} caracteres.`;
  }
  if (campo.conLetras && !CONTIENE_LETRAS.test(texto)) {
    return `${campo.etiqueta}: debe contener letras, no solo números o símbolos.`;
  }
  if (campo.tipo === 'fecha') {
    const fechaIso = dmyAIso(texto);
    if (!fechaValida(fechaIso)) {
      return `${campo.etiqueta}: usa el formato DD-MM-AAAA con una fecha real.`;
    }
    if (campo.noFutura && fechaIso > hoyIso()) {
      return `${campo.etiqueta}: no puede ser una fecha futura.`;
    }
  }
  if (campo.tipo === 'hora' && !FORMATO_HORA.test(texto)) {
    return `${campo.etiqueta}: usa el formato HH:MM, por ejemplo 08:30.`;
  }
  if (campo.tipo === 'numero') {
    if (!/^\d+([.,]\d{1,2})?$/.test(texto)) {
      return `${campo.etiqueta}: ingresa un número válido, por ejemplo 12,5.`;
    }
    const numero = Number(texto.replace(',', '.'));
    if (numero <= 0) {
      return `${campo.etiqueta}: ingresa un número mayor a 0.`;
    }
    if (campo.minimo !== undefined && numero < campo.minimo) {
      return `${campo.etiqueta}: el valor mínimo es ${campo.minimo}.`;
    }
    if (campo.maximo !== undefined && numero > campo.maximo) {
      return `${campo.etiqueta}: el valor máximo es ${campo.maximo}.`;
    }
  }
  return null;
}

function valorInicialDe(campo: CampoFormulario): string {
  const inicial = campo.valorInicial;
  if (inicial !== undefined) {
    return campo.tipo === 'fecha' ? isoADmy(inicial) : inicial;
  }
  return campo.tipo === 'opciones' ? (campo.opciones?.[0]?.valor ?? '') : '';
}

function placeholderDe(campo: CampoFormulario): string | undefined {
  if (campo.placeholder) {
    return campo.placeholder;
  }
  if (campo.tipo === 'fecha') {
    return 'DD-MM-AAAA';
  }
  if (campo.tipo === 'hora') {
    return 'HH:MM';
  }
  return undefined;
}

function normalizarSalida(campo: CampoFormulario, valor: string): string {
  const texto = valor.trim();
  if (!texto) {
    return '';
  }
  if (campo.tipo === 'fecha') {
    return dmyAIso(texto);
  }
  if (campo.tipo === 'numero') {
    return String(Number(texto.replace(',', '.')));
  }
  return texto;
}

export function ModalFormulario({
  titulo,
  subtitulo,
  textoBoton = 'Guardar',
  campos,
  encabezado,
  validar,
  alGuardar,
  alCerrar,
  textoEliminar = 'Eliminar',
  alEliminar,
}: Propiedades) {
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(campos.map((campo) => [campo.clave, valorInicialDe(campo)]))
  );
  const [error, setError] = useState('');

  const cambiarValor = (campo: CampoFormulario, texto: string) => {
    const ajustado =
      campo.tipo === 'fecha' ? formatearFechaEscrita(texto) : campo.tipo === 'hora' ? formatearHoraEscrita(texto) : texto;
    setValores({ ...valores, [campo.clave]: ajustado });
  };

  const guardar = () => {
    for (const campo of campos) {
      const mensaje = validarCampo(campo, valores[campo.clave] ?? '');
      if (mensaje) {
        setError(mensaje);
        return;
      }
    }
    const salida = Object.fromEntries(campos.map((campo) => [campo.clave, normalizarSalida(campo, valores[campo.clave] ?? '')]));
    const mensajeGeneral = validar?.(salida) ?? null;
    if (mensajeGeneral) {
      setError(mensajeGeneral);
      return;
    }
    setError('');
    alGuardar(salida);
  };

  return (
    <HojaModal titulo={titulo} subtitulo={subtitulo} alCerrar={alCerrar}>
      {encabezado}
      {campos.map((campo) =>
        campo.tipo === 'opciones' ? (
          <SelectorOpciones
            key={campo.clave}
            etiqueta={campo.etiqueta}
            opciones={campo.opciones ?? []}
            valor={valores[campo.clave] ?? ''}
            alCambiar={(valor) => setValores({ ...valores, [campo.clave]: valor })}
          />
        ) : (
          <CampoTexto
            key={campo.clave}
            etiqueta={campo.etiqueta}
            value={valores[campo.clave] ?? ''}
            onChangeText={(texto) => cambiarValor(campo, texto)}
            placeholder={placeholderDe(campo)}
            maxLength={campo.largoMaximo}
            multiline={campo.multilinea}
            style={campo.multilinea ? { minHeight: 120, textAlignVertical: 'top' } : undefined}
            keyboardType={
              campo.tipo === 'numero' ? 'decimal-pad' : campo.tipo === 'fecha' || campo.tipo === 'hora' ? 'number-pad' : 'default'
            }
            autoCapitalize={campo.tipo === 'texto' || campo.tipo === undefined ? 'sentences' : 'none'}
          />
        )
      )}
      {error !== '' && <TextoTema style={{ color: Colores.marca.error, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>{error}</TextoTema>}
      <BotonPrincipal texto={textoBoton} alPresionar={guardar} />
      {alEliminar && <BotonPrincipal texto={textoEliminar} variante="contorno" alPresionar={alEliminar} />}
    </HojaModal>
  );
}