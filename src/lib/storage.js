export const STORAGE_KEY = 'split-bill:v2'
export const BACKUP_KEY = 'split-bill:v2:backup'
export const DEFAULT_MEMBER_NAMES = ['企鵝', '熊熊', '查德']

export function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export function defaultTrip() {
  const now = new Date().toISOString()
  return {
    schemaVersion: 2,
    trip: {
      id: makeId(), name: '',
      members: DEFAULT_MEMBER_NAMES.map(name => ({ id: makeId(), name })),
      expenses: [], createdAt: now, updatedAt: now,
    },
  }
}

function parse(value) {
  try { return JSON.parse(value) } catch { return null }
}

export function sanitizeV2(data) {
  const trip = data.trip && typeof data.trip === 'object' && !Array.isArray(data.trip)
    ? data.trip : defaultTrip().trip
  const now = new Date().toISOString()
  const createdAt = typeof trip.createdAt === 'string' && trip.createdAt.trim() ? trip.createdAt : now
  const updatedAt = typeof trip.updatedAt === 'string' && trip.updatedAt.trim() ? trip.updatedAt : now
  const members = []
  const memberIds = new Set()
  for (const member of Array.isArray(trip.members) ? trip.members : []) {
    if (!member || typeof member !== 'object' || typeof member.name !== 'string') continue
    const name = member.name.trim()
    if (!name) continue
    const id = typeof member.id === 'string' && member.id.trim() ? member.id : makeId()
    if (memberIds.has(id)) continue
    members.push({ ...member, id, name })
    memberIds.add(id)
  }

  const expenses = []
  const expenseIds = new Set()
  for (const expense of Array.isArray(trip.expenses) ? trip.expenses : []) {
    if (!expense || typeof expense !== 'object' || expense.amount === '' || expense.amount === null) continue
    const amount = Number(expense.amount)
    if (!Number.isFinite(amount) || amount <= 0 || !memberIds.has(expense.paidBy) ||
        !Array.isArray(expense.sharedWith) || !expense.sharedWith.length ||
        expense.sharedWith.some(id => !memberIds.has(id))) continue
    let id = typeof expense.id === 'string' && expense.id.trim() ? expense.id : makeId()
    while (expenseIds.has(id)) id = makeId()
    expenseIds.add(id)
    expenses.push({ ...expense, id, amount, sharedWith: [...new Set(expense.sharedWith)],
      description: typeof expense.description === 'string' ? expense.description : '',
      createdAt: typeof expense.createdAt === 'string' && expense.createdAt.trim()
        ? expense.createdAt : createdAt })
  }

  return { ...data, trip: { ...trip,
    id: typeof trip.id === 'string' && trip.id.trim() ? trip.id : makeId(),
    name: typeof trip.name === 'string' ? trip.name : '',
    members, expenses, createdAt, updatedAt,
  } }
}

export function migrateLegacy(membersValue, expensesValue) {
  const data = defaultTrip()
  const members = parse(membersValue)
  const expenses = parse(expensesValue)
  data.trip.members = []
  const byName = new Map()
  const ensureMember = name => {
    if (typeof name !== 'string' || !name.trim()) return null
    const clean = name.trim()
    if (!byName.has(clean)) {
      const member = { id: makeId(), name: clean }
      byName.set(clean, member.id)
      data.trip.members.push(member)
    }
    return byName.get(clean)
  }
  if (Array.isArray(members)) members.forEach(ensureMember)
  else DEFAULT_MEMBER_NAMES.forEach(ensureMember)
  if (Array.isArray(expenses)) {
    for (const expense of expenses) {
      if (!expense || typeof expense !== 'object') continue
      const amount = Number(expense.amount)
      if (expense.amount === '' || expense.amount === null || !Number.isFinite(amount) || amount <= 0 || !Array.isArray(expense.sharedWith) || !expense.sharedWith.length ||
          typeof expense.paidBy !== 'string' || !expense.paidBy.trim() ||
          expense.sharedWith.some(name => typeof name !== 'string' || !name.trim())) continue
      const paidBy = ensureMember(expense.paidBy)
      const sharedWith = [...new Set(expense.sharedWith.map(ensureMember))]
      data.trip.expenses.push({ id: makeId(), amount, paidBy, sharedWith,
        description: typeof expense.description === 'string' ? expense.description : '',
        createdAt: data.trip.createdAt })
    }
  }
  return data
}

export function saveTrip(data, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadTrip(storage = globalThis.localStorage) {
  const raw = storage.getItem(STORAGE_KEY)
  const existing = parse(raw)
  if (existing?.schemaVersion === 2) {
    const sanitized = sanitizeV2(existing)
    if (JSON.stringify(sanitized) === JSON.stringify(existing)) return existing
    storage.setItem(BACKUP_KEY, raw)
    saveTrip(sanitized, storage)
    return sanitized
  }
  if (raw !== null) storage.setItem(BACKUP_KEY, raw)
  const legacyMembers = storage.getItem('members')
  const legacyExpenses = storage.getItem('expenses')
  const data = legacyMembers !== null || legacyExpenses !== null
    ? migrateLegacy(legacyMembers, legacyExpenses) : defaultTrip()
  saveTrip(data, storage)
  return data
}
