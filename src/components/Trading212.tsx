'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

interface Position {
  ticker: string
  quantity: number
  averagePrice: number
  currentPrice: number
  value: number
  ppl: number
  pctChange: number
}

interface Cash {
  free: number
  invested: number
  ppl: number
  total: number
}

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: decimals, maximumFractionDigits: decimals })

const pctFmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

const pplColor = (n: number) => n >= 0 ? 'var(--green)' : '#f87171'

// Strip exchange suffix from ticker for display (e.g. AAPL_US_EQ → AAPL)
const displayTicker = (t: string) => t.split('_')[0]

const Trading212 = () => {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [connected, setConnected]   = useState<boolean | null>(null)
  const [loading, setLoading]       = useState(true)
  const [apiIdDraft, setApiIdDraft]   = useState('')
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [positions, setPositions]   = useState<Position[]>([])
  const [cash, setCash]             = useState<Cash | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [showKey, setShowKey]       = useState(false)

  useEffect(() => {
    if (!userId) return
    checkStatus()
  }, [userId])

  useEffect(() => {
    if (!connected) return
    const id = setInterval(loadPortfolio, 30_000)
    return () => clearInterval(id)
  }, [connected])

  const checkStatus = async () => {
    try {
      const res  = await fetch(`${BACKEND}/trading212/status/${userId}`)
      const data = await res.json()
      setConnected(data.connected)
      if (data.connected) loadPortfolio()
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolio = async () => {
    setDataLoading(true)
    try {
      const res  = await fetch(`${BACKEND}/trading212/portfolio/${userId}`)
      const data = await res.json()
      console.log('[T212 raw]', data.rawPositions)
      if (!res.ok) throw new Error(data.error ?? JSON.stringify(data))
      setPositions(data.positions ?? [])
      setCash(data.cash ?? null)
    } finally {
      setDataLoading(false)
    }
  }

  const connect = async () => {
    if (!apiIdDraft.trim() || !apiKeyDraft.trim()) return
    setConnecting(true); setConnectError('')
    try {
      const res  = await fetch(`${BACKEND}/trading212/connect/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId: apiIdDraft.trim(), apiKey: apiKeyDraft.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to connect')
      setConnected(true); setApiIdDraft(''); setApiKeyDraft('')
      loadPortfolio()
    } catch (e: any) {
      setConnectError(e.message ?? 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    await fetch(`${BACKEND}/trading212/disconnect/${userId}`, { method: 'DELETE' })
    setConnected(false); setPositions([]); setCash(null)
  }

  const invested   = positions.reduce((s, p) => s + p.quantity * p.averagePrice, 0)
  const totalValue = positions.reduce((s, p) => s + p.value, 0)
  const totalPpl   = positions.reduce((s, p) => s + p.ppl, 0)
  const totalPct   = invested > 0 ? (totalPpl / invested) * 100 : 0

  const sortedPositions = [...positions].sort((a, b) => b.value - a.value)

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-[var(--text)]">Trading 212</span>
          {connected && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.2)' }}>
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {connected && (
            <>
              <button onClick={loadPortfolio} className="text-[11px] text-[var(--text-3)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer transition-colors">↻ Refresh</button>
              <button onClick={disconnect} className="text-[11px] text-[var(--text-3)] hover:text-[var(--red)] bg-transparent border-none cursor-pointer transition-colors">Disconnect</button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">Checking connection…</div>

      ) : !connected ? (
        <div>
          <p className="text-[12px] text-[var(--text-3)] mb-4 leading-relaxed">
            In Trading 212: <strong className="text-[var(--text-2)]">Settings → API → Generate Key</strong>. Enable <strong className="text-[var(--text-2)]">Account data</strong>, set IP to <strong className="text-[var(--text-2)]">Unrestricted</strong>. For ISA, generate the key from within your ISA tab. Enter both the <strong className="text-[var(--text-2)]">ID</strong> and <strong className="text-[var(--text-2)]">Key</strong> shown after generation.
          </p>
          <div className="flex flex-col gap-2 mb-2">
            <input
              type="text"
              placeholder="API ID (e.g. 38177224ZwxnMTqs…)"
              value={apiIdDraft}
              onChange={e => setApiIdDraft(e.target.value)}
              className="w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none"
            />
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="API Key"
                  value={apiKeyDraft}
                  onChange={e => setApiKeyDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && connect()}
                  className="w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none pr-10"
                />
                <button
                  onClick={() => setShowKey(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-3)] bg-transparent border-none cursor-pointer"
                >{showKey ? 'Hide' : 'Show'}</button>
              </div>
              <button
                onClick={connect}
                disabled={connecting || !apiIdDraft.trim() || !apiKeyDraft.trim()}
                className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer transition-all"
                style={{ background: 'var(--accent)', color: '#fff', opacity: connecting || !apiIdDraft.trim() || !apiKeyDraft.trim() ? 0.6 : 1 }}
              >{connecting ? 'Connecting…' : 'Connect'}</button>
            </div>
          </div>
          {connectError && <div className="text-[12px] text-[#f87171] mt-1">{connectError}</div>}
        </div>

      ) : dataLoading ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">Loading portfolio…</div>

      ) : (
        <>
          {/* Summary cards */}
          {cash && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total value',  value: fmt(totalValue),  color: 'var(--accent)'  },
                { label: 'Invested',     value: fmt(invested),    color: 'var(--blue)'    },
                { label: 'Total P&L',    value: fmt(totalPpl),    color: pplColor(totalPpl)  },
                { label: 'Return',       value: pctFmt(totalPct), color: pplColor(totalPct)  },
              ].map(s => (
                <div key={s.label} className="bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)] mb-1">{s.label}</div>
                  <div className="text-[18px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Positions table */}
          {sortedPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['Stock', 'Qty', 'Avg price', 'Current', 'Value', 'P&L', 'Change'].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)] pb-2 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPositions.map(pos => (
                    <tr key={pos.ticker} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--raised)] transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className="text-[13px] font-semibold text-[var(--text)]">{displayTicker(pos.ticker)}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-[12px] text-[var(--text-2)] tabular-nums">{pos.quantity.toFixed(4)}</td>
                      <td className="py-2.5 pr-4 text-[12px] text-[var(--text-2)] tabular-nums">{fmt(pos.averagePrice)}</td>
                      <td className="py-2.5 pr-4 text-[12px] text-[var(--text-2)] tabular-nums">{fmt(pos.currentPrice)}</td>
                      <td className="py-2.5 pr-4 text-[12px] font-semibold text-[var(--text)] tabular-nums">{fmt(pos.value)}</td>
                      <td className="py-2.5 pr-4 text-[12px] font-semibold tabular-nums" style={{ color: pplColor(pos.ppl) }}>{fmt(pos.ppl)}</td>
                      <td className="py-2.5 text-[12px] font-bold tabular-nums" style={{ color: pplColor(pos.pctChange) }}>{pctFmt(pos.pctChange)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-[13px] text-[var(--text-3)]">No positions found</div>
          )}

          {/* Cash available */}
          {cash && cash.free > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[12px] text-[var(--text-3)]">Cash available</span>
              <span className="text-[13px] font-semibold text-[var(--text)] tabular-nums">{fmt(cash.free)}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Trading212
