drop trigger if exists al_crear_usuario on auth.users;

drop table if exists
  public.recordatorios,
  public.controles,
  public.medicamentos,
  public.indicadores,
  public.vacunas,
  public.visitas,
  public.acceso_veterinarios,
  public.mascotas,
  public.perfiles
cascade;

drop function if exists public.crear_perfil();
drop function if exists public.vincular_por_codigo(text);
drop function if exists public.renovar_codigo_qr(uuid);
drop function if exists public.actualizar_observaciones(uuid, text);
drop function if exists public.es_tutor(uuid);
drop function if exists public.tiene_acceso(uuid);

drop policy if exists fotos_subir on storage.objects;
drop policy if exists fotos_actualizar on storage.objects;
drop policy if exists fotos_borrar on storage.objects;

delete from auth.users;
