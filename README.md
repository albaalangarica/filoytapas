# Filo y Tapas

App privada (PWA, se instala en el móvil) para la comunidad de **Filo y Tapas**: el tema de cada jueves con sus preguntas, el «Voy 🔥 / No puedo 💔», quién va, los materiales y las reflexiones que deja cada uno después del encuentro.

Todos los datos viven en un **Google Sheet** de tu Drive. La app se publica en **Vercel**.

## Qué hace

| Pantalla | Qué permite |
|---|---|
| **Entrar / Solicitar acceso** | Usuario y contraseña. Quien no tiene cuenta la solicita y un admin la aprueba. |
| **Inicio** | El próximo jueves en grande: título, cita, hora, bar, botones Voy / No puedo y quién va. Las dos primeras preguntas y los últimos jueves. |
| **Jueves** | Una tarjeta por convocatoria, con asistentes y número de reflexiones. |
| **Ficha** | Pestañas *Tema* (introducción y preguntas), *Asistentes* (nombres) y *Reflexiones* (enlaces de cada uno, con título). Botón para compartir en WhatsApp. |
| **Materiales** | Enlace a la carpeta de Drive y a los materiales de cada jueves. |
| **Perfil** | Mis jueves, mis reflexiones, instalar la app, cambiar contraseña, salir. |
| **Admin** | Publicar y editar temas (también como borrador), aprobar o rechazar solicitudes, hacer o quitar admin, resetear contraseñas y dar de baja. |

Reglas: cada miembro edita y borra sus reflexiones; los admins pueden borrar cualquiera. Se puede confirmar asistencia hasta el mismo día del encuentro. Si alguien olvida la contraseña, un admin genera una provisional desde *Admin → Miembros*.

## El Google Sheet

Documento: **«Filo y Tapas · Datos de la app»** en el Drive de Alba. Pestañas:

| Pestaña | Columnas |
|---|---|
| `TEMAS` | id, fecha, hora, lugar, titulo, cita, introduccion, preguntas (una por línea), llamada, materiales_url, autor, publicado (sí/no) |
| `ASISTENCIA` | tema_id, usuario, respuesta (voy/no), actualizado |
| `REFLEXIONES` | id, tema_id, usuario, titulo, url, creado, actualizado |
| `USUARIOS` | usuario, nombre, password_hash, rol (miembro/admin), estado (pendiente/activo/rechazado/baja), creado, sesion |
| `CONFIG` | clave, valor: `drive_url`, `lugar_defecto`, `hora_defecto`, `maps_url`, `ciudad` |

Se puede editar a mano. La app localiza las columnas por su nombre en la primera fila, así que no las renombres. Las contraseñas se guardan cifradas (scrypt) y nunca en claro. Los cambios hechos a mano tardan hasta 30 segundos en verse.

## Puesta en marcha

### 1. Cuenta de servicio de Google (una vez)

1. Entra en <https://console.cloud.google.com/> y crea un proyecto, por ejemplo `filoytapas`.
2. *APIs y servicios → Biblioteca*: busca **Google Sheets API** y pulsa **Habilitar**.
3. *APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio*. Ponle un nombre (`filoytapas-app`) y termina. No hace falta darle roles.
4. Abre la cuenta creada → pestaña **Claves** → *Agregar clave → Crear clave nueva → JSON*. Se descarga un archivo: **guárdalo en privado y no lo subas a GitHub**.
5. Abre el Google Sheet → **Compartir** → pega el email de la cuenta de servicio (`...@...iam.gserviceaccount.com`) como **Editor**. Desmarca «Notificar».

### 2. Vercel

1. En <https://vercel.com/new> importa el repositorio `albaalangarica/filoytapas`. Vercel detecta Next.js solo.
2. Antes de desplegar, en **Environment Variables** añade:

| Variable | Valor |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | El trozo de la URL del Sheet entre `/d/` y `/edit` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` del JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `private_key` del JSON, entero, con `-----BEGIN PRIVATE KEY-----` |
| `SESSION_SECRET` | Una cadena aleatoria larga (mínimo 32 caracteres) |

Para generar `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`, o cualquier frase larga sin sentido.

3. Pulsa **Deploy**. Cada push a `main` vuelve a publicar la app.

### 3. Los primeros admins

1. Martina y Juanma entran en la app y pulsan **Solicitar acceso**.
2. En la pestaña `USUARIOS` del Sheet, en sus filas, cambia `estado` a `activo` y `rol` a `admin`.
3. A partir de ahí, ellos aprueban al resto desde *Admin → Solicitudes*.

## Desarrollo

Requisitos: Node 20.9 o superior.

```bash
npm install
npm run dev        # sin variables de Google arranca en modo demo
```

En **modo demo** los datos son de ejemplo y viven en memoria. Usuarios: `martina` (admin) o `alba`, contraseña `filoytapas`. Para trabajar contra el Sheet real, copia `.env.example` a `.env.local` y rellénalo.

```bash
npm run check      # lint + tipos + tests + build
```

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript estricto · Tailwind CSS 4 · zod · Vitest. Sin dependencias de UI ni de Google: la API de Sheets se llama con `fetch` y una firma JWT de Node. Tipografías Bricolage Grotesque y Figtree servidas localmente.

```
src/
  app/(auth)/        entrar, solicitar acceso
  app/(app)/         inicio, jueves, ficha, materiales, perfil, admin
  components/        interfaz (logo vectorial, tarjetas, botones…)
  lib/store/         acceso al Sheet (Google) y almacén en memoria (demo)
  lib/domain/        tipos, lectura de pestañas, fechas, validación
  lib/auth/          contraseñas (scrypt) y sesión firmada (HMAC)
  lib/actions/       server actions: login, asistencia, reflexiones, admin
```

### Seguridad

- El Sheet es privado: solo lo ven su dueña y la cuenta de servicio.
- Sesión en cookie `httpOnly` firmada, de 30 días. Cambiar o resetear la contraseña, o dar de baja a alguien, cierra sus sesiones abiertas.
- Cada página y cada acción comprueban en el servidor que la cuenta sigue activa y, en las de admin, el rol.
- Lo que escribe la gente se guarda en el Sheet como texto (`RAW`): no se interpretan fórmulas.
- Solo se aceptan enlaces `http(s)`.
- Hay un límite de intentos de login por usuario.
- La app no se indexa en buscadores.
