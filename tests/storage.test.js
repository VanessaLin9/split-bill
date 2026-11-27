import { describe, expect, it } from 'vitest'
import { BACKUP_KEY, defaultTrip, loadTrip, STORAGE_KEY } from '../src/lib/storage'
import { getFinalSettlements, getOwedBreakdown, getTotal } from '../src/lib/settlement'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  }
}

describe('trip storage', () => {
  it('migrates legacy members and expenses with the same amounts and settlement, retaining legacy keys', () => {
    const members = ['企鵝', '熊熊', '查德']
    const expenses = [
      { amount: 90, paidBy: '企鵝', description: 'meal', sharedWith: members },
      { amount: 30, paidBy: '熊熊', description: 'taxi', sharedWith: ['企鵝', '熊熊'] },
    ]
    const legacyMembers = JSON.stringify(members)
    const legacyExpenses = JSON.stringify(expenses)
    const storage = memoryStorage({ members: legacyMembers, expenses: legacyExpenses })
    const data = loadTrip(storage)
    const names = Object.fromEntries(data.trip.members.map(m => [m.id, m.name]))
    expect(data.schemaVersion).toBe(2)
    expect(data.trip.members.map(m => m.name)).toEqual(members)
    expect(data.trip.expenses.map(e => ({ amount: e.amount, paidBy: names[e.paidBy],
      sharedWith: e.sharedWith.map(id => names[id]), description: e.description }))).toEqual(expenses)
    expect(getTotal(data.trip.expenses)).toBe(120)
    expect(Object.fromEntries(Object.entries(getOwedBreakdown(data.trip.expenses)).map(([id, amount]) => [names[id], amount]))).toEqual({ 企鵝: 45, 熊熊: 45, 查德: 30 })
    expect(Object.values(getFinalSettlements(data.trip.expenses)).flat().map(s => ({ from: names[s.from], to: names[s.to], amount: s.amount }))).toEqual([
      { from: '熊熊', to: '企鵝', amount: 15 }, { from: '查德', to: '企鵝', amount: 30 },
    ])
    expect(storage.getItem('members')).toBe(legacyMembers)
    expect(storage.getItem('expenses')).toBe(legacyExpenses)
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(data)
    expect(loadTrip(storage)).toEqual(data)
  })

  it('creates a member for an unknown legacy name', () => {
    const storage = memoryStorage({ members: '["企鵝"]', expenses: JSON.stringify([
      { amount: 20, paidBy: 'Visitor', sharedWith: ['企鵝', 'Visitor'], description: 'coffee' },
    ]) })
    const data = loadTrip(storage)
    expect(data.trip.members.map(m => m.name)).toEqual(['企鵝', 'Visitor'])
    expect(data.trip.expenses[0].paidBy).toBe(data.trip.members[1].id)
  })

  it('uses defaults for corrupt JSON without throwing', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{', members: '[bad', expenses: '{bad' })
    expect(() => loadTrip(storage)).not.toThrow()
    expect(loadTrip(storage).trip.members.map(m => m.name)).toEqual(['企鵝', '熊熊', '查德'])
    expect(loadTrip(storage).trip.expenses).toEqual([])
    expect(storage.getItem(BACKUP_KEY)).toBe('{')
  })

  it('repairs v2 without losing valid expenses or members and backs up the raw value', () => {
    const existing = defaultTrip()
    const [payer, participant] = existing.trip.members
    payer.name = ' 企鵝 '
    existing.trip.members.push({ id: payer.id, name: 'duplicate' }, { id: 'nameless', name: ' ' })
    existing.trip.expenses = [
      { id: 'good', amount: 40, paidBy: payer.id, sharedWith: [payer.id, participant.id], description: 'meal', createdAt: existing.trip.createdAt },
      { id: 'bad-amount', amount: 0, paidBy: payer.id, sharedWith: [participant.id] },
      { id: 'bad-reference', amount: 20, paidBy: 'missing', sharedWith: [participant.id] },
      { amount: 12, paidBy: participant.id, sharedWith: [payer.id], description: undefined },
    ]
    const raw = JSON.stringify(existing)
    const storage = memoryStorage({ [STORAGE_KEY]: raw, members: '["legacy"]' })
    const data = loadTrip(storage)
    expect(data.trip.members.map(m => m.name)).toEqual(['企鵝', '熊熊', '查德'])
    expect(data.trip.expenses.map(e => e.amount)).toEqual([40, 12])
    expect(data.trip.expenses[0].id).toBe('good')
    expect(data.trip.expenses[1]).toMatchObject({ paidBy: participant.id, description: '', createdAt: existing.trip.createdAt })
    expect(data.trip.expenses[1].id).toEqual(expect.any(String))
    expect(storage.getItem(BACKUP_KEY)).toBe(raw)
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(data)
    expect(storage.getItem('members')).toBe('["legacy"]')
    expect(loadTrip(storage)).toEqual(data)
  })

  it('backs up unparsable v2 and migrates legacy data when available', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{broken', members: '["A"]',
      expenses: JSON.stringify([{ amount: 10, paidBy: 'A', sharedWith: ['A'], description: 'food' }]) })
    const data = loadTrip(storage)
    expect(data.trip.members.map(m => m.name)).toEqual(['A'])
    expect(data.trip.expenses.map(e => e.description)).toEqual(['food'])
    expect(storage.getItem(BACKUP_KEY)).toBe('{broken')
  })

  it('backs up unparsable v2 and uses defaults without legacy data', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{broken' })
    const data = loadTrip(storage)
    expect(data.trip.members.map(m => m.name)).toEqual(['企鵝', '熊熊', '查德'])
    expect(data.trip.expenses).toEqual([])
    expect(storage.getItem(BACKUP_KEY)).toBe('{broken')
  })

  it('fills missing v2 trip fields without consulting legacy data', () => {
    const raw = JSON.stringify({ schemaVersion: 2, trip: {
      members: [{ id: 'a', name: ' A ' }],
      expenses: [{ amount: 5, paidBy: 'a', sharedWith: ['a'] }],
    } })
    const storage = memoryStorage({ [STORAGE_KEY]: raw, members: '["legacy"]' })
    const data = loadTrip(storage)
    expect(data.trip.members).toEqual([{ id: 'a', name: 'A' }])
    expect(data.trip.expenses[0]).toMatchObject({ amount: 5, paidBy: 'a', sharedWith: ['a'], description: '' })
    expect(data.trip.id).toEqual(expect.any(String))
    expect(data.trip.name).toBe('')
    expect(data.trip.createdAt).toEqual(expect.any(String))
    expect(data.trip.updatedAt).toEqual(expect.any(String))
    expect(storage.getItem(BACKUP_KEY)).toBe(raw)
  })

  it('loads a valid v2 trip as-is', () => {
    const existing = defaultTrip()
    existing.trip.name = 'Holiday'
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(existing), members: '["old"]' })
    expect(loadTrip(storage)).toEqual(existing)
    expect(storage.getItem('members')).toBe('["old"]')
    expect(storage.getItem(BACKUP_KEY)).toBeNull()
  })

  it('skips invalid legacy expenses', () => {
    const storage = memoryStorage({ members: '["A"]', expenses: JSON.stringify([
      { amount: 0, paidBy: 'A', sharedWith: ['A'] },
      { amount: 'oops', paidBy: 'A', sharedWith: ['A'] },
      { amount: 10, paidBy: 'A', sharedWith: [] },
    ]) })
    expect(loadTrip(storage).trip.expenses).toEqual([])
  })

  it('deduplicates legacy participant names after trimming', () => {
    const storage = memoryStorage({ members: '["A","B"]', expenses: JSON.stringify([
      { amount: 20, paidBy: 'B', sharedWith: ['A', ' A', 'B'], description: 'food' },
    ]) })
    const data = loadTrip(storage)
    const [a, b] = data.trip.members
    expect(data.trip.expenses[0].sharedWith).toEqual([a.id, b.id])
    expect(getOwedBreakdown(data.trip.expenses)[a.id]).toBe(10)
  })
})
