import { afterEach, describe, expect, it, vi } from 'vitest'
import { roundToCurrency, toDisplay } from '../src/lib/money'
import { getTotal, getOwedBreakdown, getFinalSettlements } from '../src/lib/settlement'

const official = rates => ({ rates, date: '2026-11-27', fetchedAt: '2026-11-27T12:00:00Z' })

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
  it('totals mixed KRW and TWD expenses in base currency and settles the converted shares', async () => {
    const state = await freshTrip()
    const [a, b] = state.members.value
    const rate = 0.024
    expect(state.trip.value.currencies).toContain('KRW')
    state.applyOfficialRates(official({ KRW: rate }))
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
    state.applyOfficialRates(official({ KRW: 0.024 }))
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
  it('snapshots official rates and refreshes only the rates for future expenses', async () => {
    const state = await freshTrip()
    const [a, b] = state.members.value
    state.applyOfficialRates(official({ KRW: 0.02 }))
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id, b.id] })).toBe(true)
    expect(state.expenses.value[0]).toMatchObject({ fxSource: 'official', fxRate: 0.02, amountInBase: 1000 })
    const snapshot = JSON.parse(JSON.stringify(state.expenses.value[0]))
    state.applyOfficialRates(official({ KRW: 0.025 }))
    expect(state.expenses.value[0]).toEqual(snapshot)
    expect(state.addExpense({ amount: 10000, currency: 'KRW', paidBy: b.id, sharedWith: [a.id, b.id] })).toBe(true)
    expect(state.expenses.value[1]).toMatchObject({ fxSource: 'official', fxRate: 0.025, amountInBase: 250 })
    const reloaded = await reloadTrip()
    expect(reloaded.expenses.value[0]).toEqual(snapshot)
    expect(reloaded.trip.value.fxRates.KRW).toMatchObject({ source: 'official', rate: 0.025 })
  })
  it('blocks a foreign expense without a rate', async () => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id] })).toBe(false)
    expect(state.expenses.value).toEqual([])
    expect(getTotal(state.expenses.value)).toBe(0)
  })
  it.each([['TWD', 1000.1, 1000], ['KRW', 50000.5, 50000], ['JPY', 100.5, 100], ['USD', 12.345, 12.34], ['EUR', 12.345, 12.34]])(
    'rejects excess decimals for %s while accepting its supported precision', async (currency, invalid, valid) => {
      const state = await freshTrip()
      state.applyOfficialRates(official({ KRW: 0.024, USD: 32, JPY: 0.21, EUR: 34 }))
      const a = state.members.value[0]
      const expense = { currency, paidBy: a.id, sharedWith: [a.id] }
      expect(state.addExpense({ ...expense, amount: invalid })).toBe(false)
      expect(state.expenses.value).toEqual([])
      expect(state.addExpense({ ...expense, amount: valid })).toBe(true)
    })
  it('records base currency without needing a rate', async () => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.addExpense({ amount: 1000, currency: 'TWD', paidBy: a.id, sharedWith: [a.id] })).toBe(true)
    expect(state.expenses.value[0]).toMatchObject({ currency: 'TWD', fxSource: 'base', fxRate: 1, amountInBase: 1000 })
  })
  it.each([0, -1, NaN, Infinity, undefined])('rejects an invalid official rate (%s)', async rate => {
    const state = await freshTrip()
    const a = state.members.value[0]
    expect(state.applyOfficialRates(official({ KRW: rate }))).toBe(false)
    expect(state.addExpense({ amount: 50000, currency: 'KRW', paidBy: a.id, sharedWith: [a.id] })).toBe(false)
  })
})
