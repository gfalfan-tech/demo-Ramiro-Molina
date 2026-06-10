// ═══════════════════════════════════════════════
// RPM CONTROL — Auth compartido
// ═══════════════════════════════════════════════

let _db = null;

function initSupabase() {
  if (_db) return _db;
  _db = window.supabase.createClient(RPM_CONFIG.supabase_url, RPM_CONFIG.supabase_key);
  return _db;
}

function getDB() {
  return initSupabase();
}

function getUsuarioActual() {
  const raw = localStorage.getItem('rpm_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setUsuarioActual(data) {
  localStorage.setItem('rpm_user', JSON.stringify(data));
}

async function cerrarSesion() {
  try {
    localStorage.removeItem('rpm_user');
    sessionStorage.clear();
    const db = getDB();
    await db.auth.signOut();
  } catch(e) {
    console.warn('signOut error:', e);
  } finally {
    window.location.replace('index.html');
  }
}

// Proteger página — redirige a login si no hay sesión
function requireAuth(rolesPermitidos = null) {
  const user = getUsuarioActual();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}

// Inicializar sesión desde Supabase al cargar
async function inicializarSesion() {
  const db = getDB();
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    localStorage.removeItem('rpm_user');
    return null;
  }
  // Obtener perfil
  const { data: perfil } = await db.from('perfiles').select('*').eq('id', session.user.id).single();
  if (perfil) {
    setUsuarioActual(perfil);
    return perfil;
  }
  return null;
}

// Renderizar header de usuario en sidebar
function renderUserSidebar(containerId = 'sb-user-info') {
  const user = getUsuarioActual();
  if (!user) return;
  const el = document.getElementById(containerId);
  if (!el) return;
  const initiales = user.nombre.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  const roles = { admin: 'Administrador', supervisor: 'Supervisor', tecnico: 'Técnico' };
  el.innerHTML = `
    <div class="u-av">${initiales}</div>
    <div class="u-info">
      <div class="u-name">${user.nombre}</div>
      <div class="u-role">${roles[user.rol] || user.rol} · RPM Control</div>
    </div>
  `;
}

// Marcar nav item activo
function setNavActivo(pagina) {
  document.querySelectorAll('.ni').forEach(el => {
    el.classList.remove('act');
    if (el.dataset.page === pagina) el.classList.add('act');
  });
}

// Toast global
function showToast(msg, tipo = 'ok') {
  const colores = { ok: '#10B981', error: '#E84040', warn: '#F59E0B', info: '#3B82F6' };
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colores[tipo]}; color:#fff;
    padding:12px 20px; border-radius:8px;
    font-size:13px; font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,.3);
    animation: fadeUp .3s ease;
    font-family:'DM Sans',sans-serif;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// Formatear fecha
function fmtFecha(fecha, conHora = false) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const opts = conHora
    ? { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }
    : { day:'2-digit', month:'2-digit', year:'numeric' };
  return d.toLocaleDateString('es-CL', opts);
}

// Formatear moneda
function fmtMoney(n) {
  if (!n && n !== 0) return '—';
  return '$' + Number(n).toLocaleString('es-CL');
}

// Badge HTML
function badge(texto, tipo) {
  const clases = { ok:'b-ok', warn:'b-warn', crit:'b-crit', info:'b-info', prog:'b-prog' };
  return `<span class="badge ${clases[tipo] || 'b-info'}">${texto}</span>`;
}

function badgeEstado(estado) {
  const map = {
    'Activo':'ok','Vigente':'ok','Operacional':'ok','Completada':'ok','Disponible':'ok',
    'En Progreso':'prog','En Revisión':'prog','Programada':'prog',
    'Alta':'warn','En mantenimiento':'warn','Ocupado':'warn',
    'Crítica':'crit','Vencida':'crit','Fuera de Servicio':'crit','Cancelada':'crit',
    'Abierta':'info','Inactivo':'info'
  };
  return badge(estado, map[estado] || 'info');
}
