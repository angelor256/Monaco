(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $ } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); await U.nav('servicios');
  $('#svcGrid').innerHTML = (await DB.getServices()).map((s) => U.svcCard(s, st)).join('');
  $('#waBtn').href = U.waLink(st, 'Hola! Quiero que me asesoren sobre qué servicio elegir.');
})();
