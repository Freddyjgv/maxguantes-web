# Parche completo del centro de recursos · versión 5

Este paquete parte de `Maxguantes-actual.zip` y sustituye la capa de Recursos sin incluir secretos, dependencias ni archivos generados.

## Contenido

- Nuevo índice `/recursos/` dividido en **Guías técnicas** y **Conociendo nuestros productos**.
- Ocho recursos nuevos: una guía de calzado ASTM F2413, seis guías individuales Portwest y una comparativa FR09/FR18/FR20.
- Nueve fichas técnicas oficiales descargables: FR21, FR720, FR26, FR89, BZ31, A780, FR09, FR18 y FR20.
- Imagen oficial de FR20 convertida a WebP y copia local de respaldo.
- Navegación relacionada, índice interno, preguntas frecuentes, fuentes, descargas y datos estructurados.
- Diseño adaptable para escritorio, tableta y móvil.
- Corrección de A780 a **ANSI CUT A4**, conforme a la ficha vigente facilitada.

## Revisión de interfaz de la versión 2

- Entrada mediante tres rutas simples: guías, productos y glosario.
- Eliminación de imágenes destacadas de gran tamaño en el índice.
- Guías técnicas presentadas como una lista compacta y escaneable.
- Productos organizados por SKU, con imágenes limitadas al tamaño útil de una miniatura.
- Encabezados de artículos reducidos para mostrar contenido desde el primer pantallazo.
- Glosario plegable para evitar sobrecarga de información.
- Nueva versión de caché para asegurar que el navegador cargue el CSS actualizado.

## Revisión editorial de la versión 3

- Guías técnicas convertidas en un índice editorial compacto, sin numeración ni tarjetas grandes.
- Nuevo encabezado: **Entendiendo los productos y sus normas**.
- Nuevo bloque de productos: **Conozca a detalle · Nuestros productos más solicitados**.
- Aplicaciones habituales visibles en cada referencia del índice.
- Nueva sección editorial en cada artículo con sectores, usos, importancia práctica y límites de selección.
- Contexto para energía eléctrica, oil & gas, petroquímica, combustibles, offshore, soldadura, metalmecánica y mantenimiento, según las características de cada referencia.

## Organización final de la versión 4

- El bloque **Conozca a detalle · Nuestros productos más solicitados** aparece primero.
- Los artículos técnicos aparecen después, agrupados automáticamente por su categoría.
- Cada categoría indica cuántos artículos contiene y se abre como un acordeón.
- Al abrir una categoría se cierra la anterior, evitando que la biblioteca produzca un desplazamiento vertical excesivo.
- Las nuevas publicaciones aparecerán dentro de su categoría usando el campo `category` de `src/config.mjs`.

## Ajuste visual de la versión 5

- Categorías rediseñadas como paneles compactos con borde, contador y control de apertura claramente visible.
- El artículo de la categoría abierta se presenta en una franja editorial ordenada, sin tarjetas sobredimensionadas.
- Eliminación completa del bloque de glosario y de su acceso en el encabezado de Recursos.
- La entrada principal queda reducida a dos caminos: productos Portwest y artículos técnicos.
- Nueva versión de caché para forzar la descarga del CSS corregido y evitar que el navegador reutilice estilos anteriores.

## Archivos principales modificados

- `src/config.mjs`
- `src/render.mjs`
- `src/assets/styles.css`
- `src/data/products.json`
- `scripts/build.mjs`
- `src/assets/resources/*`

## Aplicación

El ZIP contiene el proyecto completo actualizado. Sustituya su copia de trabajo por esta carpeta o copie únicamente los archivos indicados arriba conservando la misma estructura.

Después ejecute:

```bash
npm run build
npm run check
```

La compilación local de entrega generó 41 rutas y la validación revisó correctamente 42 páginas HTML. En producción, el constructor seguirá cargando el catálogo publicado desde Supabase cuando estén disponibles las variables de entorno.

## Alcance técnico

Los datos de cada referencia Portwest provienen de las fichas vigentes facilitadas. La guía de calzado separa claramente el significado de las marcaciones ASTM de la selección final para una tarea y no atribuye certificaciones no documentadas a los modelos del catálogo.
