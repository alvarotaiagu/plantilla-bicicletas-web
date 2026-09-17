/* ==========================================================================
   Sete Curvas — bicicletas y taller (SITIO DE DEMOSTRACIÓN, negocio ficticio)
   Concepto «Perfil de etapa»: el movimiento protagonista no es una galería,
   es el perfil de altimetría de abajo. Se pinta el tramo hecho, avanza el
   ciclista y se leen el punto kilométrico, la altitud y la pendiente, todo
   calculado del propio dibujo del perfil.

   - `has-motion` solo se enciende si GSAP y ScrollTrigger existen de verdad.
   - El perfil es CONTENIDO, no adorno: se actualiza también con
     prefers-reduced-motion, ahí directamente sobre el evento de scroll.
   - El tramo hecho se recorta con un rectángulo, no con stroke-dasharray: el
     viewBox del perfil va estirado y el guion se deformaría.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = gsapReady && !reduce.matches;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (motion) raiz.classList.add('has-motion');
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── 1. Scroll suave ─────────────────────────────────────────────────── */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.getElementById(id.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView();
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ── 2. El perfil de la etapa (recurso protagonista) ─────────────────── */
  (function perfil() {
    var caja = $('[data-perfil]');
    if (!caja) return;
    var linea = $('.perfil__linea', caja);
    var recorte = $('[data-recorrido]', caja);
    var ciclista = $('[data-ciclista]', caja);
    var lecturaKm = $('[data-lectura-km]');
    var lecturaAlt = $('[data-lectura-alt]');
    var lecturaPen = $('[data-lectura-pendiente]');
    var lecturaTexto = $('[data-lectura-texto]');
    var marcas = $$('.perfil__marca', caja);
    var enlaces = $$('.nav a[href^="#"]');
    if (!linea) return;

    // Mismos números que usó el generador del perfil.
    var VB_W = 1000, VB_H = 140, BASE = 128, TECHO = 18;
    var KMAX = 42, ALTMIN = 80, ALTMAX = 700;

    // Se lee el propio dibujo: así la lectura nunca se desincroniza del perfil.
    var puntos = linea.getAttribute('d').replace(/^M/, '').split('L').map(function (p) {
      var xy = p.trim().split(/\s+/);
      return [parseFloat(xy[0]), parseFloat(xy[1])];
    });

    function yEn(x) {
      if (x <= puntos[0][0]) return puntos[0][1];
      for (var i = 1; i < puntos.length; i++) {
        if (puntos[i][0] >= x) {
          var a = puntos[i - 1], b = puntos[i];
          var t = (x - a[0]) / ((b[0] - a[0]) || 1);
          return a[1] + (b[1] - a[1]) * t;
        }
      }
      return puntos[puntos.length - 1][1];
    }
    function altEn(x) { return ALTMIN + ((BASE - yEn(x)) / (BASE - TECHO)) * (ALTMAX - ALTMIN); }

    function coma(n, dec) { return n.toFixed(dec).replace('.', ','); }

    var ultimo = -1;
    function pintar(p) {
      p = Math.min(1, Math.max(0, p));
      var x = p * VB_W;
      var km = p * KMAX;
      var alt = altEn(x);
      // pendiente entre 250 m antes y 250 m después, en porcentaje
      var d = VB_W * (0.25 / KMAX);
      var alt1 = altEn(Math.max(0, x - d));
      var alt2 = altEn(Math.min(VB_W, x + d));
      var pendiente = ((alt2 - alt1) / 500) * 100;

      if (recorte) recorte.setAttribute('width', x.toFixed(1));
      if (ciclista) {
        ciclista.style.left = (p * 100).toFixed(2) + '%';
        ciclista.style.top = ((yEn(x) / VB_H) * 100).toFixed(2) + '%';
      }
      if (lecturaKm) lecturaKm.textContent = 'km ' + coma(km, 1);
      if (lecturaAlt) lecturaAlt.textContent = Math.round(alt) + ' m';
      if (lecturaPen) lecturaPen.textContent = (pendiente >= 0 ? '+' : '−') + coma(Math.abs(pendiente), 1) + ' %';
      var redondo = Math.round(km);
      if (lecturaTexto && redondo !== ultimo) {
        ultimo = redondo;
        lecturaTexto.textContent = 'km ' + redondo + ', altitud ' + Math.round(alt) + ' metros';
      }
    }

    function progreso() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      return alto > 0 ? window.scrollY / alto : 0;
    }

    if (motion) {
      ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'bottom bottom',
        onUpdate: function (self) { pintar(self.progress); }
      });
    } else {
      // sin movimiento el perfil sigue siendo contenido: se actualiza igual
      var pendienteRaf = false;
      window.addEventListener('scroll', function () {
        if (pendienteRaf) return;
        pendienteRaf = true;
        requestAnimationFrame(function () { pendienteRaf = false; pintar(progreso()); });
      }, { passive: true });
    }
    pintar(progreso());

    // sección activa: marca del perfil y enlace del menú
    var secciones = $$('[data-seccion]');
    function activar(id) {
      marcas.forEach(function (m) { m.classList.toggle('es-actual', m.getAttribute('data-marca') === id); });
      enlaces.forEach(function (a) { a.classList.toggle('es-actual', a.getAttribute('href') === '#' + id); });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) activar(e.target.getAttribute('data-seccion'));
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      secciones.forEach(function (s) { io.observe(s); });
    }
  })();

  /* ── 3. Titulares letra a letra ──────────────────────────────────────── */
  function partir(el) {
    var original = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', original);
    el.textContent = '';
    var letras = [];
    original.split(' ').forEach(function (palabra, i, todas) {
      var cont = document.createElement('span');
      cont.className = 'palabra';
      cont.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'palabra__letra';
        s.textContent = c;
        cont.appendChild(s);
        letras.push(s);
      });
      el.appendChild(cont);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return letras;
  }

  // Lo de «una sola vez» va con IntersectionObserver a propósito: un
  // ScrollTrigger con once:true NO dispara si el elemento ya está en pantalla
  // cuando se crea, y el titular se queda sin aparecer.
  function alEntrar(el, hacer, margen) {
    if (!('IntersectionObserver' in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        hacer();
      });
    }, { rootMargin: margen || '0px 0px -8% 0px' });
    io.observe(el);
  }

  if (motion) {
    $$('[data-char]').forEach(function (el) {
      var letras = partir(el);
      // `y: 0` explícito: GSAP leería cualquier translate3d heredado del CSS
      // como píxeles y las letras se quedarían clavadas abajo.
      gsap.set(letras, { y: 0, yPercent: 60, opacity: 0 });
      var comun = { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.016 };
      if (el.closest('.hero')) gsap.to(letras, Object.assign({ delay: 0.15 }, comun));
      else alEntrar(el, function () { gsap.to(letras, comun); });
    });
  }

  /* ── 4. Entradas ─────────────────────────────────────────────────────── */
  if (motion) {
    [['.kicker', 12], ['.indice', 12], ['.parrafo', 14], ['.hero__entrada', 14],
     ['.hero__acciones', 14], ['.hero__cifras', 14], ['.bici', 24],
     ['.tabla tbody tr', 12], ['.taller__foto', 22], ['.tarifas li', 12],
     ['.rutas li', 18], ['.alquiler__foto', 22], ['.club__texto', 20],
     ['.club__foto', 22], ['.fichas li', 20]
    ].forEach(function (par) {
      $$(par[0]).forEach(function (el, i) {
        var enHero = !!el.closest('.hero');
        var ajustes = {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          startAt: { y: par[1] },
          delay: enHero ? 0.5 + i * 0.08 : (i % 4) * 0.05
        };
        if (enHero) gsap.to(el, ajustes);
        else alEntrar(el, function () { gsap.to(el, ajustes); });
      });
    });
  }

  /* ── 5. Contadores ───────────────────────────────────────────────────── */
  $$('[data-contador]').forEach(function (el) {
    var fin = parseFloat(el.getAttribute('data-contador'));
    var sufijo = el.getAttribute('data-sufijo') || '';
    if (!motion) { el.textContent = fin + sufijo; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: fin, duration: 1.4, ease: 'power2.out', delay: 0.6,
      onUpdate: function () { el.textContent = Math.round(obj.v) + sufijo; }
    });
  });

  /* ── 6. Botones magnéticos ───────────────────────────────────────────── */
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-iman]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        qx((e.clientX - (c.left + c.width / 2)) * 0.3);
        qy((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      el.addEventListener('blur', function () { qx(0); qy(0); });
    });
  }

  /* ── 7. Cursor: una rueda ────────────────────────────────────────────── */
  (function cursor() {
    var el = $('[data-cursor]');
    if (!el || !motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var texto = $('.cursor__texto', el);
    var qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); });

    var zonas = [
      ['.bici', 'rueda'],
      ['.rutas li', 'la ruta'],
      ['[data-mapa-boton]', 'cargar'],
      ['a, button, input, select, textarea', 'vamos']
    ];
    document.addEventListener('pointerover', function (e) {
      for (var i = 0; i < zonas.length; i++) {
        if (e.target.closest(zonas[i][0])) {
          el.classList.add('es-grande');
          texto.textContent = zonas[i][1];
          return;
        }
      }
      el.classList.remove('es-grande');
      texto.textContent = '';
    });
  })();

  /* ── 8. Horario en vivo ──────────────────────────────────────────────── */
  (function horario() {
    var estado = $('[data-estado]');
    if (!estado) return;
    var filas = $$('[data-horario] > div');
    // Horario ficticio. 0 = domingo. Minutos desde medianoche.
    var HORARIO = {
      0: [], 1: [],
      2: [[600, 840], [990, 1200]],
      3: [[600, 840], [990, 1200]],
      4: [[600, 840], [990, 1200]],
      5: [[600, 840], [990, 1200]],
      6: [[600, 840]]
    };
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    function dd(n) { return String(n).padStart(2, '0'); }
    function txt(m) { return dd(Math.floor(m / 60)) + ':' + dd(m % 60); }

    function refrescar() {
      var ahora = new Date();
      var d = ahora.getDay();
      var min = ahora.getHours() * 60 + ahora.getMinutes();
      var tramos = HORARIO[d];
      var cierra = null, abreHoy = null;
      tramos.forEach(function (t) {
        if (min >= t[0] && min < t[1]) cierra = t[1];
        else if (min < t[0] && abreHoy === null) abreHoy = t[0];
      });

      if (cierra !== null) {
        estado.textContent = 'Abierto ahora · hasta las ' + txt(cierra);
        estado.classList.add('esta-abierto');
      } else if (abreHoy !== null) {
        estado.textContent = 'Cerrado · abre hoy a las ' + txt(abreHoy);
        estado.classList.remove('esta-abierto');
      } else {
        var salto = 1;
        while (salto < 8 && HORARIO[(d + salto) % 7].length === 0) salto++;
        var dia = (d + salto) % 7;
        estado.textContent = 'Cerrado · abre el ' + DIAS[dia] + ' a las ' + txt(HORARIO[dia][0][0]);
        estado.classList.remove('esta-abierto');
      }
      filas.forEach(function (f) {
        var dias = (f.getAttribute('data-dias') || '').split(',');
        f.classList.toggle('es-hoy', dias.indexOf(String(d)) !== -1);
      });
    }
    refrescar();
    setInterval(refrescar, 30000);
  })();

  /* ── 9. Cabecera ─────────────────────────────────────────────────────── */
  (function cabecera() {
    var el = $('[data-cabecera]');
    if (!el) return;
    function mirar() { el.classList.toggle('esta-pegada', window.scrollY > 20); }
    mirar();
    window.addEventListener('scroll', mirar, { passive: true });
  })();

  /* ── 10. Menú móvil ──────────────────────────────────────────────────── */
  var boton = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  function cerrarMenu() {
    if (!boton || !menu) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('esta-abierto');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('esta-abierto', !abierto);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ── 11. Mapa solo bajo clic ─────────────────────────────────────────── */
  (function mapa() {
    var caja = $('[data-mapa]');
    var btn = $('[data-mapa-boton]');
    if (!caja || !btn) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rúa da Ponte Nova 5, Ourense') + '&output=embed';
      marco.title = 'Mapa de la dirección de muestra: Rúa da Ponte Nova, 5, Ourense';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      btn.remove();
      caja.insertBefore(marco, caja.firstChild);
      if (gsapReady) ScrollTrigger.refresh();
    });
  })();

  /* ── 12. Formulario de cita (de muestra) ─────────────────────────────── */
  (function cita() {
    var form = $('[data-cita]');
    if (!form) return;
    var salida = $('[data-cita-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('#nombre');
      var tel = form.querySelector('#tel');
      if (!nombre.value.trim()) { salida.textContent = 'Escribe un nombre para la cita.'; nombre.focus(); return; }
      if (!tel.value.trim()) { salida.textContent = 'Hace falta un teléfono para confirmarte la hora.'; tel.focus(); return; }
      salida.textContent = 'Formulario de demostración: la cita de ' + nombre.value.trim() + ' no se ha enviado a ningún sitio.';
    });
  })();

  /* ── 13. Aviso de cookies ────────────────────────────────────────────── */
  (function cookies() {
    var banner = $('[data-cookies]');
    if (!banner) return;
    var CLAVE = 'setecurvas-cookies';
    var visto = null;
    try { visto = localStorage.getItem(CLAVE); } catch (err) { visto = null; }
    if (!visto) banner.hidden = false;
    var ok = $('[data-cookies-ok]', banner);
    if (ok) {
      ok.addEventListener('click', function () {
        banner.hidden = true;
        try { localStorage.setItem(CLAVE, '1'); } catch (err) { /* modo privado */ }
      });
    }
  })();

  /* ── 14. Refrescos ───────────────────────────────────────────────────── */
  if (gsapReady) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
