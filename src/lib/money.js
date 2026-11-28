import { CURRENCIES } from '../config/currencies'

export function roundToCurrency(amount, code) {
  const factor = 10 ** CURRENCIES[code]
  if (!factor || !Number.isFinite(amount)) throw new Error('Invalid currency or amount')
  return Math.round((amount + Number.EPSILON) * factor) / factor
}

export function formatMoney(amount, code, locale = 'zh-TW') {
  if (!(code in CURRENCIES)) throw new Error('Unsupported currency')
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code,
    minimumFractionDigits: CURRENCIES[code], maximumFractionDigits: CURRENCIES[code] })
    .format(roundToCurrency(amount, code))
}

export function splitAmount(amount, n, code) {
  if (!Number.isInteger(n) || n < 1 || !Number.isFinite(amount) || amount < 0 || !(code in CURRENCIES)) throw new Error('Invalid split')
  const factor = 10 ** CURRENCIES[code]
  const units = Math.round(amount * factor)
  const each = Math.floor(units / n)
  const remainder = units - each * n
  return Array.from({ length: n }, (_, i) => (each + (i < remainder ? 1 : 0)) / factor)
}

// Amounts must already be in the display currency. Allocate whole minor units
// so the shares add up to the total rounded once, with input order breaking ties.
export function roundShares(amounts, code) {
  if (!(code in CURRENCIES) || !Array.isArray(amounts) ||
    amounts.some(amount => !Number.isFinite(amount) || amount < 0)) throw new Error('Invalid shares')
  const factor = 10 ** CURRENCIES[code]
  const shares = amounts.map((amount, index) => {
    const scaled = amount * factor
    const units = Math.floor(scaled)
    return { index, units, remainder: scaled - units }
  })
  const totalUnits = Math.round(roundToCurrency(amounts.reduce((sum, amount) => sum + amount, 0), code) * factor)
  const remainder = totalUnits - shares.reduce((sum, share) => sum + share.units, 0)
  const ranked = [...shares].sort((a, b) => b.remainder - a.remainder || a.index - b.index)
  for (const share of ranked.slice(0, remainder)) share.units += 1
  return shares.map(share => share.units / factor)
}

export function toDisplay(amountInBase, code, trip) {
  const rate = code === trip.baseCurrency ? 1 : trip.fxRates[code]?.rate
  return Number.isFinite(rate) && rate > 0 ? amountInBase / rate : null
}
