# Configurar Supabase

Proyecto: `xmecjlnmeoqndpdtkzjj`

## 1. Crear las tablas

Abre el SQL Editor:

https://supabase.com/dashboard/project/xmecjlnmeoqndpdtkzjj/sql/new

Copia y ejecuta todo el contenido de:

`supabase/migrations/0001_published_articles.sql`

Eso crea:

- `published_articles`: qué artículo está publicado y cuándo.
- `teacher_emails`: correos autorizados para publicar.
- Políticas RLS: lectura pública, escritura solo del docente.
- El primer usuario de Authentication queda como docente automáticamente.

## 2. Crear el usuario docente

Abre:

https://supabase.com/dashboard/project/xmecjlnmeoqndpdtkzjj/auth/users

Crea un usuario con el correo y la contraseña del docente. Marca la opción de
confirmar el correo si el dashboard la ofrece.

Si ya existía un usuario antes de ejecutar el SQL, el script toma el primero
como docente. Si quieres agregar otro docente después:

```sql
insert into public.teacher_emails (email)
values ('otro-correo@colegio.edu.co')
on conflict (email) do nothing;
```

## 3. Variables del frontend

Ya están en `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

La publishable key es pública y puede ir en el navegador. El `service_role`
nunca se usa en el frontend.

## 4. Probar

1. Reinicia el servidor de Vite para que lea `.env.local`.
2. Entra a `/admin` con el usuario docente.
3. En Drive, publica un DOCX.
4. Abre la publicación en una ventana incógnita: debe verse como publicada.
5. Cierra sesión: la tarjeta "Revisión del docente" no debe aparecer.
