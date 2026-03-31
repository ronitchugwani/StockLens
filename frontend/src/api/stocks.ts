import client from './client'
import type { FetchResponse } from '../types'

export async function fetchStock(
  ticker: string,
  period = '1y',
  source = 'yahoo'
): Promise<FetchResponse> {
  const res = await client.post('/api/stocks/fetch', { ticker, period, source })
  return res.data
}

export async function compareStocks(
  tickers: string[],
  period = '1y'
) {
  const res = await client.post('/api/stocks/compare', { tickers, period })
  return res.data
}

export async function uploadCSV(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post('/api/stocks/upload', form)
  return res.data
}

export async function generateInsights(ticker: string, data: any[]) {
  const res = await client.post('/api/insights/generate', {
    ticker,
    summary_data: { data },
  })
  return res.data
}

export async function fetchStockInfo(ticker: string) {
  const res = await client.get(`/api/stocks/info/${ticker}`)
  return res.data
}

export async function downloadReport(ticker: string, period = '1y') {
  const res = await client.post(
    '/api/reports/generate',
    { ticker, period },
    { responseType: 'blob' }
  )
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${ticker}_report_${period}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
