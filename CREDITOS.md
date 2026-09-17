# Créditos de imágenes

Sitio de demostración de un negocio ficticio (Sete Curvas, bicicletas y taller).

## Fotografías — Pexels (licencia gratuita de Pexels)

Descargadas al repositorio en dos anchos (`assets/foto/w800` y `assets/foto/w1600`).
No se hotlinkea ninguna. Se eligieron a propósito imágenes **sin caras
identificables**: material, paisaje y ciclistas de muy lejos.

| Archivo | Autor | Página original | Uso en la web |
|---|---|---|---|
| `taller.jpg` | Artem Podrez | https://www.pexels.com/photo/8985913/ | km 3, el taller: banco de trabajo |
| `bosque.jpg` | Виталий Шестаков (Vitaliy Shestakov) | https://www.pexels.com/photo/37897835/ | km 19, rutas: bici apoyada en un pino |
| `carretera.jpg` | Juan manuel Perez | https://www.pexels.com/photo/31517635/ | km 27, el club: tres ciclistas de lejos |

Licencia Pexels: uso gratuito, comercial incluido, sin necesidad de atribución. Se
acredita igualmente por costumbre del repositorio. Ninguna de las tres muestra este
negocio, que es inventado, y así se dice en sus pies de foto.

## Ilustraciones — propias

Dibujadas en SVG para esta plantilla, sin generador de imágenes:

- `assets/bicis/bici-*.svg` — los seis modelos del catálogo (Fisterra, Ancares, Ponte,
  Trevinca, Miño y Airiños). Se generan con un script a partir de **una misma
  geometría**: dos ruedas con sus radios, cuadro, horquilla, transmisión y manillar.
  Lo que cambia por modelo es el tipo de cuadro (paso alto o paso bajo), el manillar
  (curva, riser o plano), el grosor de cubierta, los extras (suspensión, guardabarros,
  batería) y el color. No representan a ninguna marca real.
- El **perfil de la etapa** del pie de página también está generado: se interpola con
  coseno entre siete puntos de paso y se le añade una rugosidad senoidal, para que
  parezca una carretera y no una curva de libro.
- `favicon.svg` y el icono de la marca — un perfil de etapa y una bici a línea.
- `assets/og.png` — imagen para compartir, 1200×630, compuesta con el propio perfil.

## Tipografías

Google Fonts: **Anybody** (titulares, usando su eje de anchura), **Chivo** (texto) y
**Azeret Mono** (datos, precios y la lectura del perfil). Todas con licencia SIL Open
Font License.
