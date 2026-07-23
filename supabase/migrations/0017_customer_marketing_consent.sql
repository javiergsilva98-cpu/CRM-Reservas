-- Añade el consentimiento de marketing (RGPD) a la alta/deduplicación de
-- clientes desde el formulario público. Sustituye la función anterior de
-- 4 parámetros por una de 5 (hay que borrarla primero: Postgres identifica
-- las funciones por nombre + tipos de parámetros, así que "or replace" con
-- una lista distinta crearía una sobrecarga ambigua en vez de sustituirla).

drop function if exists find_or_create_customer(uuid, text, text, text);

create or replace function find_or_create_customer(
  p_restaurant_id uuid,
  p_first_name text,
  p_phone text,
  p_email text,
  p_gdpr_marketing boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_phone is not null then
    select id into v_id from customers
      where restaurant_id = p_restaurant_id and phone = p_phone;
  end if;

  if v_id is null and p_email is not null then
    select id into v_id from customers
      where restaurant_id = p_restaurant_id and email = p_email;
  end if;

  if v_id is null then
    insert into customers (restaurant_id, first_name, phone, email, gdpr_marketing, gdpr_consent_at)
    values (
      p_restaurant_id, p_first_name, p_phone, p_email,
      p_gdpr_marketing,
      case when p_gdpr_marketing then now() else null end
    )
    returning id into v_id;
  elsif p_gdpr_marketing then
    -- Marcar consentimiento de un cliente ya existente si ahora lo da;
    -- no lo revocamos aquí si en una reserva posterior deja la casilla sin
    -- marcar, ya que eso no equivale a una baja explícita.
    update customers
      set gdpr_marketing = true, gdpr_consent_at = coalesce(gdpr_consent_at, now())
      where id = v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function find_or_create_customer(uuid, text, text, text, boolean)
  to anon, authenticated;
