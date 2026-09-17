# Sete Curvas — plantilla de tienda y taller de bicicletas

> **Sitio de demostración.** «Sete Curvas, bicicletas y taller» es un **negocio
> ficticio**. El nombre, la dirección (Rúa da Ponte Nova, 5 · Ourense), el teléfono
> (988 00 00 15), el horario, los precios del taller, los seis modelos, las tres rutas y
> las tres personas del equipo son **datos de muestra inventados**. No corresponden a
> ningún negocio real. La página lleva `noindex, nofollow` a propósito.

**Demo:** https://alvarotaiagu.github.io/plantilla-bicicletas-web/

---

## El concepto: «Perfil de etapa»

Una tienda de bicis vive de las salidas, y una salida se cuenta con su perfil: el dibujo
de la altimetría, los puntos kilométricos y la pendiente que viene. Así que **la web se
recorre como una etapa de 42 km**:

- El **perfil vive pegado abajo**, siempre a la vista. Se va pintando de naranja según
  bajas, un punto marca dónde estás y a la derecha se leen **el kilómetro, la altitud y
  la pendiente**, calculados del propio dibujo del perfil, no escritos a mano.
- Cada sección es un **punto kilométrico**: km 3 el taller, km 11 las bicis, km 27 el
  club… y el marcador correspondiente se enciende en el perfil al llegar.
- La sección más dura del sitio (el club, la que habla de subir) está en el **km 27, el
  punto más alto** del perfil. La llegada baja otra vez a 180 m.
- Las ruedas de las bicis del catálogo **giran** al pasar por encima.

Registro visual: cartel deportivo sobre papel greige, tipografía ancha en mayúsculas,
naranja flúor y verde pino. Ni oscuro-industrial ni editorial.

## Mapa de secciones

| km | Sección | Qué hace |
|---|---|---|
| 0 | Salida | Titular letra a letra y tres contadores |
| 3 | Taller | Tabla de precios con tiempos y foto del banco de trabajo |
| 11 | Las bicis | Seis modelos dibujados en SVG, con las ruedas girando al pasar por encima |
| 19 | Alquiler y rutas | Tarifas de alquiler y tres rutas con su perfil en texto |
| 27 | El club de los martes | El punto más alto del perfil; salidas, ritmos y normas |
| 34 | Quién atiende | Las tres personas del taller |
| 42 | Llegada | Cita de taller, horario **en vivo** y mapa bajo clic |

## Recursos de movimiento

1. **Lenis** como único motor de scroll.
2. **El perfil de la etapa** — el recurso protagonista: tramo hecho, ciclista y lectura
   de km/altitud/pendiente ligados al scroll.
3. **Marcador de sección** en el perfil y en el menú, con `IntersectionObserver`.
4. **Titulares letra a letra**.
5. **Ruedas que giran** en las tarjetas del catálogo (animación CSS pura).
6. **Botones magnéticos** y **cursor** en forma de rueda.
7. **Contadores** y **horario en vivo** con el día de hoy resaltado.

## Rendimiento medido

Medido con `PerformanceObserver` de `longtask` en la pasada de verificación (Chromium,
1440×900, recorrido completo de la página con la rueda del ratón):

- **1 tarea larga en total**, de **92 ms**, y ocurre **al arrancar** (es GSAP + la
  webfont, no el código de la plantilla).
- **0 tareas largas mientras se rueda**: el perfil se repinta en cada scroll pero solo
  escribe un `width` de un rectángulo de recorte y dos propiedades del punto, así que no
  provoca trabajo largo.

## Cómo reskinearlo a una tienda real

1. **El perfil se genera, no se dibuja a mano.** Está en el HTML entre
   `<!--PERFIL-->` y `<!--/PERFIL-->`. Para cambiarlo hay que tocar los puntos de paso
   (km, altitud y etiqueta) del script `genperfil.js` que acompaña a esta plantilla y
   volver a montarlo. Si cambian los kilómetros, hay que cambiar también el `data-km` de
   cada `<section>` y la constante `KMAX` de `js/main.js`.
2. **Ojo con el perfil y `stroke-dasharray`**: el SVG va con
   `preserveAspectRatio="none"` (se estira para ocupar el ancho), y ahí el truco de
   `stroke-dasharray` + `pathLength` se deforma. Por eso el tramo hecho se recorta con un
   **rectángulo de `clipPath`**, que no se ve afectado por el estirado.
3. **Datos del negocio** — el `application/ld+json` del `<head>`, la sección del km 42,
   el `<footer>` y la consulta del mapa (sección 11 de `js/main.js`).
   Quitar `noindex, nofollow` y el sello de demostración.
4. **Horario** — sección 8 de `js/main.js`: el objeto `HORARIO` en minutos desde
   medianoche, con `0 = domingo`, y el `<dl>` del km 42 con su `data-dias`.
5. **Bicis** — los seis SVG de `assets/bicis/`. Para una tienda real lo normal es
   sustituirlos por fotos de producto: basta cambiar el `<img>` de cada
   `<li class="bici">`. Si se quedan los dibujos, el giro de las ruedas depende de que el
   SVG tenga sus ruedas en un `<g class="rueda">`.
6. **Paleta y tipografía** — las variables de `:root` en `css/estilo.css` y el `<link>`
   de Google Fonts.
7. **Textos legales** — `legal.html`, incluido el apartado de rutas.

## Decisiones tomadas

- **Las rutas avisan de que son inventadas** y de que no están señalizadas: publicar una
  ruta ficticia como si se pudiera salir a rodarla sería una tontería peligrosa.
- **Sin `aggregateRating` ni `review`** en los datos estructurados.
- **Nada de marcas reales**: las seis bicis son dibujo propio y sus precios y pesos son
  inventados.
- **Fotos sin caras identificables** y con pie que aclara que no son este negocio.
- **Lo de «una sola vez» va con `IntersectionObserver`**, no con `ScrollTrigger`
  `once: true`: ese no dispara si el elemento ya está en pantalla cuando se crea y el
  titular se quedaría sin aparecer.
- **El perfil es contenido, no adorno**: con `prefers-reduced-motion` se sigue
  actualizando, ahí directamente sobre el evento de scroll, y hay una versión en texto
  del punto kilométrico para lectores de pantalla.
- **Sin GSAP la página se lee entera**: los estados «vacíos» viven bajo `.has-motion`.

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md). Tres fotos de Pexels acreditadas; el resto es dibujo
propio generado con script.

## Técnico

HTML + CSS + un `main.js`. Sin framework, sin build, sin backend, sin npm. GSAP,
ScrollTrigger y Lenis por CDN. Se abre con doble clic en `index.html` y se publica tal
cual en GitHub Pages.
