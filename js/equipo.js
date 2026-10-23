(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  await DB.getSettings(); await U.nav('equipo');
  $('#team').innerHTML = (await DB.getBarbers()).map((b) => `<article class="card barber"><div class="avatar" aria-hidden="true">${esc(U.initials(b.name))}</div>
    <h3>${esc(b.name)}</h3><p class="eyebrow" style="margin:6px 0 10px">${esc(b.role)}</p><p class="muted">${esc(b.bio)}</p>
    <div class="tags">${(b.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <a class="btn ghost sm" href="citas.html?barbero=${encodeURIComponent(b.id)}">Reservar con ${esc(b.name.split(' ')[0])}</a></article>`).join('');
})();
