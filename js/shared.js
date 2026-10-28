/* Utilidades compartidas: navegación, toasts, login/registro, formato */
(function () {
  const DB = window.MonacoDB;
  const S = {};
  S.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.$ = (sel, el = document) => el.querySelector(sel);
  S.$$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  S.money = (n, cur) => `${cur || '₡'}${String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}`; // ₡10 000 (formato de Costa Rica)
  const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  S.DOW = DOW;
  S.fmtDate = (ds) => { const [y, m, d] = ds.split('-').map(Number); const dt = new Date(y, m - 1, d); return `${DOW[dt.getDay()].slice(0, 3)} ${d}/${m}`; };
  S.parseDate = (ds) => { const [y, m, d] = ds.split('-').map(Number); return new Date(y, m - 1, d); };
  const STATUS = { pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Completado', noshow: 'Ausente' };
  S.pill = (st) => `<span class="pill ${st}">${STATUS[st] || st}</span>`;

  S.toast = (msg, isErr) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show' + (isErr ? ' err' : '');
    clearTimeout(t._h); t._h = setTimeout(() => (t.className = ''), 3200);
  };
  S.run = async (fn) => { try { return await fn(); } catch (e) { S.toast(e.message || 'Algo salió mal', true); } };

  S.demoBar = () => {
    if (DB.mode !== 'demo') return;
    const b = document.createElement('div'); b.className = 'demo-bar';
    b.innerHTML = 'Versión de demostración · los datos se guardan solo en este navegador · <a href="#" id="resetDemo">reiniciar demo</a>';
    document.body.prepend(b);
    b.querySelector('#resetDemo').onclick = async (e) => { e.preventDefault(); await DB.resetDemo(); location.href = 'index.html'; };
  };


  /* ---- iconos SVG (sin emojis) ---- */
  const ICONS = {
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    chat: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
    camera: '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 18M8.5 16.5L20 6"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  };
  S.icon = (n) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---- efectos: aparición al hacer scroll, contadores, destellos, brillo en tarjetas ---- */
  S.fx = () => {
    if (S._fx) return; S._fx = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fill = (root) => root.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = S.icon(el.dataset.ic); el.removeAttribute('data-ic'); });
    fill(document);

    // barra superior con sombra al hacer scroll
    const nav = document.querySelector('.nav'); const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // destellos dorados en los héroes
    document.querySelectorAll('.hero, .page-hero').forEach((h) => {
      if (reduce || h.querySelector('.sparks')) return;
      const w = document.createElement('div'); w.className = 'sparks'; w.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 16; i++) { const d = document.createElement('i'); d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--d:${(2 + Math.random() * 4).toFixed(1)}s;--s:${(0.4 + Math.random() * 0.9).toFixed(2)};animation-delay:${(Math.random() * 4).toFixed(1)}s`; w.appendChild(d); }
      h.prepend(w);
    });

    // contadores (30', 100%, 2 h)
    const count = (el) => {
      const m = el.textContent.match(/^(\d+)(.*)$/); if (!m || reduce) return;
      const to = +m[1], suf = m[2], t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
      el.textContent = '0' + suf; requestAnimationFrame(tick);
    };

    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.matches('.stats b')) count(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

    const SEL = '.card, .sec-head, .opt, .shot, .band, .hours, details.faq, .info-list > *, .stats > div, .stats b';
    const scan = (root) => {
      fill(root);
      root.querySelectorAll(SEL).forEach((el) => {
        if (el._rv) return; el._rv = true;
        if (el.matches('.stats b')) { io && io.observe(el); return; }
        if (reduce || !io || el.closest('.modal, .tabbar, #pane')) return;
        const i = [...el.parentElement.children].indexOf(el);
        el.classList.add('rv'); el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms'; io.observe(el);
      });
    };
    scan(document.body);
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n)))).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });

    // brillo que sigue al mouse sobre las tarjetas
    document.addEventListener('pointermove', (e) => { const c = e.target.closest && e.target.closest('.card'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }, { passive: true });
  };

  /* Header + footer persistentes. active: 'home' | 'servicios' | 'citas' | 'equipo' | 'contacto' | otro */
  const LINKS = [['home', 'index.html', 'Inicio'], ['servicios', 'servicios.html', 'Servicios'], ['equipo', 'equipo.html', 'Equipo'], ['contacto', 'contacto.html', 'Contacto']];
  const LOGO = '<span class="m">Monaco</span><span class="s">STUDIO</span>';
  S.nav = async (active) => {
    const [user, st] = [await DB.currentUser(), await DB.getSettings()];
    const acct = user ? `<a class="btn ghost sm" href="${user.role === 'admin' ? 'admin.html' : 'cuenta.html'}" ${active === 'cuenta' || active === 'admin' ? 'aria-current="page"' : ''}>${user.role === 'admin' ? 'Panel' : 'Mi cuenta'}</a>` : '<button class="btn ghost sm" id="navLogin">Ingresar</button>';
    const h = document.createElement('header'); h.className = 'nav';
    h.innerHTML = `<div class="wrap"><a class="logo" href="index.html" aria-label="${S.esc(st.name)}, inicio">${LOGO}</a>
      <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu"><i></i><i></i><i></i></button>
      <nav id="menu" aria-label="Principal">${LINKS.map(([k, href, t]) => `<a class="link" href="${href}" ${k === active ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
        <span class="navend">${acct}<a class="btn sm" href="citas.html" ${active === 'citas' ? 'aria-current="page"' : ''}>Reservar</a></span></nav></div>`;
    const bar = document.body.querySelector('.demo-bar'); bar ? bar.after(h) : document.body.prepend(h);
    const burger = h.querySelector('#burger');
    burger.onclick = () => { const o = h.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && h.classList.contains('open')) { burger.click(); burger.focus(); } });
    const l = h.querySelector('#navLogin'); if (l) l.onclick = () => S.openAuth().then((u) => u && (location.href = u.role === 'admin' ? 'admin.html' : 'cuenta.html'));
    S.footer(st); S.fx();
    return user;
  };
  S.footer = (st) => {
    if (document.querySelector('.site-footer')) return;
    const f = document.createElement('footer'); f.className = 'site-footer';
    const open = [2, 3, 4, 5, 6].map((d) => st.hours[d]).find(Boolean);
    f.innerHTML = `<div class="wrap foot-grid"><div><a class="logo" href="index.html">${LOGO}</a><p class="muted" style="margin-top:12px;max-width:30ch">${S.esc(st.tagline)}</p></div>
      <div><h4>Explorar</h4>${LINKS.map(([, href, t]) => `<a href="${href}">${t}</a>`).join('')}<a href="citas.html">Reservar turno</a></div>
      <div><h4>Visitanos</h4><p class="muted">${S.esc(st.address)}</p>${open ? `<p class="muted">Mar a Sáb · ${DB.util.fromMin(open[0])} – ${DB.util.fromMin(open[1])}</p>` : ''}</div>
      <div><h4>Contacto</h4><a href="${S.waLink(st)}" target="_blank" rel="noopener">WhatsApp</a><a href="https://instagram.com/${S.esc(st.instagram)}" target="_blank" rel="noopener">Instagram</a><a href="tel:${S.esc(st.phone.replace(/[^\d+]/g, ''))}">${S.esc(st.phone)}</a></div></div>
      <div class="wrap foot-end"><span>© ${new Date().getFullYear()} ${S.esc(st.name)}</span><a href="admin.html">Acceso dueño</a></div>`;
    document.body.appendChild(f); S.waFloat(st);
  };

  /* Modal de login/registro. Devuelve una promesa con el usuario (o null si se cierra). */
  S.openAuth = (initial = 'in') => new Promise((resolve) => {
    let mode = initial;
    const m = document.createElement('div'); m.className = 'modal open'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    document.body.appendChild(m);
    const close = (u) => { m.remove(); resolve(u || null); };
    const draw = () => {
      m.innerHTML = `<div class="box"><div class="tabs2"><button data-m="in" class="${mode === 'in' ? 'on' : ''}">Ingresar</button><button data-m="up" class="${mode === 'up' ? 'on' : ''}">Crear cuenta</button></div>
        <form id="af" novalidate>
          ${mode === 'up' ? '<div class="field"><label for="an">Nombre y apellido</label><input id="an" autocomplete="name" required></div><div class="field"><label for="ap">Teléfono / WhatsApp</label><input id="ap" type="tel" autocomplete="tel"></div>' : ''}
          <div class="field"><label for="ae">Email</label><input id="ae" type="email" autocomplete="email" required></div>
          <div class="field"><label for="apw">Contraseña</label><input id="apw" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" required></div>
          <div class="err-msg" id="aerr" role="alert"></div>
          <button class="btn" style="width:100%" type="submit">${mode === 'in' ? 'Ingresar' : 'Crear mi cuenta'}</button>
        </form>
        ${DB.mode === 'demo' ? '<p class="muted" style="font-size:.8rem;margin-top:14px">Demo · clienta: matias@demo.com / demo1234 · dueño: admin@monaco.demo / monaco123</p>' : ''}
        <button class="btn ghost sm" style="margin-top:14px" id="ac">Cancelar</button></div>`;
      m.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
      m.querySelector('#ac').onclick = () => close();
      m.querySelector('#af').onsubmit = async (e) => {
        e.preventDefault(); const v = (id) => (m.querySelector(id) || {}).value || '';
        try {
          const u = mode === 'in' ? await DB.signIn(v('#ae'), v('#apw')) : await DB.signUp({ name: v('#an'), phone: v('#ap'), email: v('#ae'), password: v('#apw') });
          close(u);
        } catch (er) { m.querySelector('#aerr').textContent = er.message; }
      };
      const f = m.querySelector('input'); f && f.focus();
    };
    m.addEventListener('click', (e) => { if (e.target === m) close(); });
    m.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    draw();
  });

  S.svcCard = (s, st, bookLink = true) => `<article class="card svc"><h3>${S.esc(s.name)}</h3><p class="muted">${S.esc(s.desc)}</p>
    <div class="meta"><span class="muted">⏱ ${s.duration} min</span><span class="price">${S.money(s.price, st.currency)}</span></div>
    ${bookLink ? `<a class="btn ghost sm" href="citas.html?servicio=${encodeURIComponent(s.id)}">Reservar este servicio</a>` : ''}</article>`;
  S.initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  S.waLink = (st, text) => `https://wa.me/${st.whatsapp}?text=${encodeURIComponent(text || 'Hola! Quiero consultar por un turno.')}`;
  S.waFloat = (st) => {
    const a = document.createElement('a'); a.className = 'wa-float'; a.href = S.waLink(st); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Escribinos por WhatsApp');
    a.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.8 11.8 0 0 0 2.1 17.7L1 23l5.4-1.4A11.8 11.8 0 0 0 12 23.3 11.8 11.8 0 0 0 20.5 3.5zM12 21.3c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.2.8.9-3.1-.2-.3A9.8 9.8 0 1 1 12 21.3zm5.4-7.3c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-.9 1.1-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.7 14.7 0 0 0 5.6 4.9c2.1.9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.6 2.7 2.7 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.3z"/></svg>';
    document.body.appendChild(a);
  };

  S.registerSW = () => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {}); };

  /* Pestañas: S.tabs(container, {id:{label, render}}) */
  S.tabs = (bar, panes, start) => {
    const keys = Object.keys(panes); let cur = start || keys[0];
    const go = async (k) => {
      cur = k; bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      const out = document.getElementById('pane'); out.innerHTML = ''; await panes[k].render(out);
    };
    bar.innerHTML = keys.map((k) => `<button data-k="${k}">${panes[k].label}<span class="badge" id="b-${k}" hidden></span></button>`).join('');
    bar.querySelectorAll('button').forEach((b) => (b.onclick = () => { history.replaceState(null, '', '#' + b.dataset.k); go(b.dataset.k); }));
    const fromHash = location.hash.slice(1); go(panes[fromHash] ? fromHash : cur);
    return { go, refresh: () => go(cur) };
  };
  S.badge = (k, n) => { const b = document.getElementById('b-' + k); if (b) { b.textContent = n; b.hidden = !n; } };

  window.MonacoUI = S;
})();
