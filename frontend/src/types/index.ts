export interface MonthlyBar {
  month: string
  open: number
  close: number
  high: number
  low: number
  vol: number
}

export interface StockInfo {
  name: string
  sector: string
  market_cap: number
  pe_ratio: number
  "52w_high": number
  "52w_low": number
  currency: string
}

export interface FetchResponse {
  ticker: string
  data: MonthlyBar[]
}
