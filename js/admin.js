(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { esc } = U;
  U.demoBar();
  let user = await DB.currentUser();
  if (!user || user.role !== 'admin') {
    if (user) await DB.signOut();
    user = await U.openAuth();
    if (!user || user.role !== 'admin') { if (user) await DB.signOut(); return (location.href = 'index.html'); }
  }
  const st = await DB.getSettings();
  await U.nav('admin');
  let date = DB.util.ymd(new Date());

  const panes = {
    agenda: { label: 'Agenda', async render(el) {
      const all = await DB.listBookings(); const day = all.filter((b) => b.date === date);
      const pending = all.filter((b) => b.status === 'pending').length; U.badge('agenda', pending);
      const rev = day.filter((b) => b.status === 'confirmed' || b.status === 'completed').reduce((a, b) => a + (b.service ? b.service.price : 0), 0);
      el.innerHTML = `<div class="kpis"><div class="card"><b>${day.length}</b><span class="muted">turnos del día</span></div><div class="card"><b>${pending}</b><span class="muted">por confirmar</span></div><div class="card"><b>${U.money(rev, st.currency)}</b><span class="muted">estimado del día</span></div></div>
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center"><button class="btn ghost sm" id="pv">←</button><input type="date" id="dt" value="${date}" style="width:auto"><button class="btn ghost sm" id="nx">→</button><button class="btn ghost sm" id="td">Hoy</button></div>
        ${day.length ? day.map((b) => `<div class="item"><div><div class="when">${b.time} · ${esc(b.name)}</div><div class="muted">${esc(b.service ? b.service.name : '')} · ✂ ${esc(b.barber ? b.barber.name : '—')} · ${esc(b.phone || 'sin teléfono')}${b.note ? ' · “' + esc(b.note) + '”' : ''}</div></div>
          <div class="actions">${U.pill(b.status)}${b.status === 'pending' ? `<button class="btn sm" data-s="confirmed" data-id="${b.id}">Confirmar</button>` : ''}
          ${b.status === 'confirmed' ? `<button class="btn ghost sm" data-s="completed" data-id="${b.id}">Completado</button><button class="btn ghost sm" data-s="noshow" data-id="${b.id}">Ausente</button>` : ''}
          ${b.status === 'pending' || b.status === 'confirmed' ? `<button class="btn danger sm" data-s="cancelled" data-id="${b.id}">Cancelar</button>` : ''}</div></div>`).join('') : '<div class="empty">Sin turnos este día.</div>'}`;
      const shift = (n) => { date = DB.util.ymd(DB.util.addDays(U.parseDate(date), n)); tabs.refresh(); };
      el.querySelector('#pv').onclick = () => shift(-1); el.querySelector('#nx').onclick = () => shift(1);
      el.querySelector('#td').onclick = () => { date = DB.util.ymd(new Date()); tabs.refresh(); };
      el.querySelector('#dt').onchange = (e) => { if (e.target.value) { date = e.target.value; tabs.refresh(); } };
      el.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => U.run(async () => {
        if (b.dataset.s === 'cancelled' && !confirm('¿Cancelar el turno? Se le avisará a la clienta.')) return;
        await DB.setBookingStatus(b.dataset.id, b.dataset.s); U.toast('Actualizado'); tabs.refresh(); })));
    } },
    clientes: { label: 'Clientes', async render(el) {
      const list = await DB.listClients();
      el.innerHTML = `<div class="field"><input id="q" placeholder="Buscar por nombre, email o teléfono" aria-label="Buscar clientes"></div><div class="tablewrap card"><table><thead><tr><th>Cliente</th><th>Contacto</th><th>Turnos</th><th>Ausencias</th><th>Última visita</th></tr></thead><tbody id="tb"></tbody></table></div>`;
      const draw = (q = '') => { el.querySelector('#tb').innerHTML = list.filter((c) => (c.name + c.email + c.phone).toLowerCase().includes(q.toLowerCase()))
        .map((c) => `<tr><td><b>${esc(c.name)}</b>${c.notes ? `<br><small class="muted">${esc(c.notes)}</small>` : ''}</td><td>${esc(c.email)}<br><small class="muted">${esc(c.phone)}</small></td><td>${c.completed}/${c.total}</td><td>${c.noshow}</td><td>${c.last ? U.fmtDate(c.last) : '—'}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Sin resultados</td></tr>'; };
      draw(); el.querySelector('#q').oninput = (e) => draw(e.target.value);
    } },
    servicios: { label: 'Servicios', async render(el) {
      const list = await DB.getServices(true);
      const form = (s = {}) => `<form class="card" data-id="${s.id || ''}" style="margin-bottom:12px"><div class="row2"><div class="field"><label>Nombre</label><input name="name" value="${esc(s.name)}" required></div><div class="field"><label>Descripción</label><input name="desc" value="${esc(s.desc)}"></div></div>
        <div class="row2"><div class="field"><label>Precio (${esc(st.currency)})</label><input name="price" type="number" min="0" value="${s.price ?? ''}" required></div><div class="field"><label>Duración (min)</label><input name="duration" type="number" min="15" step="15" value="${s.duration ?? 30}" required></div></div>
        <div class="actions" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn sm" type="submit">${s.id ? 'Guardar' : 'Agregar servicio'}</button>
        ${s.id ? `<label class="check" style="margin:0"><input type="checkbox" name="active" ${s.active ? 'checked' : ''}> Visible</label><button class="btn danger sm" type="button" data-del="${s.id}">Eliminar</button>` : ''}</div></form>`;
      el.innerHTML = `<h3 style="margin-bottom:12px">Nuevo</h3>${form()}<h3 style="margin:24px 0 12px">Catálogo</h3>${list.map(form).join('')}`;
      el.querySelectorAll('form').forEach((f) => (f.onsubmit = (e) => { e.preventDefault(); U.run(async () => {
        const d = Object.fromEntries(new FormData(f)); const s = { name: d.name.trim(), desc: d.desc, price: Number(d.price), duration: Number(d.duration) };
        if (f.dataset.id) { s.id = f.dataset.id; s.active = f.querySelector('[name=active]').checked; }
        await DB.saveService(s); U.toast('Guardado'); tabs.refresh(); }); }));
      el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => confirm('¿Eliminar servicio?') && U.run(async () => { await DB.deleteService(b.dataset.del); tabs.refresh(); })));
    } },
    equipo: { label: 'Equipo', async render(el) {
      const list = await DB.getBarbers(true);
      const form = (b = {}) => `<form class="card" data-id="${b.id || ''}" style="margin-bottom:12px"><div class="row2"><div class="field"><label>Nombre</label><input name="name" value="${esc(b.name)}" required></div><div class="field"><label>Rol</label><input name="role" value="${esc(b.role)}"></div></div>
        <div class="field"><label>Presentación</label><input name="bio" value="${esc(b.bio)}"></div><div class="field"><label>Etiquetas (separadas por coma)</label><input name="tags" value="${esc((b.tags || []).join(', '))}"></div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn sm" type="submit">${b.id ? 'Guardar' : 'Agregar barbero'}</button>${b.id ? `<label class="check" style="margin:0"><input type="checkbox" name="active" ${b.active ? 'checked' : ''}> Recibe reservas</label>` : ''}</div></form>`;
      el.innerHTML = `<h3 style="margin-bottom:12px">Nuevo barbero</h3>${form()}<h3 style="margin:24px 0 12px">Equipo</h3>${list.map(form).join('')}`;
      el.querySelectorAll('form').forEach((f) => (f.onsubmit = (e) => { e.preventDefault(); U.run(async () => {
        const d = Object.fromEntries(new FormData(f)); const b = { name: d.name.trim(), role: d.role, bio: d.bio, tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean) };
        if (f.dataset.id) { b.id = f.dataset.id; b.active = f.querySelector('[name=active]').checked; }
        await DB.saveBarber(b); U.toast('Guardado'); tabs.refresh(); }); }));
    } },
    avisos: { label: 'Avisos', async render(el) {
      const [clients, sent] = [await DB.listClients(), await DB.listNoticesSent()];
      el.innerHTML = `<form class="card" id="nf" style="max-width:600px;margin-bottom:24px"><div class="field"><label for="to">Enviar a</label><select id="to"><option value="">Todos los clientes</option>${clients.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="t">Título</label><input id="t" maxlength="80" required></div><div class="field"><label for="m">Mensaje</label><textarea id="m" rows="3" maxlength="300" required></textarea></div><button class="btn" type="submit">Enviar aviso</button></form>
        <h3 style="margin-bottom:12px">Enviados</h3>${sent.map((n) => `<div class="item"><div><b>${esc(n.title)}</b><div class="muted">${esc(n.body)}</div></div><small class="muted">${n.toUserId ? esc((clients.find((c) => c.id === n.toUserId) || {}).name || 'Cliente') : 'Todos'}</small></div>`).join('')}`;
      el.querySelector('#nf').onsubmit = (e) => { e.preventDefault(); U.run(async () => { await DB.sendNotice({ toUserId: el.querySelector('#to').value || null, title: el.querySelector('#t').value, body: el.querySelector('#m').value }); U.toast('Aviso enviado'); tabs.refresh(); }); };
    } },
    ajustes: { label: 'Horarios y ajustes', async render(el) {
      const s = await DB.getSettings(); const mins = DB.util.fromMin;
      el.innerHTML = `<form class="card" id="sf" style="max-width:640px"><h3 style="margin-bottom:12px">Horario de atención</h3>${[1, 2, 3, 4, 5, 6, 0].map((d) => { const h = s.hours[d];
        return `<div class="row2" style="margin-bottom:8px;align-items:center"><label class="check" style="margin:0"><input type="checkbox" data-o="${d}" ${h ? 'checked' : ''}> ${U.DOW[d]}</label><div style="display:flex;gap:6px"><input type="time" data-a="${d}" value="${mins(h ? h[0] : 600)}"><input type="time" data-b="${d}" value="${mins(h ? h[1] : 1200)}"></div></div>`; }).join('')}
        <h3 style="margin:22px 0 12px">Reglas</h3><div class="row2"><div class="field"><label>Cada turno dura (paso, min)</label><input id="ch" type="number" min="15" step="15" value="${s.step}"></div><div class="field"><label>Cancelación hasta (h antes)</label><input id="cx" type="number" min="0" value="${s.cancelHours}"></div></div>
        <div class="row2"><div class="field"><label>WhatsApp (solo números, con código de país)</label><input id="wa" value="${esc(s.whatsapp)}"></div><div class="field"><label>Dirección</label><input id="ad" value="${esc(s.address)}"></div></div>
        <button class="btn" type="submit">Guardar cambios</button> <button class="btn ghost" type="button" id="out">Cerrar sesión</button></form>`;
      el.querySelector('#sf').onsubmit = (e) => { e.preventDefault(); U.run(async () => {
        const hours = {}; for (let d = 0; d < 7; d++) { const on = el.querySelector(`[data-o="${d}"]`).checked; const a = DB.util.toMin(el.querySelector(`[data-a="${d}"]`).value), b = DB.util.toMin(el.querySelector(`[data-b="${d}"]`).value);
          if (on && b <= a) throw new Error(`${U.DOW[d]}: la hora de cierre debe ser posterior a la apertura.`); hours[d] = on ? [a, b] : null; }
        await DB.saveSettings({ hours, step: Math.max(15, +el.querySelector('#ch').value), cancelHours: Math.max(0, +el.querySelector('#cx').value), whatsapp: el.querySelector('#wa').value.replace(/\D/g, ''), address: el.querySelector('#ad').value }); U.toast('Ajustes guardados'); }); };
      el.querySelector('#out').onclick = async () => { await DB.signOut(); location.href = 'index.html'; };
    } },
  };
  const tabs = U.tabs(document.getElementById('bar'), panes);
  DB.listBookings().then((l) => U.badge('agenda', l.filter((b) => b.status === 'pending').length));
  window.addEventListener('monaco:change', () => tabs.refresh());
})();
