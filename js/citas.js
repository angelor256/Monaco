(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); let user = await U.nav('citas');
  const [services, barbers] = [await DB.getServices(), await DB.getBarbers()];
  const wiz = $('#wiz'), sum = $('#sum');
  const LABELS = ['Servicio', 'Barbero', 'Fecha y hora', 'Tus datos'];
  const qs = new URLSearchParams(location.search);
  const sel = { service: services.find((s) => s.id === qs.get('servicio')) || null, barber: null, date: null, time: null, slotBarber: null, note: '' };
  const qb = qs.get('barbero'); if (qb) sel.barber = barbers.find((b) => b.id === qb) || null;
  let step = sel.service ? 2 : 1; if (sel.service && sel.barber) step = 3;
  let done = null;

  const barberName = () => (sel.barber ? sel.barber.name : 'Cualquiera disponible');
  const stepper = () => { $('#stepper').innerHTML = LABELS.map((l, i) => `<li class="${i + 1 === step ? 'on' : ''} ${i + 1 < step || done ? 'done' : ''}" ${i + 1 === step ? 'aria-current="step"' : ''}>${l}</li>`).join(''); };
  const summary = () => {
    const row = (k, v) => `<div><span class="muted">${k}</span><b>${v || '—'}</b></div>`;
    sum.innerHTML = `<h3 style="margin-bottom:14px">Tu reserva</h3><div class="summary">${row('Servicio', sel.service && esc(sel.service.name))}${row('Barbero', step > 2 || sel.barber ? esc(barberName()) : '')}
      ${row('Día', sel.date && U.fmtDate(sel.date))}${row('Hora', sel.time)}${row('Duración', sel.service && sel.service.duration + ' min')}${row('Total', sel.service && U.money(sel.service.price, st.currency))}</div>
      <p class="muted" style="font-size:.82rem;margin-top:14px">Pagás en el local. Cancelación gratis hasta ${st.cancelHours} h antes.</p>`;
  };
  const nav = (back, nextLabel, nextDisabled) => `<div style="display:flex;justify-content:space-between;gap:10px;margin-top:22px">${back ? '<button class="btn ghost sm" id="back">Atrás</button>' : '<span></span>'}${nextLabel ? `<button class="btn" id="next" ${nextDisabled ? 'disabled' : ''}>${nextLabel}</button>` : ''}</div>`;
  const go = (n) => { step = n; draw(); wiz.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };

  async function draw() {
    stepper(); summary();
    if (done) {
      const b = barbers.find((x) => x.id === done.barberId);
      wiz.innerHTML = `<div class="center" style="padding:16px 0"><div style="font-size:3rem" aria-hidden="true">✂️</div><h2 style="font-size:1.8rem;margin:8px 0">¡Listo, ${esc(user.name.split(' ')[0])}!</h2>
        <p class="muted">Tu turno del <b>${U.fmtDate(done.date)} a las ${done.time}</b>${b ? ` con <b>${esc(b.name)}</b>` : ''} quedó <b>pendiente de confirmación</b>. Te avisamos en la app apenas lo confirmemos.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap"><a class="btn" href="cuenta.html">Ver mis reservas</a><a class="btn ghost" href="citas.html">Reservar otro</a></div></div>`;
      return;
    }
    if (step === 1) {
      wiz.innerHTML = '<h2 style="font-size:1.5rem;margin-bottom:14px">1. Elegí el servicio</h2>' + services.map((s) => `<button class="opt ${sel.service && sel.service.id === s.id ? 'sel' : ''}" data-id="${s.id}"><span><b>${esc(s.name)}</b><br><small class="muted">${s.duration} min</small></span><span class="price">${U.money(s.price, st.currency)}</span></button>`).join('');
      wiz.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { sel.service = services.find((s) => s.id === b.dataset.id); sel.date = sel.time = null; go(2); }));
    } else if (step === 2) {
      const any = `<button class="opt ${!sel.barber ? 'sel' : ''}" data-id="any"><span class="l"><span class="av" aria-hidden="true">★</span><span><b>Cualquiera disponible</b><br><small class="muted">Más horarios libres</small></span></span></button>`;
      wiz.innerHTML = '<h2 style="font-size:1.5rem;margin-bottom:14px">2. Elegí tu barbero</h2>' + any + barbers.map((b) => `<button class="opt ${sel.barber && sel.barber.id === b.id ? 'sel' : ''}" data-id="${b.id}"><span class="l"><span class="av" aria-hidden="true">${esc(U.initials(b.name))}</span><span><b>${esc(b.name)}</b><br><small class="muted">${esc(b.role)}</small></span></span></button>`).join('') + nav(true);
      wiz.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { sel.barber = barbers.find((x) => x.id === b.dataset.id) || null; sel.date = sel.time = null; go(3); }));
      $('#back', wiz).onclick = () => go(1);
    } else if (step === 3) {
      const days = Array.from({ length: st.advanceDays }, (_, i) => DB.util.addDays(new Date(), i));
      wiz.innerHTML = `<h2 style="font-size:1.5rem;margin-bottom:14px">3. Elegí día y hora</h2><div class="days" role="group" aria-label="Día">${days.map((d) => { const k = DB.util.ymd(d), closed = !st.hours[d.getDay()];
        return `<button class="day ${sel.date === k ? 'sel' : ''}" data-d="${k}" ${closed ? 'disabled' : ''}><small>${U.DOW[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('es-AR', { month: 'short' })}</small></button>`; }).join('')}</div>
        <div id="slots" aria-live="polite"></div>${nav(true, 'Continuar', !sel.time)}`;
      wiz.querySelectorAll('.day').forEach((b) => (b.onclick = () => { sel.date = b.dataset.d; sel.time = null; draw(); }));
      $('#back', wiz).onclick = () => go(2); $('#next', wiz).onclick = () => go(4);
      if (sel.date) {
        const slots = await DB.getSlots(sel.date, sel.service.id, sel.barber ? sel.barber.id : 'any');
        $('#slots', wiz).innerHTML = slots.length ? `<div class="slots">${slots.map((s) => `<button class="slot ${sel.time === s.time ? 'sel' : ''}" data-t="${s.time}" ${s.free ? '' : 'disabled'}>${s.time}</button>`).join('')}</div>` : '<p class="muted" style="margin-top:16px">No quedan horarios ese día. Probá con otro.</p>';
        wiz.querySelectorAll('.slot').forEach((b) => (b.onclick = () => { sel.time = b.dataset.t; draw(); }));
      }
    } else {
      user = await DB.currentUser(); const isClient = user && user.role === 'client';
      wiz.innerHTML = `<h2 style="font-size:1.5rem;margin-bottom:14px">4. Tus datos</h2>${user && !isClient ? '<p class="err-msg">Estás con la sesión del dueño. Cerrá sesión para reservar como cliente.</p>' : ''}
        <form id="df" novalidate><div class="row2"><div class="field"><label for="dn">Nombre y apellido</label><input id="dn" autocomplete="name" value="${isClient ? esc(user.name) : ''}" required></div>
        <div class="field"><label for="dp">Teléfono / WhatsApp</label><input id="dp" type="tel" autocomplete="tel" value="${isClient ? esc(user.phone) : ''}" required></div></div>
        ${isClient ? '' : `<div class="row2"><div class="field"><label for="de">Email</label><input id="de" type="email" autocomplete="email" required></div><div class="field"><label for="dw">Creá una contraseña</label><input id="dw" type="password" autocomplete="new-password" minlength="6" required></div></div>
        <p class="muted" style="font-size:.85rem;margin-bottom:12px">Se crea tu cuenta para que veas y cambies tus turnos. ¿Ya tenés una? <a href="#" id="hasAcc" style="color:var(--gold);text-decoration:underline">Ingresar</a></p>`}
        <div class="field"><label for="dt">Comentario (opcional)</label><textarea id="dt" rows="2" maxlength="200">${esc(sel.note)}</textarea></div>
        <div class="err-msg" id="err" role="alert"></div>${nav(true, 'Confirmar reserva', user && !isClient)}</form>`;
      $('#back', wiz).onclick = () => { sel.note = $('#dt').value; go(3); };
      const ha = $('#hasAcc', wiz); if (ha) ha.onclick = async (e) => { e.preventDefault(); const u = await U.openAuth('in'); if (u) { user = u; document.querySelector('.nav').remove(); document.querySelector('.site-footer').remove(); document.querySelector('.wa-float').remove(); await U.nav('citas'); draw(); } };
      $('#df', wiz).onsubmit = async (e) => {
        e.preventDefault(); const v = (id) => ($(id, wiz) || {}).value || ''; sel.note = v('#dt'); const err = $('#err', wiz);
        const btn = $('#next', wiz); btn.disabled = true;
        try {
          if (!v('#dn').trim() || !v('#dp').trim()) throw new Error('Completá nombre y teléfono.');
          if (!isClient) user = await DB.signUp({ name: v('#dn'), phone: v('#dp'), email: v('#de'), password: v('#dw') });
          else if (v('#dn').trim() !== user.name || v('#dp').trim() !== user.phone) user = await DB.updateProfile({ name: v('#dn').trim(), phone: v('#dp').trim() });
          done = await DB.createBooking({ serviceId: sel.service.id, barberId: sel.barber ? sel.barber.id : 'any', date: sel.date, time: sel.time, note: sel.note });
          draw();
        } catch (ex) { err.textContent = ex.message; btn.disabled = false; if (/disponible/.test(ex.message)) setTimeout(() => { sel.time = null; go(3); }, 1500); }
      };
    }
  }
  draw();
})();
