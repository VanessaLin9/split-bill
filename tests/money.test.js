import { describe, expect, it } from 'vitest'
import { roundToCurrency, splitAmount, formatMoney } from '../src/lib/money'
import { SUPPORTED_CURRENCIES } from '../src/config/currencies'
describe('money', () => {
  it('rounds by currency minor digits', () => {
    expect(roundToCurrency(1.6, 'TWD')).toBe(2)
    expect(roundToCurrency(1.6, 'KRW')).toBe(2)
    expect(roundToCurrency(1.234, 'USD')).toBe(1.23)
  })
  it.each([['TWD', 100, [34, 33, 33]], ['KRW', 10000, [3334, 3333, 3333]], ['USD', 10, [3.34, 3.33, 3.33]]])('splits %s exactly', (code, amount, expected) => {
    expect(splitAmount(amount, 3, code)).toEqual(expected)
  })
  it('formats all supported currencies', () => {
    for (const code of SUPPORTED_CURRENCIES) expect(() => formatMoney(1234.56, code)).not.toThrow()
  })
})
