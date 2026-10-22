(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings();
  let user = await U.nav('home');

  document.title = `${st.name} · Reservá tu turno online`;
  $('#ft').textContent = `© ${new Date().getFullYear()} ${st.name}`;
  $('#addr').textContent = st.address;
  $('#waBtn').href = U.waLink(st); $('#igBtn').href = `https://instagram.com/${st.instagram}`;
  U.waFloat(st);

  const services = await DB.getServices();
  $('#svcGrid').innerHTML = services.map((s) => `<article class="card svc"><h3>${esc(s.name)}</h3><p class="muted">${esc(s.desc)}</p>
    <div class="meta"><span class="muted">${s.duration} min</span><span class="price">${U.money(s.price, st.currency)}</span></div></article>`).join('');

  const today = new Date().getDay();
  $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = st.hours[d];
    return `<div class="${d === today ? 'today' : ''}"><span>${U.DOW[d]}</span><span>${h ? DB.util.fromMin(h[0]) + ' – ' + DB.util.fromMin(h[1]) : 'Cerrado'}</span></div>`;
  }).join('');

  /* ---- asistente de reserva ---- */
  const wiz = $('#wiz'); const sel = { service: null, date: null, time: null, note: '' }; let step = 1;
  const prog = () => `<div class="progress">${[1, 2, 3, 4].map((i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;

  async function draw() {
    if (step === 1) {
      wiz.innerHTML = prog() + '<h3 style="margin-bottom:14px">1. ¿Qué servicio querés?</h3>' + services.map((s) =>
        `<button class="opt ${sel.service && sel.service.id === s.id ? 'sel' : ''}" data-id="${s.id}"><span><b>${esc(s.name)}</b><br><small class="muted">${s.duration} min</small></span><span class="price">${U.money(s.price, st.currency)}</span></button>`).join('');
      wiz.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { sel.service = services.find((s) => s.id === b.dataset.id); sel.date = sel.time = null; step = 2; draw(); }));
    } else if (step === 2) {
      const days = []; for (let i = 0; i < st.advanceDays; i++) { const d = DB.util.addDays(new Date(), i); days.push(d); }
      wiz.innerHTML = prog() + `<h3 style="margin-bottom:14px">2. Elegí día y hora</h3><div class="days" role="listbox" aria-label="Día">${days.map((d) => {
        const k = DB.util.ymd(d), closed = !st.hours[d.getDay()];
        return `<button class="day ${sel.date === k ? 'sel' : ''}" data-d="${k}" ${closed ? 'disabled' : ''}><small>${U.DOW[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('es-AR', { month: 'short' })}</small></button>`;
      }).join('')}</div><div id="slots" aria-live="polite"></div>
      <div style="display:flex;justify-content:space-between;margin-top:22px"><button class="btn ghost sm" id="back">Atrás</button><button class="btn" id="next" ${sel.time ? '' : 'disabled'}>Continuar</button></div>`;
      wiz.querySelectorAll('.day').forEach((b) => (b.onclick = () => { sel.date = b.dataset.d; sel.time = null; draw(); }));
      $('#back', wiz).onclick = () => { step = 1; draw(); }; $('#next', wiz).onclick = () => { step = 3; draw(); };
      if (sel.date) {
        const slots = await DB.getSlots(sel.date, sel.service.id);
        $('#slots', wiz).innerHTML = slots.length ? `<div class="slots">${slots.map((s) => `<button class="slot ${sel.time === s.time ? 'sel' : ''}" data-t="${s.time}" ${s.free ? '' : 'disabled'}>${s.time}</button>`).join('')}</div>` : '<p class="muted" style="margin-top:16px">No quedan horarios ese día. Probá con otro.</p>';
        wiz.querySelectorAll('.slot').forEach((b) => (b.onclick = () => { sel.time = b.dataset.t; draw(); }));
      }
    } else if (step === 3) {
      wiz.innerHTML = prog() + `<h3 style="margin-bottom:14px">3. Confirmá tu turno</h3><div class="summary">
        <div><span class="muted">Servicio</span><b>${esc(sel.service.name)}</b></div><div><span class="muted">Día</span><b>${U.fmtDate(sel.date)}</b></div>
        <div><span class="muted">Hora</span><b>${sel.time}</b></div><div><span class="muted">Precio</span><b>${U.money(sel.service.price, st.currency)}</b></div></div>
        <div class="field" style="margin-top:16px"><label for="note">Comentario (opcional)</label><textarea id="note" rows="2" maxlength="200">${esc(sel.note)}</textarea></div>
        <p class="muted" style="font-size:.85rem">El pago se coordina en el local. Podés cancelar hasta ${st.cancelHours} h antes.</p>
        <div class="err-msg" id="err" role="alert"></div>
        <div style="display:flex;justify-content:space-between;margin-top:10px"><button class="btn ghost sm" id="back">Atrás</button><button class="btn" id="ok">${user ? 'Confirmar reserva' : 'Ingresar y confirmar'}</button></div>`;
      $('#back', wiz).onclick = () => { sel.note = $('#note').value; step = 2; draw(); };
      $('#ok', wiz).onclick = async () => {
        sel.note = $('#note').value;
        if (!user) { user = await U.openAuth('up'); if (!user) return; await U.nav('home'); document.querySelectorAll('.nav').forEach((n, i) => i && n.remove()); }
        try { await DB.createBooking({ serviceId: sel.service.id, date: sel.date, time: sel.time, note: sel.note }); step = 4; draw(); }
        catch (e) { $('#err').textContent = e.message; if (/disponible/.test(e.message)) { sel.time = null; setTimeout(() => { step = 2; draw(); }, 1400); } }
      };
    } else {
      wiz.innerHTML = prog() + `<div style="text-align:center;padding:20px 0"><div style="font-size:3rem">✂️</div><h3 style="margin:8px 0">¡Listo, ${esc(user.name.split(' ')[0])}!</h3>
        <p class="muted">Tu turno del <b>${U.fmtDate(sel.date)} a las ${sel.time}</b> quedó <b>pendiente de confirmación</b>. Te avisamos en la app apenas lo confirmemos.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap"><a class="btn" href="cuenta.html">Ver mis reservas</a><button class="btn ghost" id="again">Reservar otro</button></div></div>`;
      $('#again', wiz).onclick = () => { sel.service = sel.date = sel.time = null; sel.note = ''; step = 1; draw(); };
    }
  }
  draw();
})();
