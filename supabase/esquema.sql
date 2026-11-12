create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol text not null default 'tutor' check (rol in ('tutor', 'veterinario')),
  clinica text not null default '',
  creado timestamptz not null default now()
);

create table public.mascotas (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  tutor_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 40),
  tipo text not null default 'Perro' check (tipo in ('Perro', 'Gato', 'Otro')),
  sexo text not null default 'Macho' check (sexo in ('Macho', 'Hembra')),
  raza text not null default '',
  fecha_nacimiento date,
  color_pelaje text not null default '',
  peso_kg numeric check (peso_kg is null or (peso_kg > 0 and peso_kg <= 150)),
  detalle text not null default '',
  foto_url text,
  codigo_qr text not null unique default replace(gen_random_uuid()::text, '-', ''),
  creado timestamptz not null default now()
);

create table public.acceso_veterinarios (
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  veterinario_id uuid not null references public.perfiles (id) on delete cascade,
  creado timestamptz not null default now(),
  primary key (mascota_id, veterinario_id)
);

create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  tipo text not null check (tipo in ('consulta', 'vacuna', 'peso')),
  titulo text not null,
  clinica text not null default '',
  fecha date not null,
  creado timestamptz not null default now()
);

create table public.vacunas (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('vacuna', 'desparasitacion')),
  fecha date not null,
  proxima_dosis date,
  clinica text not null default '',
  creado timestamptz not null default now(),
  check (proxima_dosis is null or proxima_dosis >= fecha)
);

create table public.indicadores (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  tipo text not null check (tipo in ('peso', 'temperatura')),
  fecha date not null,
  valor numeric not null,
  creado timestamptz not null default now(),
  check (
    (tipo = 'peso' and valor between 0.1 and 150)
    or (tipo = 'temperatura' and valor between 30 and 45)
  )
);

create table public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  nombre text not null,
  dosis text not null,
  frecuencia text not null,
  inicio date not null,
  hora text not null default '' check (hora = '' or hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  activo boolean not null default true,
  creado timestamptz not null default now()
);

create table public.controles (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  titulo text not null,
  fecha date not null,
  hora text not null default '' check (hora = '' or hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  clinica text not null default '',
  creado timestamptz not null default now()
);

create table public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  titulo text not null,
  fecha date not null,
  hora text not null check (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  creado timestamptz not null default now()
);

create unique index mascotas_nombre_unico on public.mascotas (tutor_id, lower(nombre));
create unique index vacunas_unica on public.vacunas (mascota_id, lower(nombre), fecha);
create index on public.mascotas (tutor_id);
create index on public.acceso_veterinarios (veterinario_id);
create index on public.visitas (mascota_id);
create index on public.vacunas (mascota_id);
create index on public.indicadores (mascota_id);
create index on public.medicamentos (mascota_id);
create index on public.controles (mascota_id);
create index on public.recordatorios (mascota_id);

create or replace function public.es_tutor(p_mascota uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mascotas where id = p_mascota and tutor_id = auth.uid()
  );
$$;

create or replace function public.tiene_acceso(p_mascota uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mascotas where id = p_mascota and tutor_id = auth.uid()
  ) or exists (
    select 1 from public.acceso_veterinarios
    where mascota_id = p_mascota and veterinario_id = auth.uid()
  );
$$;

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol, clinica)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'rol' = 'veterinario' then 'veterinario' else 'tutor' end,
    coalesce(new.raw_user_meta_data ->> 'clinica', '')
  );
  return new;
end;
$$;

create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil();

create or replace function public.vincular_por_codigo(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mascota uuid;
begin
  if not exists (select 1 from public.perfiles where id = auth.uid() and rol = 'veterinario') then
    raise exception 'Solo las cuentas de veterinario pueden vincular mascotas.';
  end if;

  select id into v_mascota from public.mascotas where codigo_qr = trim(p_codigo);

  if v_mascota is null then
    raise exception 'El código no es válido o fue renovado.';
  end if;

  insert into public.acceso_veterinarios (mascota_id, veterinario_id)
  values (v_mascota, auth.uid())
  on conflict do nothing;

  return v_mascota;
end;
$$;

create or replace function public.renovar_codigo_qr(p_mascota uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text := replace(gen_random_uuid()::text, '-', '');
begin
  update public.mascotas set codigo_qr = v_codigo where id = p_mascota and tutor_id = auth.uid();

  if not found then
    raise exception 'No tienes permiso para renovar este código.';
  end if;

  return v_codigo;
end;
$$;

revoke execute on function public.vincular_por_codigo(text) from public, anon;
revoke execute on function public.renovar_codigo_qr(uuid) from public, anon;
grant execute on function public.vincular_por_codigo(text) to authenticated;
grant execute on function public.renovar_codigo_qr(uuid) to authenticated;

alter table public.perfiles enable row level security;
alter table public.mascotas enable row level security;
alter table public.acceso_veterinarios enable row level security;
alter table public.visitas enable row level security;
alter table public.vacunas enable row level security;
alter table public.indicadores enable row level security;
alter table public.medicamentos enable row level security;
alter table public.controles enable row level security;
alter table public.recordatorios enable row level security;

create policy perfiles_leer on public.perfiles
  for select to authenticated using (true);

create policy mascotas_leer on public.mascotas
  for select to authenticated using (tutor_id = auth.uid() or public.tiene_acceso(id));

create policy mascotas_crear on public.mascotas
  for insert to authenticated
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.perfiles where id = auth.uid() and rol = 'tutor')
  );

create policy mascotas_actualizar on public.mascotas
  for update to authenticated using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());

create policy mascotas_borrar on public.mascotas
  for delete to authenticated using (tutor_id = auth.uid());

create policy acceso_leer on public.acceso_veterinarios
  for select to authenticated using (veterinario_id = auth.uid() or public.es_tutor(mascota_id));

create policy acceso_borrar on public.acceso_veterinarios
  for delete to authenticated using (veterinario_id = auth.uid() or public.es_tutor(mascota_id));

create policy visitas_todo on public.visitas
  for all to authenticated
  using (public.tiene_acceso(mascota_id)) with check (public.tiene_acceso(mascota_id));

create policy vacunas_todo on public.vacunas
  for all to authenticated
  using (public.tiene_acceso(mascota_id)) with check (public.tiene_acceso(mascota_id));

create policy indicadores_todo on public.indicadores
  for all to authenticated
  using (public.tiene_acceso(mascota_id)) with check (public.tiene_acceso(mascota_id));

create policy medicamentos_todo on public.medicamentos
  for all to authenticated
  using (public.tiene_acceso(mascota_id)) with check (public.tiene_acceso(mascota_id));

create policy controles_todo on public.controles
  for all to authenticated
  using (public.tiene_acceso(mascota_id)) with check (public.tiene_acceso(mascota_id));

create policy recordatorios_todo on public.recordatorios
  for all to authenticated
  using (public.es_tutor(mascota_id)) with check (public.es_tutor(mascota_id));

insert into storage.buckets (id, name, public)
values ('fotos-mascotas', 'fotos-mascotas', true)
on conflict (id) do nothing;

create policy fotos_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-mascotas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy fotos_actualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-mascotas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy fotos_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-mascotas' and (storage.foldername(name))[1] = auth.uid()::text);

alter publication supabase_realtime add table
  public.mascotas,
  public.visitas,
  public.vacunas,
  public.indicadores,
  public.medicamentos,
  public.controles,
  public.recordatorios,
  public.acceso_veterinarios;
