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

export function toDisplay(amountInBase, code, trip) {
  const rate = code === trip.baseCurrency ? 1 : trip.fxRates[code]?.rate
  return Number.isFinite(rate) && rate > 0 ? amountInBase / rate : null
}
