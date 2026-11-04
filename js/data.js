/* Capa de datos de Monaco.
   Hoy: modo DEMO (localStorage). Toda la app usa SOLO window.MonacoDB,
   así que para pasar a Supabase/Firebase se reemplaza este archivo
   manteniendo las mismas funciones async. */
(function () {
  const KEY = 'monaco_demo_v4';
  let mem = null;

  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  function seed() {
    const today = new Date();
    const mk = (id, name, email, phone) => ({
      id, name, email, password: 'demo1234', phone, role: 'client',
      birth: '', pref: 'cualquiera', notes: '', whatsapp: true, notifyApp: true,
      createdAt: new Date().toISOString(),
    });
    const users = [
      { id: 'admin', name: 'Monaco', email: 'admin@monaco.demo', password: 'monaco123', phone: '', role: 'admin', createdAt: new Date().toISOString() },
      mk('u1', 'Matías Rojas', 'matias@demo.com', '+506 8801 0101'),
      mk('u2', 'Lucas Fernández', 'lucas@demo.com', '+506 8802 0102'),
      mk('u3', 'Santiago Pérez', 'santi@demo.com', '+506 8803 0103'),
    ];
    const b = (userId, serviceId, off, time, status, barberId = 'b1') => {
      const u = users.find((x) => x.id === userId);
      return { id: uid(), userId, name: u.name, phone: u.phone, serviceId, barberId, date: ymd(addDays(today, off)), time, status, note: '', createdAt: new Date().toISOString() };
    };
    return {
      settings: {
        name: 'Monaco Studio', tagline: 'Barbería, estilismo y estética en un solo lugar.',
        phone: '+506 8790 3252', whatsapp: '50687903252', email: 'hola@monaco.demo',
        address: 'Núcleo Sabana, San José, Costa Rica', instagram: 'monacostudio',
        currency: '₡', step: 30, cancelHours: 2, advanceDays: 30,
        // minutos desde 00:00; null = cerrado. 0 = domingo
        hours: { 0: null, 1: null, 2: [600, 1200], 3: [600, 1200], 4: [600, 1200], 5: [600, 1260], 6: [600, 1200] },
      },
      soon: [{ name: 'Spa con tratamientos', desc: 'Masajes, tratamientos corporales y relajación. Muy pronto en Monaco Studio.' }],
      services: [
        { id: 's1', cat: 'barberia', name: 'Corte clásico', desc: 'Tijera y máquina, terminación con navaja en el contorno.', price: 6500, duration: 30, active: true },
        { id: 's2', cat: 'barberia', name: 'Corte + barba', desc: 'El combo completo: corte, perfilado y barba con toalla caliente.', price: 10000, duration: 60, active: true },
        { id: 's3', cat: 'barberia', name: 'Barba', desc: 'Perfilado, vapor y afeitado a navaja.', price: 4500, duration: 30, active: true },
        { id: 's4', cat: 'barberia', name: 'Fade / Degradé', desc: 'Degradé a medida, bien prolijo.', price: 7500, duration: 45, active: true },
        { id: 's5', cat: 'barberia', name: 'Corte niño', desc: 'Hasta 12 años.', price: 5000, duration: 30, active: true },
        { id: 's6', cat: 'estilismo', name: 'Decoloración / Platinado', desc: 'Decoloración y tono. Consultar según largo.', price: 30000, duration: 120, active: true },
        { id: 's7', cat: 'estilismo', name: 'Corte y peinado', desc: 'Asesoría de estilo, corte y brushing.', price: 12000, duration: 60, active: true },
        { id: 's8', cat: 'estilismo', name: 'Tinte', desc: 'Color completo o retoque de raíz.', price: 25000, duration: 90, active: true },
        { id: 's9', cat: 'manicura', name: 'Manicura', desc: 'Limpieza, forma y esmalte tradicional.', price: 7000, duration: 45, active: true },
        { id: 's10', cat: 'manicura', name: 'Pedicura', desc: 'Cuidado completo de pies con esmalte.', price: 9000, duration: 60, active: true },
        { id: 's11', cat: 'manicura', name: 'Manicura + pedicura', desc: 'El combo para manos y pies.', price: 15000, duration: 105, active: true },
        { id: 's12', cat: 'lashista', name: 'Pestañas clásicas', desc: 'Extensión pelo a pelo, look natural.', price: 25000, duration: 120, active: true },
        { id: 's13', cat: 'lashista', name: 'Lifting de pestañas', desc: 'Curvatura y tinte, hasta 8 semanas.', price: 18000, duration: 60, active: true },
        { id: 's14', cat: 'estetica', name: 'Limpieza facial', desc: 'Limpieza profunda, exfoliación e hidratación.', price: 20000, duration: 75, active: true },
        { id: 's15', cat: 'estetica', name: 'Diseño de cejas', desc: 'Perfilado y diseño según tu rostro.', price: 6000, duration: 30, active: true },
      ],
      barbers: [
        { id: 'b1', name: 'Nico Monaco', role: 'Fundador · Master barber', cats: ['barberia'], bio: 'Más de 12 años con la navaja. Especialista en cortes clásicos y barba.', tags: ['Clásico', 'Navaja', 'Barba'], active: true },
        { id: 'b2', name: 'Fede Ruiz', role: 'Barbero · Fade specialist', cats: ['barberia'], bio: 'Degradés limpios y cortes modernos. Si traés una foto, sale igual.', tags: ['Fade', 'Moderno', 'Niños'], active: true },
        { id: 'b3', name: 'Sofía Mora', role: 'Estilista', cats: ['estilismo'], bio: 'Color, corte y peinado. Le encantan los cambios de look.', tags: ['Color', 'Platinado', 'Peinados'], active: true },
        { id: 'b4', name: 'Karla Jiménez', role: 'Manicurista y pedicurista', cats: ['manicura'], bio: 'Manos y pies cuidados, con diseños a tu gusto.', tags: ['Gel', 'Esmaltado', 'Diseños'], active: true },
        { id: 'b5', name: 'Dani Vargas', role: 'Lashista', cats: ['lashista'], bio: 'Mirada natural o con volumen, siempre cuidando tus pestañas.', tags: ['Clásicas', 'Volumen', 'Lifting'], active: true },
        { id: 'b6', name: 'Valeria Solano', role: 'Esteticista', cats: ['estetica'], bio: 'Cuidado facial, cejas y tratamientos para tu piel.', tags: ['Facial', 'Cejas', 'Piel'], active: true },
      ],
      users,
      bookings: [
        b('u1', 's2', 0, '11:00', 'confirmed'), b('u2', 's1', 0, '15:30', 'pending', 'b2'),
        b('u3', 's4', 1, '12:00', 'pending', 'b2'), b('u1', 's3', -7, '17:00', 'completed'),
        b('u2', 's1', -14, '13:00', 'noshow'),
      ],
      notifications: [
        { id: uid(), toUserId: null, title: '¡Bienvenido a Monaco!', body: 'Reservá tu turno desde la app, sin llamadas ni esperas.', createdAt: new Date().toISOString() },
      ],
      reads: {},
      session: null,
    };
  }

  function load() {
    if (mem) return mem;
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.settings) { mem = s; return s; } } catch (e) {}
    mem = seed(); save(); return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  // otras pestañas (admin y cliente abiertos a la vez)
  window.addEventListener('storage', (e) => { if (e.key === KEY) { mem = null; window.dispatchEvent(new Event('monaco:change')); } });

  const clean = (u) => { if (!u) return null; const { password, ...rest } = u; return rest; };
  const fail = (m) => { throw new Error(m); };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const bookingStart = (b) => { const [y, mo, d] = b.date.split('-').map(Number); const [h, mi] = b.time.split(':').map(Number); return new Date(y, mo - 1, d, h, mi); };

  const CATS = [
    { id: 'barberia', name: 'Barbería', icon: 'scissors', desc: 'Cortes clásicos, fade y barba a navaja.' },
    { id: 'estilismo', name: 'Estilismo', icon: 'comb', desc: 'Corte, color y peinado para todo tipo de cabello.' },
    { id: 'manicura', name: 'Manicura y pedicura', icon: 'polish', desc: 'Manos y pies impecables, con esmalte o gel.' },
    { id: 'lashista', name: 'Lashista', icon: 'eye', desc: 'Pestañas con efecto natural o de volumen.' },
    { id: 'estetica', name: 'Estética', icon: 'sparkle', desc: 'Tratamientos faciales, cejas y depilación.' },
  ];
  const capable = (b, svc) => !b.cats || b.cats.includes(svc.cat);

  const DB = {
    mode: 'demo',
    getCategories() { return CATS; },
    async getSoon() { return load().soon || []; },
    util: { ymd, toMin, fromMin, addDays, bookingStart },

    async getSettings() { return load().settings; },
    async saveSettings(patch) { Object.assign(load().settings, patch); save(); return load().settings; },

    async getServices(all) { return load().services.filter((s) => all || s.active); },
    async saveService(s) {
      const db = load();
      if (!s.name || !(s.price >= 0) || !(s.duration > 0)) fail('Completá nombre, precio y duración.');
      if (s.id) { const i = db.services.findIndex((x) => x.id === s.id); db.services[i] = { ...db.services[i], ...s }; }
      else db.services.push({ ...s, id: 's' + uid(), active: true });
      save();
    },
    async deleteService(id) {
      const db = load();
      if (db.bookings.some((b) => b.serviceId === id)) { db.services.find((s) => s.id === id).active = false; }
      else db.services = db.services.filter((s) => s.id !== id);
      save();
    },

    /* ---- auth ---- */
    async currentUser() { const db = load(); return clean(db.users.find((u) => u.id === db.session)); },
    async signUp({ name, email, password, phone }) {
      const db = load(); email = (email || '').trim().toLowerCase();
      if (!name || !email || !password) fail('Completá nombre, email y contraseña.');
      if (password.length < 6) fail('La contraseña debe tener al menos 6 caracteres.');
      if (db.users.some((u) => u.email === email)) fail('Ya existe una cuenta con ese email.');
      const u = { id: 'u' + uid(), name: name.trim(), email, password, phone: phone || '', role: 'client', birth: '', pref: 'cualquiera', notes: '', whatsapp: true, notifyApp: true, createdAt: new Date().toISOString() };
      db.users.push(u); db.session = u.id; save(); return clean(u);
    },
    async signIn(email, password) {
      const db = load(); email = (email || '').trim().toLowerCase();
      const u = db.users.find((x) => x.email === email && x.password === password);
      if (!u) fail('Email o contraseña incorrectos.');
      db.session = u.id; save(); return clean(u);
    },
    async signOut() { load().session = null; save(); },
    async updateProfile(patch) {
      const db = load(); const u = db.users.find((x) => x.id === db.session); if (!u) fail('Iniciá sesión.');
      const allowed = ['name', 'phone', 'birth', 'pref', 'notes', 'whatsapp', 'notifyApp'];
      allowed.forEach((k) => { if (k in patch) u[k] = patch[k]; });
      if (!u.name) fail('El nombre no puede estar vacío.');
      save(); return clean(u);
    },

    /* ---- disponibilidad y reservas ---- */
    async getBarbers(all, cat) { return load().barbers.filter((b) => (all || b.active) && (!cat || !b.cats || b.cats.includes(cat))); },
    async saveBarber(b) {
      const db = load(); if (!b.name) fail('El barbero necesita un nombre.');
      if (b.id) { const i = db.barbers.findIndex((x) => x.id === b.id); db.barbers[i] = { ...db.barbers[i], ...b }; }
      else db.barbers.push({ tags: [], bio: '', ...b, id: 'b' + uid(), active: true });
      save();
    },
    // barberId: id concreto o 'any' (cualquiera disponible). Cada barbero atiende de a un cliente.
    async getSlots(dateStr, serviceId, barberId = 'any') {
      const db = load(), s = db.settings;
      const svc = db.services.find((x) => x.id === serviceId); if (!svc) return [];
      const [y, m, d] = dateStr.split('-').map(Number);
      const day = new Date(y, m - 1, d); const h = s.hours[day.getDay()]; if (!h) return [];
      const barbers = db.barbers.filter((b) => b.active && capable(b, svc) && (barberId === 'any' || b.id === barberId));
      const busy = (bid) => db.bookings.filter((b) => b.date === dateStr && b.barberId === bid && (b.status === 'pending' || b.status === 'confirmed'))
        .map((b) => { const sv = db.services.find((x) => x.id === b.serviceId); const st = toMin(b.time); return [st, st + (sv ? sv.duration : 30)]; });
      const taken = Object.fromEntries(barbers.map((b) => [b.id, busy(b.id)]));
      const now = new Date(); const out = [];
      for (let t = h[0]; t + svc.duration <= h[1]; t += s.step) {
        if (new Date(y, m - 1, d, 0, t) <= now) continue;
        const freeBarber = barbers.find((b) => !taken[b.id].some(([a, e]) => t < e && t + svc.duration > a));
        out.push({ time: fromMin(t), free: !!freeBarber, barberId: freeBarber ? freeBarber.id : null });
      }
      return out;
    },
    async createBooking({ serviceId, barberId = 'any', date, time, note }) {
      const db = load(); const u = db.users.find((x) => x.id === db.session); if (!u) fail('Iniciá sesión para reservar.');
      const slots = await DB.getSlots(date, serviceId, barberId);
      const sl = slots.find((x) => x.time === time); if (!sl || !sl.free) fail('Ese horario ya no está disponible. Elegí otro.');
      const bk = { id: uid(), userId: u.id, name: u.name, phone: u.phone, serviceId, barberId: sl.barberId, date, time, status: 'pending', note: note || '', createdAt: new Date().toISOString() };
      db.bookings.push(bk); save(); return bk;
    },
    async listBookings(filter = {}) {
      const db = load();
      let list = db.bookings.slice();
      if (filter.userId) list = list.filter((b) => b.userId === filter.userId);
      if (filter.date) list = list.filter((b) => b.date === filter.date);
      return list.map((b) => ({ ...b, service: db.services.find((s) => s.id === b.serviceId), barber: db.barbers.find((x) => x.id === b.barberId) }))
        .sort((a, b) => bookingStart(a) - bookingStart(b));
    },
    async cancelOwnBooking(id) {
      const db = load(); const b = db.bookings.find((x) => x.id === id && x.userId === db.session); if (!b) fail('Reserva no encontrada.');
      const hrs = (bookingStart(b) - new Date()) / 36e5;
      if (hrs < db.settings.cancelHours) fail(`Solo se puede cancelar hasta ${db.settings.cancelHours} h antes. Escribinos por WhatsApp.`);
      b.status = 'cancelled'; save();
    },
    // admin: confirma / cancela / completa / ausente -> notifica a la clienta
    async setBookingStatus(id, status) {
      const db = load(); const b = db.bookings.find((x) => x.id === id); if (!b) fail('Reserva no encontrada.');
      b.status = status;
      const svc = db.services.find((s) => s.id === b.serviceId);
      const when = `${b.date.split('-').reverse().join('/')} a las ${b.time}`;
      const msgs = {
        confirmed: ['Turno confirmado ✅', `Te esperamos el ${when} para ${svc ? svc.name : 'tu turno'}.`],
        cancelled: ['Turno cancelado', `Tu turno del ${when} fue cancelado. Podés reservar otro cuando quieras.`],
      };
      if (msgs[status] && b.userId) db.notifications.push({ id: uid(), toUserId: b.userId, title: msgs[status][0], body: msgs[status][1], createdAt: new Date().toISOString() });
      save();
    },

    /* ---- clientes ---- */
    async listClients() {
      const db = load();
      return db.users.filter((u) => u.role === 'client').map((u) => {
        const bs = db.bookings.filter((b) => b.userId === u.id);
        const last = bs.filter((b) => b.status === 'completed').map((b) => b.date).sort().pop() || null;
        return { ...clean(u), total: bs.length, completed: bs.filter((b) => b.status === 'completed').length, noshow: bs.filter((b) => b.status === 'noshow').length, last };
      });
    },

    /* ---- avisos ---- */
    async sendNotice({ toUserId, title, body }) {
      if (!title || !body) fail('Completá título y mensaje.');
      load().notifications.push({ id: uid(), toUserId: toUserId || null, title, body, createdAt: new Date().toISOString() }); save();
    },
    async listNoticesSent() { return load().notifications.slice().reverse(); },
    async listMyNotices() {
      const db = load(); const r = db.reads[db.session] || {};
      return db.notifications.filter((n) => (!n.toUserId || n.toUserId === db.session) && r[n.id] !== 'dismissed')
        .map((n) => ({ ...n, read: r[n.id] === 'read' })).reverse();
    },
    async markNotice(id, state) { const db = load(); (db.reads[db.session] = db.reads[db.session] || {})[id] = state; save(); },

    async resetDemo() { mem = seed(); save(); },
  };
  window.MonacoDB = DB;
})();
