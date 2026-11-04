(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); await U.nav('servicios');
  const [cats, services] = [DB.getCategories(), await DB.getServices()];
  let cur = new URLSearchParams(location.search).get('cat'); if (!cats.some((c) => c.id === cur)) cur = 'all';
  const soonList = await DB.getSoon();
  const draw = () => {
    $('#filters').innerHTML = [{ id: 'all', name: 'Todos' }, ...cats].map((c) => `<button class="fchip ${c.id === cur ? 'on' : ''}" data-c="${c.id}" aria-pressed="${c.id === cur}">${esc(c.name)}</button>`).join('');
    $('#filters').querySelectorAll('button').forEach((b) => (b.onclick = () => { cur = b.dataset.c; history.replaceState(null, '', cur === 'all' ? 'servicios.html' : `servicios.html?cat=${cur}`); draw(); }));
    const show = cats.filter((c) => cur === 'all' || c.id === cur);
    $('#svcGrid').innerHTML = show.map((c) => `<div class="cat-block"><div class="cat-head"><span class="ic">${U.icon(c.icon)}</span><div><h2>${esc(c.name)}</h2><p class="muted">${esc(c.desc)}</p></div></div>
      <div class="grid">${services.filter((s) => s.cat === c.id).map((s) => U.svcCard(s, st)).join('')}</div></div>`).join('')
      + (cur === 'all' ? soonList.map((s) => `<div class="cat-block"><div class="cat-head"><span class="ic">${U.icon('lotus')}</span><div><h2>${esc(s.name)} <span class="chip gold">Muy pronto</span></h2><p class="muted">${esc(s.desc)}</p></div></div></div>`).join('') : '');
  };
  draw();
  $('#waBtn').href = U.waLink(st, 'Hola! Quiero que me asesoren sobre qué servicio elegir.');
})();
