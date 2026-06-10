// ═══════════════════════════════════════════════
// RPM CONTROL — Configuración global
// ═══════════════════════════════════════════════

const RPM_CONFIG = {
  supabase_url: 'https://qrydfsxbhlavowdavgva.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeWRmc3hiaGxhdm93ZGF2Z3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDU3NDAsImV4cCI6MjA5NjYyMTc0MH0.EwmicDrwK_5-nW2N3OGRgAxME52WENLZ9AEovFax35U',
  version: '1.0.0',
  nombre_sistema: 'RPM Control CMMS'
};

// Permisos por rol
const PERMISOS = {
  admin: {
    clientes: ['ver','crear','editar','eliminar'],
    ots:      ['ver','crear','editar','eliminar','cerrar'],
    tecnicos: ['ver','crear','editar','eliminar'],
    inventario:['ver','crear','editar','eliminar'],
    activos:  ['ver','crear','editar','eliminar'],
    alertas:  ['ver','crear','editar','eliminar'],
    usuarios: ['ver','crear','editar','eliminar']
  },
  supervisor: {
    clientes: ['ver','crear','editar'],
    ots:      ['ver','crear','editar','cerrar'],
    tecnicos: ['ver'],
    inventario:['ver','editar'],
    activos:  ['ver','crear','editar'],
    alertas:  ['ver','crear'],
    usuarios: ['ver']
  },
  tecnico: {
    clientes: ['ver'],
    ots:      ['ver_propias','editar_propias'],
    tecnicos: [],
    inventario:['ver'],
    activos:  ['ver'],
    alertas:  ['ver'],
    usuarios: []
  }
};

function puedeHacer(modulo, accion) {
  const user = getUsuarioActual();
  if (!user) return false;
  const perms = PERMISOS[user.rol]?.[modulo] || [];
  return perms.includes(accion) || perms.includes(accion + '_propias');
}
