import { useStock } from '../hooks/useStock'
import TickerSearch from '../components/TickerSearch'
import MetricCard from '../components/MetricCard'
import PriceChart from '../components/PriceChart'
import ReturnChart from '../components/ReturnChart'
import VolumeChart from '../components/VolumeChart'
import SummaryTable from '../components/SummaryTable'
import InsightsBox from '../components/InsightsBox'
import StockInfoBar from '../components/StockInfoBar'

export default function Dashboard() {
  const { data, ticker, info, aiInsights, loading, aiLoading, error, load } = useStock()

  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const first = data[0]

  const currency = ticker.endsWith('.NS') || ticker.endsWith('.BO') ? '₹' : '$'
  const totalReturn = data.length > 1
    ? ((last.close - first.open) / first.open * 100).toFixed(1) + '%' : '—'
  const monthReturn = last && prev
    ? ((last.close - prev.close) / prev.close * 100).toFixed(1) + '%' : '—'
  const monthUp = last && prev ? last.close >= prev.close : true
  const maxHigh = data.length ? Math.max(...data.map(d => d.high)).toLocaleString() : '—'
  const avgVol = data.length
    ? (data.reduce((s, d) => s + d.vol, 0) / data.length / 1e6).toFixed(1) + 'M' : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Search any ticker to load live financial data and AI analysis
        </p>
      </div>

      <TickerSearch onSearch={load} loading={loading} />

      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(242,95,92,0.1)',
          border: '1px solid var(--down)', borderRadius: 'var(--radius)',
          color: 'var(--down)', fontSize: 13,
        }}>{error}</div>
      )}

      {data.length > 0 && (
        <>
          <StockInfoBar info={info} ticker={ticker} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            <MetricCard label="Latest close" value={`${currency}${last.close.toLocaleString()}`} change={monthReturn} up={monthUp} />
            <MetricCard label="Total return" value={totalReturn} change="over period" up={parseFloat(totalReturn) >= 0} />
            <MetricCard label="52-week high" value={`${currency}${maxHigh}`} />
            <MetricCard label="Avg monthly vol" value={avgVol} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <PriceChart data={data} />
            <ReturnChart data={data} />
          </div>

          <VolumeChart data={data} />
          <SummaryTable data={data} currency={currency} />
          <InsightsBox insights={aiInsights} loading={aiLoading} ticker={ticker} />
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)', fontSize: 14 }}>
          Search for a ticker above to get started
        </div>
      )}
    </div>
  )
}
