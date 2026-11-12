import { FiltroChips } from '@/componentes/filtro-chips';
import { usarPetcare } from '@/contextos/contexto-petcare';

export function SelectorMascota() {
  const { mascotas, mascotaSeleccionada, seleccionarMascota } = usarPetcare();

  return (
    <FiltroChips
      opciones={mascotas.map((mascota) => ({ valor: mascota.id, etiqueta: mascota.nombre }))}
      valor={mascotaSeleccionada?.id ?? ''}
      alCambiar={seleccionarMascota}
    />
  );
}
