# Cómo desplegar IKIBOARD en Supabase (paso a paso)

Todo el código de IKIBOARD está listo. Lo único que falta es aplicar las
migraciones en Supabase y conceder el permiso. Regla de oro: **migración antes que
código**. Todas las migraciones son **idempotentes** (se pueden ejecutar varias
veces sin romper nada).

## Parte A — Ejecutar las migraciones (SQL Editor de Supabase)

1. Entra en **supabase.com** → tu proyecto → menú izquierdo **SQL Editor** → **New query**.
2. Para cada archivo de la lista, EN ESTE ORDEN: ábrelo en el repo, copia TODO su
   contenido, pégalo en el editor y pulsa **Run**. Espera el "Success" antes del siguiente.

   1. `migrations/platform.sql`  *(catálogo de herramientas + permisos + get_my_tools; probablemente ya está de PASO — correrlo de nuevo no hace daño)*
   2. `migrations/estrellas.sql`  *(crea estrella_results)*
   3. `migrations/camino.sql`     *(crea camino_results)*
   4. `migrations/masks.sql`      *(crea mask_results)*
   5. `migrations/ikiboard.sql`   *(registra la herramienta + tabla ikiboard)*
   6. `migrations/ikiboard_items.sql`   *(ikiboard_items + ikiboard_item_reviews)*
   7. `migrations/ikiboard_storage.sql` *(bucket privado ikiboard + RLS de Storage)*

   IKIBOARD LEE de estrella_results / camino_results / mask_results / paso_results,
   por eso esas van antes. (paso.sql ya está en producción.)

## Parte B — Conceder acceso a IKIBOARD

Con las tablas creadas, la app sigue redirigiendo al dashboard a quien no tenga la
herramienta desbloqueada. Hay que dar el permiso en la tabla `entitlements`.

### Para TU usuario (pruebas) — cambia el correo:

```sql
insert into entitlements (user_id, tool_id, source)
select u.id, t.id, 'manual'
from auth.users u
cross join tools t
where u.email = 'TU_CORREO@ejemplo.com'
  and t.code = 'ikiboard'
  and not exists (
    select 1 from entitlements e
    where e.user_id = u.id and e.tool_id = t.id
  );
```

### Para TODOS los usuarios actuales (cuando quieras abrirlo a todos):

```sql
insert into entitlements (user_id, tool_id, source)
select u.id, t.id, 'manual'
from auth.users u
cross join tools t
where t.code = 'ikiboard'
  and not exists (
    select 1 from entitlements e
    where e.user_id = u.id and e.tool_id = t.id
  );
```

## Parte C — Comprobar que funciona

1. En Supabase → **Storage**: confirma que existe el bucket **ikiboard** y que NO es público.
2. Entra en la app con tu usuario → el dashboard debe mostrar **IKIBOARD**.
3. Abre `/ikiboard`, completa un paso (autoguarda) y sube una foto de prueba en el
   álbum. Si la foto se ve y persiste al recargar, Storage + RLS están bien.

## Nota

No hace falta redeploy de la web para esto: las migraciones son cambios en la base
de datos. El código que las usa ya está desplegado.
