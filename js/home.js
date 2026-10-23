(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $ } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); await U.nav('home');
  $('#svcGrid').innerHTML = (await DB.getServices()).slice(0, 3).map((s) => U.svcCard(s, st)).join('');
  const today = new Date().getDay();
  $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = st.hours[d];
    return `<div class="${d === today ? 'today' : ''}"><span>${U.DOW[d]}${d === today ? ' · hoy' : ''}</span><span>${h ? DB.util.fromMin(h[0]) + ' – ' + DB.util.fromMin(h[1]) : 'Cerrado'}</span></div>`; }).join('');
})();
