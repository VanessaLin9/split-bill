import { describe, expect, it, vi } from 'vitest'

function storage() {
  const values = new Map()
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) }
}
async function freshTrip() {
  vi.resetModules()
  vi.stubGlobal('localStorage', storage())
  const { useTrip } = await import('../src/composable/useTrip')
  return useTrip()
}
describe('trip rate behavior', () => {
  it('keeps manual rates across reload and does not overwrite on official refresh', async () => {
    const state = await freshTrip()
    state.setRate('KRW', 0.023, 'manual')
    state.applyOfficialRates({ rates: { KRW: 0.025 }, date: '2026-11-27', fetchedAt: '2026-11-27T12:00:00Z' })
    expect(state.trip.value.fxRates.KRW.rate).toBe(0.023)
    state.applyOfficialRates({ rates: { KRW: 0.025 }, date: '2026-11-27', fetchedAt: '2026-11-27T12:00:00Z' }, true)
    expect(state.trip.value.fxRates.KRW.rate).toBe(0.025)
    const saved = JSON.parse(localStorage.getItem('split-bill:v3'))
    expect(saved.trip.fxRates.KRW.source).toBe('official')
    vi.unstubAllGlobals()
  })
  it('snapshots rates; only explicit apply updates existing expenses, except overrides', async () => {
    const state = await freshTrip()
    const [a, b] = state.members.value
    state.setRate('KRW', 0.02)
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id, b.id] })).toBe(true)
    expect(state.addExpense({ amount: 10000, currency: 'KRW', overrideRate: 0.03, paidBy: b.id, sharedWith: [a.id, b.id] })).toBe(true)
    state.setRate('KRW', 0.025)
    expect(state.expenses.value.map(e => e.amountInBase)).toEqual([1000, 300])
    state.applyCurrentRatesToExpenses()
    expect(state.expenses.value.map(e => e.amountInBase)).toEqual([1250, 300])
    expect(state.expenses.value[1].fxSource).toBe('override')
    vi.unstubAllGlobals()
  })
  it('blocks a foreign expense without a rate', async () => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id] })).toBe(false)
    vi.unstubAllGlobals()
  })
})
