(async function () {
  const DB = window.MonacoDB, U = window.MonacoUI, { $, esc } = U;
  U.demoBar(); U.registerSW();
  const st = await DB.getSettings(); await U.nav('contacto');
  const row = (ic, t, v, href) => { const inner = `<span class="ic" aria-hidden="true">${U.icon(ic)}</span><span><b>${t}</b><br><span class="muted">${v}</span></span>`; return href ? `<a href="${href}" target="_blank" rel="noopener">${inner}</a>` : `<div>${inner}</div>`; };
  $('#info').innerHTML = row('pin', 'Dirección', esc(st.address), `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(st.address)}`)
    + row('phone', 'Teléfono', esc(st.phone), `tel:${st.phone.replace(/[^\d+]/g, '')}`).replace(' target="_blank" rel="noopener"', '')
    + row('chat', 'WhatsApp', 'Escribinos, respondemos rápido', U.waLink(st))
    + row('camera', 'Instagram', '@' + esc(st.instagram), `https://instagram.com/${esc(st.instagram)}`)
    + row('clock', 'Horarios', U.hoursLines(st).join('<br>'));
  // Mapa: configurable (st.mapEmbed); por defecto un punto de ejemplo en OpenStreetMap
  $('#map').src = st.mapEmbed || 'https://www.openstreetmap.org/export/embed.html?bbox=-84.1%2C9.91%2C-84.04%2C9.95&layer=mapnik';
  const faqs = [
    ['¿Qué servicios ofrecen?', 'Barbería, estilismo, manicura y pedicura, lashista y estética. Muy pronto, spa con tratamientos.'],
    ['¿Cómo reservo un turno?', 'Desde “Reservar”: elegís servicio, profesional, día y hora, y confirmás. Necesitás una cuenta gratuita para gestionar tus turnos.'],
    ['¿Puedo cancelar o cambiar mi turno?', `Sí, desde “Mi cuenta” hasta ${st.cancelHours} horas antes sin cargo. Pasado ese plazo, escribinos por WhatsApp.`],
    ['¿Cómo se paga?', 'El pago se hace en el local: efectivo, SINPE Móvil o tarjeta.'],
    ['¿Atienden sin turno?', 'Si hay lugar, sí, pero con turno online tenés tu horario asegurado.'],
    ['¿Atienden a niños?', 'Sí, tenemos corte para niños hasta 12 años.'],
    ['¿Qué pasa si llego tarde?', 'Avisanos por WhatsApp. Con más de 15 minutos de demora podemos tener que reprogramar.'],
  ];
  $('#faq').innerHTML = faqs.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
})();
