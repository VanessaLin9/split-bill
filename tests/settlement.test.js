import { describe, expect, it } from 'vitest'
import { getTotal, getOwedBreakdown, getFinalSettlements } from '../src/lib/settlement'

const expense = (amount, paidBy, sharedWith) => ({ amount, paidBy, sharedWith })

describe('settlement', () => {
  it('splits a single expense', () => {
    const expenses = [expense(60, 'a', ['b', 'c'])]
    expect(getTotal(expenses)).toBe(60)
    expect(getOwedBreakdown(expenses)).toEqual({ b: 30, c: 30 })
    expect(getFinalSettlements(expenses)).toEqual({ b: [{ from: 'b', to: 'a', amount: 30 }], c: [{ from: 'c', to: 'a', amount: 30 }] })
  })
  it('does not make the payer owe themself', () => {
    expect(getFinalSettlements([expense(30, 'a', ['a', 'b'])])).toEqual({ b: [{ from: 'b', to: 'a', amount: 15 }] })
  })
  it('nets debts in both directions and rounds to cents', () => {
    expect(getFinalSettlements([expense(10, 'a', ['b']), expense(4.555, 'b', ['a'])])).toEqual({ b: [{ from: 'b', to: 'a', amount: 5.45 }] })
  })
  it('returns an empty result when everything is settled', () => {
    expect(getFinalSettlements([expense(10, 'a', ['b']), expense(10, 'b', ['a'])])).toEqual({})
    expect(getFinalSettlements([expense(10, 'a', ['a'])])).toEqual({})
  })
})
