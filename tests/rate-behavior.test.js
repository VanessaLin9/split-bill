import { afterEach, describe, expect, it, vi } from 'vitest'
import { deriveActualRate } from '../src/lib/fx'
import { roundToCurrency, toDisplay } from '../src/lib/money'
import { getTotal, getOwedBreakdown, getFinalSettlements } from '../src/lib/settlement'

function storage() {
  const values = new Map()
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) }
}
async function reloadTrip() {
  vi.resetModules()
  const { useTrip } = await import('../src/composable/useTrip')
  return useTrip()
}
async function freshTrip() {
  vi.stubGlobal('localStorage', storage())
  return reloadTrip()
}
afterEach(() => vi.unstubAllGlobals())

describe('trip rate behavior', () => {
  it('snapshots an actual exchange and keeps its manual rate after reload until confirmed overwrite', async () => {
    const state = await freshTrip()
    const rate = deriveActualRate(10000, 430000)
    expect(rate).toBeCloseTo(0.023256, 6)
    expect(state.setRate('KRW', rate)).toBe(true)
    expect(state.trip.value.fxRates.KRW).toMatchObject({ source: 'manual', rate })
    const a = state.members.value[0]
    expect(state.addExpense({ amount: 430000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id] })).toBe(true)
    expect(state.expenses.value[0]).toMatchObject({ fxSource: 'manual', fxRate: rate })
    expect(state.expenses.value[0].amountInBase).toBeCloseTo(10000, 6)

    const reloaded = await reloadTrip()
    expect(reloaded.trip.value.fxRates.KRW).toMatchObject({ source: 'manual', rate })
    expect(reloaded.expenses.value[0].amountInBase).toBeCloseTo(10000, 6)
    const official = { rates: { KRW: 0.025 }, date: '2026-11-27', fetchedAt: '2026-11-27T12:00:00Z' }
    expect(reloaded.applyOfficialRates(official)).toBe(false)
    expect(reloaded.trip.value.fxRates.KRW).toMatchObject({ source: 'manual', rate })
    expect(reloaded.applyOfficialRates(official, true)).toBe(true)
    expect(reloaded.trip.value.fxRates.KRW).toMatchObject({ source: 'official', rate: 0.025 })
    expect(reloaded.expenses.value[0].amountInBase).toBeCloseTo(10000, 6)
    const saved = JSON.parse(localStorage.getItem('split-bill:v3'))
    expect(saved.trip.fxRates.KRW.source).toBe('official')
  })
  it('totals mixed KRW and TWD expenses in base currency and settles the converted shares', async () => {
    const state = await freshTrip()
    const [a, b] = state.members.value
    const rate = 0.024
    expect(state.trip.value.currencies).toContain('KRW')
    expect(state.setRate('KRW', rate)).toBe(true)
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id, b.id] })).toBe(true)
    expect(state.addExpense({ amount: 1000, currency: 'TWD', paidBy: b.id, sharedWith: [a.id, b.id] })).toBe(true)
    const expenses = state.expenses.value
    expect(getTotal(expenses)).not.toBe(51000)
    expect(getTotal(expenses)).toBe(50000 * rate + 1000)
    expect(getOwedBreakdown(expenses)).toEqual({ [a.id]: 1100, [b.id]: 1100 })
    expect(getFinalSettlements(expenses)).toEqual({ [b.id]: [{ from: b.id, to: a.id, amount: 100 }] })
  })
  it('agrees within one KRW for every pair when displaying a multi-person mixed-currency trip', async () => {
    const state = await freshTrip()
    const [a, b, c] = state.members.value
    expect(state.setRate('KRW', 0.024)).toBe(true)
    for (const expense of [
      { amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id, b.id, c.id] },
      { amount: 1000, currency: 'TWD', paidBy: b.id, sharedWith: [a.id, b.id] },
      { amount: 10001, currency: 'KRW', paidBy: c.id, sharedWith: [a.id, b.id, c.id] },
    ]) expect(state.addExpense(expense)).toBe(true)
    const pairs = Object.values(getFinalSettlements(state.expenses.value)).flat()
    expect(pairs).toHaveLength(3)
    for (const pair of pairs) {
      const twd = roundToCurrency(toDisplay(pair.amount, 'TWD', state.trip.value), 'TWD')
      const krw = roundToCurrency(toDisplay(pair.amount, 'KRW', state.trip.value), 'KRW')
      expect(Math.abs(toDisplay(twd, 'KRW', state.trip.value) - krw)).toBeLessThanOrEqual(1)
    }
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
  })
  it('blocks a foreign expense without a rate', async () => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id] })).toBe(false)
    expect(state.expenses.value).toEqual([])
    expect(getTotal(state.expenses.value)).toBe(0)
  })
  it.each([['TWD', 1000.1, 1000], ['KRW', 50000.5, 50000], ['USD', 12.345, 12.34]])(
    'rejects excess decimals for %s while accepting its supported precision', async (currency, invalid, valid) => {
      const state = await freshTrip()
      expect(state.toggleCurrency('USD')).toBe(true)
      expect(state.setRate('KRW', 0.024)).toBe(true)
      expect(state.setRate('USD', 32)).toBe(true)
      const a = state.members.value[0]
      const expense = { currency, paidBy: a.id, sharedWith: [a.id] }
      expect(state.addExpense({ ...expense, amount: invalid })).toBe(false)
      expect(state.expenses.value).toEqual([])
      expect(state.addExpense({ ...expense, amount: valid })).toBe(true)
    })
  it('refuses base currency changes with expenses and resets rates when changed on an empty trip', async () => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.setRate('KRW', 0.024)).toBe(true)
    expect(state.addExpense({ amount: 1000, currency: 'TWD', paidBy: a.id, sharedWith: [a.id] })).toBe(true)
    const before = JSON.stringify(state.trip.value)
    expect(state.setBaseCurrency('KRW')).toBe(false)
    expect(JSON.stringify(state.trip.value)).toBe(before)
    state.removeExpense(state.expenses.value[0].id)
    expect(state.setBaseCurrency('KRW')).toBe(true)
    expect(state.trip.value.baseCurrency).toBe('KRW')
    expect(state.trip.value.fxRates).toEqual({})
    const reloaded = await reloadTrip()
    expect(reloaded.trip.value.baseCurrency).toBe('KRW')
    expect(reloaded.trip.value.fxRates).toEqual({})
  })
})
