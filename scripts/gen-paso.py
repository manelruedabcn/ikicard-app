# -*- coding: utf-8 -*-
import json
BASE='/Users/manuelrueda/Downloads/files 2'
with open(f'{BASE}/preguntas_paso.json') as f: preguntas=json.load(f)
with open(f'{BASE}/patrones_paso.json') as f: patrones=json.load(f)

groups=[{"grupo":q["grupo"],"P":q["palabra_p"],"A":q["palabra_a"],"S":q["palabra_s"],"O":q["palabra_o"]} for q in preguntas]
pats=[{"codigo":p["codigo"],"nombre":p["nombre"],"retrato":p["retrato"],"motivacion":p["motivacion"],
       "bajo_presion":p["bajo_presion"],"teme":p["teme"],
       "seria_mas_eficaz_si":p["seria_mas_eficaz_si"],"libro_recomendado":p["libro_recomendado"]} for p in patrones]

header='''// AUTO-GENERADO desde preguntas_paso.json / patrones_paso.json. No editar a mano.
// Regenerar con scripts/gen-paso.py si cambian los datos de origen.
// Lógica de cálculo portada de paso-logic.js (validada en prototipo).

export type Dim = 'P' | 'A' | 'S' | 'O'
export const DIMS: Dim[] = ['P', 'A', 'S', 'O']
export const TOTAL_GRUPOS = 28

// Umbrales de la lógica. APROXIMADOS de prototipo — calibrar con datos reales.
export const MARGEN_DOMINANCIA = 3
export const UMBRAL_CONTRADICCION = 3

export interface Grupo {
  grupo: number
  P: string
  A: string
  S: string
  O: string
}

export interface Patron {
  codigo: string
  nombre: string
  retrato: string
  motivacion: string
  bajo_presion: string
  teme: string
  seria_mas_eficaz_si: string
  libro_recomendado: string
}

export interface Answer {
  grupo: number
  mas: Dim
  menos: Dim
}

export interface InformePaso {
  scores: Record<Dim, number>
  mascara: Record<Dim, number>
  natural: Record<Dim, number>
  codigoPatron: string
  brechas: { dimension: Dim; valor: number; direccion: 'exige_de_mas' | 'esconde' | 'alineado' }[]
  puntoCiego: Dim
  contradicciones: Dim[]
}

'''

logic='''
// ---------- Lógica de cálculo (pura) ----------

function contarElecciones(answers: Answer[]) {
  const maskCount: Record<Dim, number> = { P: 0, A: 0, S: 0, O: 0 }
  const menosCount: Record<Dim, number> = { P: 0, A: 0, S: 0, O: 0 }
  for (const a of answers) {
    maskCount[a.mas]++
    menosCount[a.menos]++
  }
  return { maskCount, menosCount }
}

// Punto neutro por dimensión: si eligieras al azar, cada eje saldría BASE veces
// como MÁS y BASE como MENOS. Es el "cero" contra el que se miden ambos gráficos.
const BASE = TOTAL_GRUPOS / DIMS.length

// Máscara (adaptado): cuánto MÁS que el neutro PRESENTAS ese rasgo. Sale de los
// MÁS. Positivo = lo muestras por encima de lo esperable; negativo = lo ocultas.
function calcularMascara(maskCount: Record<Dim, number>): Record<Dim, number> {
  const mascara = {} as Record<Dim, number>
  for (const d of DIMS) mascara[d] = maskCount[d] - BASE
  return mascara
}

// Natural (instintivo): tu nivel real del rasgo. Sale de los MENOS: rechazarlo
// mucho lo baja. Positivo = tu instinto lo sostiene; negativo = tu instinto lo
// rechaza. Misma escala que la máscara (ambos centrados en el neutro), para que
// la brecha entre ambos sea comparable y pueda ir en las dos direcciones.
function calcularNatural(menosCount: Record<Dim, number>): Record<Dim, number> {
  const natural = {} as Record<Dim, number>
  for (const d of DIMS) natural[d] = BASE - menosCount[d]
  return natural
}

function calcularNetScores(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>
): Record<Dim, number> {
  const net = {} as Record<Dim, number>
  for (const d of DIMS) net[d] = maskCount[d] - menosCount[d]
  return net
}

// Dimensiones dentro de MARGEN_DOMINANCIA del máximo forman el código,
// siempre en orden P-A-S-O. Una sola dominante => se repite 4 veces.
function resolverCodigoPatron(netScores: Record<Dim, number>, margen = MARGEN_DOMINANCIA): string {
  const max = Math.max(...DIMS.map(d => netScores[d]))
  const dominantes = DIMS.filter(d => max - netScores[d] <= margen)
  if (dominantes.length === 1) return dominantes[0].repeat(4)
  if (dominantes.length === 4) return 'PASO'
  return DIMS.filter(d => dominantes.includes(d)).join('')
}

// Brecha por eje = máscara − natural, ambos ya en la misma escala (desviación
// del neutro). Positivo => te exiges de más (presentas el rasgo por encima de tu
// instinto). Negativo => guardas más (tu instinto lo sostiene más de lo que
// muestras). Cero => alineado. Ordenadas por magnitud de la separación.
function calcularBrechas(mascara: Record<Dim, number>, natural: Record<Dim, number>) {
  return DIMS.map(d => {
    const valor = mascara[d] - natural[d]
    return {
      dimension: d,
      valor,
      direccion: (valor > 0 ? 'exige_de_mas' : valor < 0 ? 'esconde' : 'alineado') as
        | 'exige_de_mas'
        | 'esconde'
        | 'alineado',
    }
  }).sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
}

function calcularPuntoCiego(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>
): Dim {
  const total = {} as Record<Dim, number>
  for (const d of DIMS) total[d] = maskCount[d] + menosCount[d]
  return DIMS.reduce((a, b) => (total[a] <= total[b] ? a : b))
}

function calcularContradicciones(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>,
  umbral = UMBRAL_CONTRADICCION
): Dim[] {
  return DIMS.filter(d => Math.min(maskCount[d], menosCount[d]) >= umbral)
}

export function calcularInformePaso(answers: Answer[]): InformePaso {
  if (!Array.isArray(answers) || answers.length !== TOTAL_GRUPOS) {
    throw new Error(`calcularInformePaso espera ${TOTAL_GRUPOS} respuestas, recibió ${answers?.length ?? 0}`)
  }
  const { maskCount, menosCount } = contarElecciones(answers)
  const mascara = calcularMascara(maskCount)
  const natural = calcularNatural(menosCount)
  const netScores = calcularNetScores(maskCount, menosCount)
  return {
    scores: netScores,
    mascara,
    natural,
    codigoPatron: resolverCodigoPatron(netScores),
    brechas: calcularBrechas(mascara, natural),
    puntoCiego: calcularPuntoCiego(maskCount, menosCount),
    contradicciones: calcularContradicciones(maskCount, menosCount),
  }
}

export function getPatron(codigo: string): Patron | undefined {
  return PASO_PATRONES.find(p => p.codigo === codigo)
}
'''

out = (header
  + "export const PASO_GRUPOS: Grupo[] = " + json.dumps(groups, ensure_ascii=False, indent=2) + "\n\n"
  + "export const PASO_PATRONES: Patron[] = " + json.dumps(pats, ensure_ascii=False, indent=2) + "\n"
  + logic)

with open('/Users/manuelrueda/ikicard-app/lib/paso-content.ts','w') as f:
    f.write(out)
print("OK grupos:",len(groups),"patrones:",len(pats))
