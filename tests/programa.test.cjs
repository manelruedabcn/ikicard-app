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
const calendar = load('lib/programa.ts')
const content = load('lib/programa-content.ts')

test('calendario: nueve mensajes más bienvenida, sin adelantar semanas', () => {
  assert.deepEqual(calendar.PROGRAMA_CALENDARIO.map(c => c.day), [0, 3, 7, 10, 14, 17, 21, 24, 28])
  assert.deepEqual(calendar.semanalesPendientes('2026-11-17', '2026-11-16', new Set()), [])
  assert.deepEqual(calendar.semanalesPendientes('2026-11-17', '2026-11-17', new Set()), ['semana1'])
  assert.deepEqual(calendar.semanalesPendientes('2026-11-17', '2026-11-24', new Set(['semana1', 'jueves1'])), ['semana2'])
})
test('espera al test sin alterar una inscripción antigua ya empezada', () => {
  assert.equal(calendar.esperaTest(null, new Set()), true)
  assert.equal(calendar.esperaTest({ a: 1 }, new Set()), false)
  assert.equal(calendar.esperaTest(null, new Set(['semana1'])), false)
})
test('recordatorio: 48 horas reales, solo una vez, nunca antes', () => {
  const confirmed = '2026-10-24T12:00:00Z' // incluye el cambio de hora de Madrid
  const now = Date.parse(confirmed)
  assert.equal(calendar.recordatorioTestPendiente(confirmed, new Set(), now + 48 * 3600000 - 1), false)
  assert.equal(calendar.recordatorioTestPendiente(confirmed, new Set(), now + 48 * 3600000), true)
  assert.equal(calendar.recordatorioTestPendiente(confirmed, new Set(['recordatorio_test']), now + 72 * 3600000), false)
  assert.equal(calendar.recordatorioTestPendiente('fecha inválida', new Set(), now), false)
})
test('recuperación: conserva semanales y cierre; descarta recordatorios de periodos pasados', () => {
  assert.deepEqual(calendar.semanalesPendientes('2026-10-01', '2026-10-29', new Set()), ['semana1', 'semana2', 'semana3', 'semana4', 'cierre'])
  assert.deepEqual(calendar.semanalesPendientes('2026-10-01', '2026-10-29', new Set(['semana1', 'semana2', 'semana3', 'semana4', 'cierre'])), [])
})
test('fechas de Madrid durante cambio de hora, sin sumar bloques de 24h al calendario', () => {
  assert.equal(calendar.madridParts(new Date('2026-10-24T22:30:00Z')).date, '2026-10-25')
  assert.equal(calendar.addDays('2026-10-24', 7), '2026-10-31')
  assert.equal(calendar.madridParts(new Date('2026-10-26T07:00:00Z')).hour, 8)
})
test('bienvenida ES/CA/EN distingue espera y comienzo, y mantiene diez correos', () => {
  for (const locale of ['es', 'ca', 'en']) {
    const t = content.getProgramaTexts(locale)
    const c = { tieneTest: false, links: { repetir: 'https://example.test/test' }, encuentros: [] }
    const waiting = t.bienvenida(c, '17/11/2026')
    const started = t.bienvenida({ ...c, tieneTest: true }, '17/11/2026')
    assert.notEqual(waiting.subject, started.subject)
    assert.notEqual(waiting.blocks[0].text, started.blocks[0].text)
    assert.match(waiting.blocks[1].text, /Diez|Deu|Ten/)
    assert.ok(t.recordatorioTest.text.length > 30)
    assert.ok(waiting.blocks.some(b => b.kind === 'cta' && b.href === c.links.repetir))
  }
})

function database(tables, failures = {}) {
  return { from(table) {
    let action = 'read', values, ignore = false, single = false, filters = [], returning = false
    const q = {
      select() { returning = true; return q },
      eq(k,v) { filters.push(row => row[k] === v); return q },
      in(k,vs) { filters.push(row => vs.includes(row[k])); return q },
      is(k,v) { filters.push(row => row[k] === v); return q },
      lt(k,v) { filters.push(row => row[k] < v); return q },
      gte(k,v) { filters.push(row => row[k] >= v); return q },
      lte(k,v) { filters.push(row => row[k] <= v); return q },
      maybeSingle() { single = true; return q },
      update(v) { action = 'update'; values = v; return q },
      delete() { action = 'delete'; return q },
      insert(v) { action = 'insert'; values = v; return q },
      single() { single = true; return q },
      upsert(v,opts) { action = 'upsert'; values = v; ignore = opts?.ignoreDuplicates; return q },
      then(resolve, reject) {
        if (failures[table + ':' + action]) return Promise.resolve({ data: null, error: { message: 'fallo de prueba' } }).then(resolve, reject)
        const rows = tables[table] ||= []
        let matched = rows.filter(row => filters.every(f => f(row)))
        if (action === 'insert') { const row = { id: 'attempt1', ...values }; rows.push(row); matched = [row] }
        if (action === 'upsert') {
          const existing = rows.find(row => row.inscripcion_id === values.inscripcion_id && row.mensaje === values.mensaje)
          if (!existing) { rows.push({ ...values }); matched = [{ ...values }] }
          else { if (!ignore) Object.assign(existing, values); matched = ignore ? [] : [existing] }
        }
        if (action === 'delete') tables[table] = rows.filter(row => !matched.includes(row))
        if (action === 'update') matched.forEach(row => Object.assign(row, values))
        return Promise.resolve({ data: action === 'read' || returning ? (single ? matched[0] || null : matched) : null, error: null }).then(resolve, reject)
      },
    }
    return q
  } }
}
const active = (overrides = {}) => ({ id: 'person1', email: 'test@example.invalid', status: 'activa', locale: 'es', start_date: '2026-11-17', first_answers: null, confirmed_at: '2026-11-10T08:00:00Z', ...overrides })
function cron(tables, opts = {}) {
  const calls = []
  const handler = load('app/api/cron/programa/route.ts', {
    'next/server': { NextResponse: { json: (body, o) => ({ body, status: o?.status || 200 }) } },
    '@/lib/supabase/admin': { createAdminClient: () => database(tables, opts.failures) },
    '@/lib/secrets': { verifyCronSecret: () => opts.authorized !== false },
    '@/lib/programa': { ...calendar, madridParts: () => ({ date: '2026-11-17', hour: opts.hour ?? 10 }) },
    '@/lib/programa-server': {
      INSCRIPCION_COLS: '*',
      enviarBienvenida: async () => { calls.push('bienvenida'); if (opts.failWelcome) throw Error('fallo de prueba'); return true },
      enviarRecordatorioTest: async () => { calls.push('recordatorio_test'); return true },
      enviarSemanal: async (_, key) => { calls.push(key); return opts.sendResult !== false },
      enviarAvisoEncuentro: async () => { calls.push('encuentro'); return true },
    },
  })
  return { calls, run: () => handler.POST({ headers: { get: () => 'secret de prueba' } }) }
}
test('cron sin test: bienvenida y recordatorio; ninguna semana ni cierre', async () => {
  const c = cron({ programa_inscripciones: [active()], programa_envios: [], programa_encuentros: [] })
  assert.equal((await c.run()).status, 200)
  assert.deepEqual(c.calls, ['bienvenida', 'recordatorio_test'])
})
test('cron recupera bienvenida antigua y no repite recordatorio registrado', async () => {
  const c = cron({ programa_inscripciones: [active({ start_date: '2026-10-01' })], programa_envios: [{ inscripcion_id: 'person1', mensaje: 'recordatorio_test' }], programa_encuentros: [] })
  await c.run()
  assert.deepEqual(c.calls, ['bienvenida'])
})
test('cron recupera cierre marcado aunque fallase completar la inscripción', async () => {
  const person = active({ first_answers: { a: 1 }, start_date: '2026-10-01' })
  const c = cron({ programa_inscripciones: [person], programa_envios: [{ inscripcion_id: person.id, mensaje: 'bienvenida' }, { inscripcion_id: person.id, mensaje: 'cierre' }], programa_encuentros: [] })
  await c.run()
  assert.equal(person.status, 'completada')
  assert.deepEqual(c.calls, [])
})
test('cron informa de errores de lectura y no envía si no conoce el historial', async () => {
  const c = cron({ programa_inscripciones: [active()] }, { failures: { 'programa_envios:read': true } })
  assert.equal((await c.run()).status, 500)
  assert.deepEqual(c.calls, [])
})
test('cron respeta la hora de Madrid y la autorización', async () => {
  for (const options of [{ hour: 7 }, { authorized: false }]) {
    const c = cron({ programa_inscripciones: [active()] }, options)
    await c.run()
    assert.deepEqual(c.calls, [])
  }
})
function sender(tables, deliver = async () => {}) {
  return load('lib/programa-server.ts', {
    'server-only': {},
    '@/lib/supabase/admin': { createAdminClient: () => database(tables) },
    '@/lib/notify': { unsubUrl: () => 'https://example.invalid/unsubscribe' },
    '@/lib/email': { sendProgramaEmail: deliver },
    '@/lib/crm-sync': {}, '@/lib/inventario-content': {}, '@/lib/inventario': {},
    '@/lib/programa': calendar, '@/lib/programa-content': content,
  })
}
test('envío: no repite aceptados y libera la reserva si Resend falla', async () => {
  const person = active(), tables = { programa_envios: [] }
  let attempts = 0
  const s = sender(tables, async (...args) => { attempts++; assert.equal(args[4], 'programa/person1/semana1'); if (attempts === 1) throw Error('fallo de prueba') })
  await assert.rejects(s.enviarUnaVez(person, 'semana1', {}))
  assert.equal(tables.programa_envios.length, 0)
  assert.equal(await s.enviarUnaVez(person, 'semana1', {}), true)
  assert.equal(await s.enviarUnaVez(person, 'semana1', {}), false)
  assert.equal(attempts, 2)
  assert.deepEqual(tables.programa_envios.map(e => e.mensaje), ['semana1'])
})
test('envío: una reserva interrumpida caduca; una vigente impide concurrencia', async () => {
  const person = active(), tables = { programa_envios: [{ inscripcion_id: person.id, mensaje: 'reserva:semana1', sent_at: new Date().toISOString() }] }
  let attempts = 0
  const s = sender(tables, async () => { attempts++ })
  assert.equal(await s.enviarUnaVez(person, 'semana1', {}), false)
  tables.programa_envios[0].sent_at = '2026-01-01T00:00:00Z'
  assert.equal(await s.enviarUnaVez(person, 'semana1', {}), true)
  assert.equal(attempts, 1)
})
test('cron detecta fallos de bienvenida en vez de anunciar éxito y seguir enviando', async () => {
  const c = cron({ programa_inscripciones: [active()], programa_envios: [], programa_encuentros: [] }, { failWelcome: true })
  const log = console.error
  console.error = () => {}
  try {
    assert.equal((await c.run()).status, 503)
    assert.deepEqual(c.calls, ['bienvenida'])
  } finally { console.error = log }
})

test('el cierre reservado por otra ejecución no completa la inscripción', async () => {
  const person = active({ first_answers: { a: 1 }, start_date: '2026-10-01' })
  const keys = ['bienvenida', 'semana1', 'jueves1', 'semana2', 'jueves2', 'semana3', 'jueves3', 'semana4', 'jueves4']
  const c = cron({ programa_inscripciones: [person], programa_envios: keys.map(mensaje => ({ inscripcion_id: person.id, mensaje })), programa_encuentros: [] }, { sendResult: false })
  await c.run()
  assert.equal(person.status, 'activa')
  assert.deepEqual(c.calls, ['cierre'])
})
test('semana 4 y cierre: el calendario recupera el mensaje adecuado', async () => {
  for (const [start_date, expected] of [['2026-10-27', 'semana4'], ['2026-10-20', 'cierre']]) {
    const keys = ['bienvenida', 'semana1', 'jueves1', 'semana2', 'jueves2', 'semana3', 'jueves3']
    if (expected === 'cierre') keys.push('semana4', 'jueves4')
    const person = active({ first_answers: { a: 1 }, start_date })
    const c = cron({ programa_inscripciones: [person], programa_envios: keys.map(mensaje => ({ inscripcion_id: person.id, mensaje })), programa_encuentros: [] })
    await c.run()
    assert.deepEqual(c.calls, [expected])
    assert.equal(person.status, expected === 'cierre' ? 'completada' : 'activa')
  }
})
test('primer test tardío inicia hoy; inscripciones ya empezadas conservan su fecha', async () => {
  for (const started of [false, true]) {
    const person = active({ start_date: '2026-11-01' })
    const tables = { programa_inscripciones: [person], programa_envios: started ? [{ inscripcion_id: person.id, mensaje: 'semana1' }] : [], inventario_attempts: [] }
    const sent = []
    const handler = load('app/api/inventario/track/route.ts', {
      'next/server': { NextResponse: { json: (body, o) => ({ body, status: o?.status || 200 }) } },
      '@/lib/supabase/admin': { createAdminClient: () => database(tables) },
      '@/lib/inventario': { parseInvAnswers: x => x || null, buildLectura: () => ({ exercise: 'tiempo', route: 'r', principal: 'p' }) },
      '@/lib/inventario-server': { invLocale: x => x, invSource: x => x, invUuid: x => x, sessionUserId: async () => 'user1' },
      '@/lib/programa': { ...calendar, madridParts: () => ({ date: '2026-11-17', hour: 10 }) },
      '@/lib/programa-server': { inscripcionPorToken: async () => person, enviarSemanal: async (p, key) => sent.push([p.start_date, key]) },
    })
    assert.equal((await handler.POST({ json: async () => ({ answers: { a: 1 }, prog: 'token' }) })).status, 200)
    assert.equal(person.start_date, started ? '2026-11-01' : '2026-11-17')
    assert.equal(person.first_attempt_id, 'attempt1')
    assert.deepEqual(sent, [[person.start_date, 'semana1']])
  }
})
