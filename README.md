# Maxguantes — sitio para Netlify + Supabase

Sitio B2B estático generado con Node.js, sin dependencias externas. Incluye páginas corporativas, categorías SEO, productos de muestra, recursos técnicos, formulario de contacto, solicitud de cotización y WhatsApp.

## Publicar en Netlify

### Opción recomendada: repositorio Git

1. Cree un repositorio privado y suba esta carpeta completa.
2. En Netlify seleccione **Add new project → Import an existing project**.
3. Netlify leerá automáticamente `netlify.toml`.
4. Comando de compilación: `npm run build`.
5. Directorio publicado: `dist`.
6. Publique primero en el dominio temporal de Netlify y conecte `maxguantes.com` solo después de validar.

### Opción manual

1. Ejecute `npm run build`.
2. En Netlify Drop cargue únicamente la carpeta `dist`.

## Formularios

Los formularios usan Netlify Forms. Después del primer despliegue:

1. Abra **Forms** en Netlify.
2. Configure las notificaciones hacia `ventas@maxguantes.com`.
3. Envíe una prueba desde `/contacto/` y otra desde el panel de cotización.

## Conectar Supabase

La compilación consulta la vista pública definida en `SUPABASE_PRODUCTS_VIEW`. Si las variables no existen o la consulta falla, utiliza `src/data/products.json`.

Variables requeridas en Netlify:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PRODUCTS_VIEW` (opcional; por defecto `catalogo`)

Variables opcionales para marketing y SEO:

- `GA4_MEASUREMENT_ID` — activa Google Analytics 4 durante la compilación.
- `GOOGLE_SITE_VERIFICATION` — añade la verificación de Google Search Console.

El adaptador reconoce directamente las columnas actuales de `catalogo`: `tipo`, `nombre`, `codigo`, `marca`, `imagen`, `ficha_tecnica`, `certificaciones`, `orden` y `categoria_orden`. Nunca use la clave `service_role` en Netlify ni en el repositorio. Ejecute primero `supabase/schema.sql` para corregir las políticas públicas de escritura detectadas.

## Actualizar productos

1. Cargue o actualice productos en Supabase.
2. Ejecute un nuevo deploy en Netlify.
3. El generador reconstruirá fichas, categorías, sitemap y buscador.

Posteriormente se puede activar un Build Hook de Netlify desde Supabase para automatizar la reconstrucción.

## Datos por confirmar antes de cambiar el dominio

- Denominación jurídica y RUC que deben mostrarse legalmente.
- Dirección exacta: la web anterior alterna entre Vía España y Parque Lefevre.
- Horario de despacho: la web anterior muestra cierres a las 15:00 y 16:00.
- Número principal de WhatsApp: actualmente configurado como `+507 6433-5738`.
- Políticas comerciales B2B definitivas.
- Marcas que pueden mostrarse como distribuidor autorizado.
- ID definitivo de Google Analytics 4 y propiedad de Search Console.

## Verificación local

```bash
npm run build
npm run check
```

El resultado publicado se genera en `dist/`.
