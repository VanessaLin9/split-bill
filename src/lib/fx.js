import { SUPPORTED_CURRENCIES } from '../config/currencies'

export const FX_CACHE_KEY = 'split-bill:fx-cache'
const valid = value => Number.isFinite(value) && value > 0
const localDate = now => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

async function request(url, fetcher) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetcher(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally { clearTimeout(timer) }
}

export function getOfficialRate(code, trip) {
  if (!SUPPORTED_CURRENCIES.includes(code)) return null
  if (code === trip.baseCurrency) return 1
  const entry = trip.fxRates[code]
  return entry?.source === 'official' && valid(entry.rate) ? entry.rate : null
}

export async function fetchOfficialRates(base, { fetcher = globalThis.fetch, storage = globalThis.localStorage,
  force = false, now = new Date() } = {}) {
  if (!SUPPORTED_CURRENCIES.includes(base)) throw new Error('Unsupported base currency')
  let cache
  try { cache = JSON.parse(storage?.getItem(FX_CACHE_KEY) || 'null')?.[base] } catch { /* damaged cache */ }
  const cachedRates = cache?.base === base && cache?.rates &&
    SUPPORTED_CURRENCIES.filter(code => code !== base).every(code => valid(cache.rates[code]))
  if (!force && cachedRates && cache.fetchedAt && localDate(new Date(cache.fetchedAt)) === localDate(now)) return { ...cache, stale: false, cached: true }
  const quotes = SUPPORTED_CURRENCIES.filter(code => code !== base)
  const providers = [
    { name: 'Frankfurter', url: `https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quotes.join(',')}`,
      parse: json => Object.fromEntries(json.filter(row => row.base === base && quotes.includes(row.quote) && valid(Number(row.rate))).map(row => [row.quote, 1 / Number(row.rate)])),
      date: json => json[0]?.date },
    ...['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies', 'https://latest.currency-api.pages.dev/v1/currencies'].map((root, index) => ({
      name: index ? 'currency-api pages.dev' : 'currency-api jsDelivr', url: `${root}/${base.toLowerCase()}.min.json`,
      parse: json => Object.fromEntries(quotes.filter(code => valid(Number(json[base.toLowerCase()]?.[code.toLowerCase()]))).map(code => [code, 1 / Number(json[base.toLowerCase()][code.toLowerCase()])])),
      date: json => json.date,
    })),
  ]
  for (const provider of providers) {
    try {
      const json = await request(provider.url, fetcher)
      const rates = provider.parse(json)
      if (!quotes.every(code => valid(rates[code]))) throw new Error('Incomplete or invalid rates')
      const result = { base, rates, date: provider.date(json), fetchedAt: now.toISOString(), provider: provider.name }
      let all = {}
      try { all = JSON.parse(storage?.getItem(FX_CACHE_KEY) || '{}') || {} } catch { /* repair cache */ }
      storage?.setItem(FX_CACHE_KEY, JSON.stringify({ ...all, [base]: result }))
      return { ...result, stale: false, cached: false }
    } catch { /* try next provider */ }
  }
  if (cachedRates) return { ...cache, stale: true, cached: true }
  throw new Error('Official exchange rates unavailable')
}
