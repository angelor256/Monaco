(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); await U.nav('home');
  const [cats, services] = [DB.getCategories(), await DB.getServices()];
  const card = (c) => { const n = services.filter((s) => s.cat === c.id); const min = n.length ? Math.min(...n.map((s) => s.price)) : 0;
    return `<a class="card cat" href="servicios.html?cat=${c.id}"><div class="ic">${U.icon(c.icon)}</div><h3>${esc(c.name)}</h3><p class="muted">${esc(c.desc)}</p>
      <span class="meta">${n.length} servicios · desde <b class="price" style="font-size:1.05rem">${U.money(min, st.currency)}</b></span></a>`; };
  const soon = (await DB.getSoon()).map((s) => `<div class="card cat soon"><span class="chip gold">Muy pronto</span><div class="ic">${U.icon('lotus')}</div><h3>${esc(s.name)}</h3><p class="muted">${esc(s.desc)}</p></div>`).join('');
  $('#catGrid').innerHTML = cats.map(card).join('') + soon;
  const today = new Date().getDay();
  $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = st.hours[d];
    return `<div class="${d === today ? 'today' : ''}"><span>${U.DOW[d]}${d === today ? ' · hoy' : ''}</span><span>${h ? DB.util.fromMin(h[0]) + ' – ' + DB.util.fromMin(h[1]) : 'Cerrado'}</span></div>`; }).join('');
})();
