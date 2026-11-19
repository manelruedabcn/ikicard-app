const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Carga TypeScript con dependencias sustituidas: ninguna prueba accede a
// Supabase, Resend ni a destinatarios reales.
function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, '..', file)
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const mod = { exports: {} }
  const req = id => {
    if (Object.hasOwn(mocks, id)) return mocks[id]
    if (id.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), id + '.ts')), mocks)
    throw new Error('Dependencia de prueba no preparada: ' + id)
  }
  new Function('require', 'module', 'exports', source)(req, mod, mod.exports)
  return mod.exports
}

const contentLocale = load('lib/content-locale.ts')
const textos = load('lib/inventario-seguimiento-content.ts', { '@/lib/content-locale': contentLocale })
const seg = load('lib/inventario-seguimiento.ts', {
  'server-only': {},
  '@/lib/supabase/admin': { createAdminClient: () => { throw new Error('sin base de datos en pruebas') } },
  '@/lib/email': { sendSeguimientoEmail: async () => { throw new Error('sin correo en pruebas') } },
  '@/lib/notify': { unsubUrl: () => 'https://example.invalid/baja' },
  '@/lib/inventario-seguimiento-content': textos,
})

test('seguimiento: tests de hace entre 3 y 7 días, nunca antes de la puesta en marcha', () => {
  const v = seg.ventanaSeguimiento(new Date('2026-11-30T10:00:00Z'))
  assert.equal(v.hasta, '2026-11-27T10:00:00.000Z')
  assert.equal(v.desde, '2026-11-23T10:00:00.000Z')
  // Recién puesto en marcha: no escribe a tests anteriores al 19-11-2026.
  const pronto = seg.ventanaSeguimiento(new Date('2026-11-21T10:00:00Z'))
  assert.ok(pronto.desde >= pronto.hasta)
})

test('seguimiento: tres respuestas con texto en castellano, catalán e inglés', () => {
  for (const l of ['es', 'ca', 'en']) {
    const t = textos.getSeguimientoTexts(l)
    for (const r of textos.SEGUIMIENTO_RESPUESTAS) {
      assert.ok(t.labels[r] && t.page[r], `${l} ${r}`)
    }
    assert.ok(!/—/.test(JSON.stringify(t)), `sin guiones largos en ${l}`)
  }
  assert.match(seg.seguimientoUrl('00000000-0000-4000-8000-000000000000', 'medias', 'ca'), /r=medias&l=ca$/)
})
