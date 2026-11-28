import { describe, expect, it } from 'vitest'
import { BACKUP_KEY, STORAGE_KEY, V2_KEY, defaultTrip, loadTrip } from '../src/lib/storage'
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
    expect(data.trip.currencies).toEqual(['TWD', 'KRW'])
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
  it('uses v3 when valid and retains a manual rate', () => {
    const data = defaultTrip()
    data.trip.fxRates.KRW = { rate: 0.023, source: 'manual', updatedAt: '2026-01-01' }
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadTrip(storage).trip.fxRates.KRW).toEqual(data.trip.fxRates.KRW)
  })
})
