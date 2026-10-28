(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { esc } = U;
  U.demoBar(); U.registerSW();
  let user = await DB.currentUser();
  if (!user) { user = await U.openAuth(); if (!user) return (location.href = 'index.html'); }
  if (user.role === 'admin') return (location.href = 'admin.html');
  const st = await DB.getSettings();
  await U.nav('cuenta');
  document.getElementById('hi').textContent = `Hola, ${user.name.split(' ')[0]}`;

  const bookingItem = (b, canCancel) => `<div class="item"><div><div class="when">${U.fmtDate(b.date)} · ${b.time}</div>
    <div class="muted">${esc(b.service ? b.service.name : 'Servicio')}${b.barber ? ' · con ' + esc(b.barber.name.split(' ')[0]) : ''} · ${U.money(b.service ? b.service.price : 0, st.currency)}</div></div>
    <div class="actions">${U.pill(b.status)}${canCancel ? `<button class="btn danger sm" data-c="${b.id}">Cancelar</button>` : ''}</div></div>`;

  const panes = {
    reservas: { label: 'Reservas', async render(el) {
      const all = await DB.listBookings({ userId: user.id }); const now = new Date();
      const up = all.filter((b) => DB.util.bookingStart(b) >= now && (b.status === 'pending' || b.status === 'confirmed'));
      const past = all.filter((b) => !up.includes(b)).reverse();
      el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3>Próximos</h3><a class="btn sm" href="citas.html">Nueva reserva</a></div>
        ${up.length ? up.map((b) => bookingItem(b, true)).join('') : '<div class="empty">No tenés turnos próximos.</div>'}
        <h3 style="margin:28px 0 12px">Historial</h3>${past.length ? past.map((b) => bookingItem(b, false)).join('') : '<div class="empty">Todavía no hay historial.</div>'}`;
      el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => U.run(async () => {
        if (!confirm('¿Cancelar este turno?')) return; await DB.cancelOwnBooking(b.dataset.c); U.toast('Turno cancelado'); tabs.refresh();
      })));
    } },
    perfil: { label: 'Perfil', async render(el) {
      const u = await DB.currentUser();
      el.innerHTML = `<form class="card" id="pf" style="max-width:560px"><div class="field"><label for="n">Nombre</label><input id="n" value="${esc(u.name)}" required></div>
        <div class="row2"><div class="field"><label for="p">Teléfono</label><input id="p" type="tel" value="${esc(u.phone)}"></div><div class="field"><label for="b">Nacimiento</label><input id="b" type="date" value="${esc(u.birth)}"></div></div>
        <div class="field"><label for="pr">Horario preferido</label><select id="pr">${['cualquiera', 'mañana', 'tarde'].map((o) => `<option ${u.pref === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="field"><label for="nt">Notas (tipo de corte, alergias, etc.)</label><textarea id="nt" rows="3">${esc(u.notes)}</textarea></div>
        <label class="check field"><input type="checkbox" id="wa" ${u.whatsapp ? 'checked' : ''}> Recibir recordatorios por WhatsApp</label>
        <label class="check field"><input type="checkbox" id="na" ${u.notifyApp ? 'checked' : ''}> Recibir avisos en la app</label>
        <div style="display:flex;gap:10px"><button class="btn" type="submit">Guardar</button><button class="btn ghost" type="button" id="out">Cerrar sesión</button></div></form>`;
      el.querySelector('#pf').onsubmit = (e) => { e.preventDefault(); U.run(async () => {
        const v = (id) => el.querySelector(id);
        user = await DB.updateProfile({ name: v('#n').value.trim(), phone: v('#p').value, birth: v('#b').value, pref: v('#pr').value, notes: v('#nt').value, whatsapp: v('#wa').checked, notifyApp: v('#na').checked });
        document.getElementById('hi').textContent = `Hola, ${user.name.split(' ')[0]}`; U.toast('Perfil guardado'); }); };
      el.querySelector('#out').onclick = async () => { await DB.signOut(); location.href = 'index.html'; };
    } },
    avisos: { label: 'Avisos', async render(el) {
      const list = await DB.listMyNotices(); U.badge('avisos', list.filter((n) => !n.read).length);
      el.innerHTML = list.length ? list.map((n) => `<div class="item notice ${n.read ? '' : 'unread'}"><div><b>${esc(n.title)}</b><div class="muted">${esc(n.body)}</div>
        <small class="muted">${new Date(n.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</small></div>
        <div class="actions">${n.read ? '' : `<button class="btn ghost sm" data-r="${n.id}">Marcar leído</button>`}<button class="btn ghost sm" data-d="${n.id}">Descartar</button></div></div>`).join('') : '<div class="empty">No tenés avisos.</div>';
      el.querySelectorAll('[data-r]').forEach((b) => (b.onclick = async () => { await DB.markNotice(b.dataset.r, 'read'); tabs.refresh(); }));
      el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = async () => { await DB.markNotice(b.dataset.d, 'dismissed'); tabs.refresh(); }));
    } },
    ayuda: { label: 'Ayuda', async render(el) {
      el.innerHTML = `<div class="card" style="max-width:560px"><h3 style="margin-bottom:10px">Contacto</h3>
        <p><a class="btn" href="${U.waLink(st)}" target="_blank" rel="noopener">Escribinos por WhatsApp</a></p>
        <p class="muted" style="margin-top:12px">${esc(st.email)} · ${esc(st.address)}</p>
        <h3 style="margin:22px 0 8px">Política de cancelación</h3><p class="muted">Podés cancelar sin cargo hasta ${st.cancelHours} horas antes del turno desde la app. Después, escribinos por WhatsApp.</p>
        <h3 style="margin:22px 0 8px">Pagos</h3><p class="muted">El pago se coordina directamente en el local (efectivo, SINPE Móvil o tarjeta).</p></div>`;
    } },
  };
  const tabs = U.tabs(document.getElementById('bar'), panes);
  DB.listMyNotices().then((l) => U.badge('avisos', l.filter((n) => !n.read).length));
  window.addEventListener('monaco:change', () => tabs.refresh());
})();
