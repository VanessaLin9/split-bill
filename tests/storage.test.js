import { describe, expect, it } from 'vitest'
import { BACKUP_KEY, STORAGE_KEY, V2_KEY, defaultTrip, loadTrip } from '../src/lib/storage'
import { SUPPORTED_CURRENCIES } from '../src/config/currencies'
import { getFinalSettlements, getOwedBreakdown, getTotal } from '../src/lib/settlement'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return { getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value) }
}

describe('v3 storage', () => {
  it('migrates v2 expenses to TWD snapshots without changing settlement', () => {
    const v2 = { schemaVersion: 2, trip: { id: 'trip', name: '', members: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      expenses: [{ id: 'one', amount: 100, paidBy: 'a', sharedWith: ['a', 'b'], description: 'meal' }],
      createdAt: '2026-01-01', updatedAt: '2026-01-01' } }
    const raw = JSON.stringify(v2)
    const storage = memoryStorage({ [V2_KEY]: raw })
    const data = loadTrip(storage)
    expect(data.schemaVersion).toBe(3)
    expect(data.trip.baseCurrency).toBe('TWD')
    expect(data.trip.currencies).toEqual(SUPPORTED_CURRENCIES)
    expect(data.trip.expenses[0]).toMatchObject({ currency: 'TWD', fxRate: 1, fxSource: 'base', amountInBase: 100 })
    expect(getTotal(data.trip.expenses)).toBe(getTotal(v2.trip.expenses))
    expect(getOwedBreakdown(data.trip.expenses)).toEqual(getOwedBreakdown(v2.trip.expenses))
    expect(getFinalSettlements(data.trip.expenses)).toEqual(getFinalSettlements(v2.trip.expenses))
    expect(storage.getItem(V2_KEY)).toBe(raw)
    expect(loadTrip(storage)).toEqual(data)
  })
  it('migrates legacy data directly to v3', () => {
    const storage = memoryStorage({ members: '["A","B"]', expenses: JSON.stringify([{ amount: 30, paidBy: 'A', sharedWith: ['A', 'B'] }]) })
    const data = loadTrip(storage)
    expect(data.trip.members.map(m => m.name)).toEqual(['A', 'B'])
    expect(data.trip.expenses[0]).toMatchObject({ amount: 30, currency: 'TWD', amountInBase: 30 })
    expect(storage.getItem('members')).toBe('["A","B"]')
  })
  it('backs up corrupt v3 and falls back to v2', () => {
    const v2 = { schemaVersion: 2, trip: { members: [{ id: 'a', name: 'A' }], expenses: [] } }
    const storage = memoryStorage({ [STORAGE_KEY]: '{broken', [V2_KEY]: JSON.stringify(v2) })
    expect(loadTrip(storage).trip.members[0].name).toBe('A')
    expect(storage.getItem(BACKUP_KEY)).toBe('{broken')
  })
  it('backs up structurally damaged v3 and falls back to v2', () => {
    const v2 = { schemaVersion: 2, trip: { members: [{ id: 'a', name: 'A' }], expenses: [] } }
    const raw = JSON.stringify({ schemaVersion: 3, trip: {} })
    const store = memoryStorage({ [STORAGE_KEY]: raw, [V2_KEY]: JSON.stringify(v2) })
    expect(loadTrip(store).trip.members[0].name).toBe('A')
    expect(store.getItem(BACKUP_KEY)).toBe(raw)
  })
  it('prefers v3, drops unsupported trip rates, and preserves historical snapshots', () => {
    const data = defaultTrip()
    data.trip.currencies = ['TWD', 'KRW']
    data.trip.fxRates = {
      KRW: { rate: 0.023, source: 'manual', updatedAt: '2026-01-01' },
      USD: { rate: 32, source: 'override', updatedAt: '2026-01-01' },
      EUR: { rate: 34, source: 'official', updatedAt: '2026-01-01', officialDate: '2025-12-31' },
    }
    const a = data.trip.members[0].id
    data.trip.expenses = ['manual', 'override'].map((fxSource, index) => ({
      id: `saved-${index}`, amount: 50000, currency: 'KRW', fxRate: 0.023256789123,
      // Deliberately differs from the rounded product: loading must not recalculate it.
      amountInBase: 1163.456789123, fxSource, paidBy: a, sharedWith: [a],
      description: 'historical', createdAt: data.trip.createdAt,
    }))
    const v2 = { schemaVersion: 2, trip: { members: [], expenses: [] } }
    const store = memoryStorage({ [STORAGE_KEY]: JSON.stringify(data), [V2_KEY]: JSON.stringify(v2) })
    const loaded = loadTrip(store)
    expect(loaded.trip.members).toEqual(data.trip.members)
    expect(loaded.trip.currencies).toEqual(SUPPORTED_CURRENCIES)
    expect(loaded.trip.fxRates).toEqual({ EUR: data.trip.fxRates.EUR })
    expect(loaded.trip.expenses).toEqual(data.trip.expenses)
    expect(loadTrip(store)).toEqual(loaded)
    expect(JSON.parse(store.getItem(STORAGE_KEY))).toEqual(loaded)
  })
  it('keeps an existing non-TWD base and its saved snapshots', () => {
    const data = defaultTrip()
    const a = data.trip.members[0].id
    data.trip.baseCurrency = 'KRW'
    data.trip.expenses = [{ id: 'saved', amount: 50000, currency: 'KRW', fxRate: 1.01,
      fxSource: 'override', amountInBase: 50500.123, paidBy: a, sharedWith: [a],
      description: '', createdAt: data.trip.createdAt }]
    const store = memoryStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadTrip(store).trip.expenses).toEqual(data.trip.expenses)
    expect(loadTrip(store).trip.baseCurrency).toBe('KRW')
  })
})
