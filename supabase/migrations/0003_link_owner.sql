-- Requiere que el usuario ya exista en Authentication > Users
-- (creado a mano en el Dashboard antes de ejecutar esto)
insert into restaurant_users (restaurant_id, user_id, role)
select r.id, u.id, 'owner'
from restaurants r, auth.users u
where r.slug = 'asador-gonsastrez'
  and u.email = 'javiergsilva98@gmail.com';
