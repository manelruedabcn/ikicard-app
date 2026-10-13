# Correos de cuenta (Supabase Auth): confirmar y restablecer contraseña

## Por qué no funcionaba

1. **No llegaba.** El correo que trae Supabase por defecto solo envía a los
   miembros del equipo del proyecto y unos pocos por hora. Para el público hay
   que conectar un servidor propio (SMTP): usamos Resend, el mismo de la app.
2. **El enlace fallaba** aunque llegara. La plantilla por defecto usa un
   enlace (`code`, flujo PKCE) que solo funciona en el mismo navegador donde la
   persona se registró: registrarse en el ordenador y abrir el correo en el
   móvil daba error. Además, sin `next`, el enlace volvía a una dirección que
   no canjeaba el código.

**Arreglo en código** (`app/auth/confirm/route.ts`): ruta nueva que acepta
`token_hash` + `type` (funciona en cualquier dispositivo) y, por
compatibilidad, `code`. El registro y «olvidé mi contraseña» pasan siempre por
ella. El idioma de la persona se guarda en sus metadatos (`data.locale`) para
que la plantilla salga en castellano, catalán o inglés.

## Pasos en los paneles (una sola vez)

### 1. Resend: clave para Supabase
- Resend → **API Keys** → *Create API Key*. Nombre `supabase-smtp`, permiso
  **Sending access**, dominio `ikigaier.com`. Copia la clave (`re_…`).
- El dominio `ikigaier.com` ya está verificado en Resend (la app envía desde
  `hola@ikigaier.com`).

### 2. Supabase → Authentication → **Emails** → *SMTP Settings*
- **Enable Custom SMTP**: activado.
- Sender email: `hola@ikigaier.com` · Sender name: `IKIGAIER`
- Host: `smtp.resend.com` · Port: `465`
- Username: `resend` · Password: la clave `re_…`
- Guardar.

### 3. Supabase → Authentication → **Rate Limits**
- *Rate limit for sending emails*: súbelo a **100 por hora** (con SMTP propio
  el valor inicial es bajo).

### 4. Supabase → Authentication → **URL Configuration**
- **Site URL**: `https://app.ikigaier.com`
- **Redirect URLs**: añade `https://app.ikigaier.com/**` (y
  `http://localhost:3000/**` si pruebas en local).

### 5. Supabase → Authentication → **Emails** → *Templates*
Pega el HTML completo en cada plantilla (pestaña *Source*):

| Plantilla | Asunto | Archivo |
|---|---|---|
| **Confirm sign up** | `IKIGAIER · Confirma tu correo` | `docs/auth-emails/confirmar-cuenta.html` |
| **Reset password** | `IKIGAIER · Nueva contraseña` | `docs/auth-emails/restablecer-contrasena.html` |

El cuerpo cambia de idioma solo (`.Data.locale`); el asunto es uno para
todos. Quien entró con Google o se registró antes de este cambio no tiene
idioma guardado: le sale en castellano.

### 6. Probar
1. Regístrate en `https://app.ikigaier.com/es/login` con un correo que no
   sea del equipo de Supabase (p. ej. uno de Gmail secundario).
2. Abre el correo **en otro dispositivo** (el móvil) y pulsa el botón:
   debe llevarte al dashboard ya con sesión.
3. «¿Olvidaste tu contraseña?» con ese correo → el enlace lleva al formulario
   de nueva contraseña.
4. Si algo falla: Resend → **Emails** (¿salió?) y Supabase → **Logs → Auth**.

Cuando funcione, activa `PROGRAMA_PASO_CON_CUENTA=1` (ver `docs/programa.md`).
