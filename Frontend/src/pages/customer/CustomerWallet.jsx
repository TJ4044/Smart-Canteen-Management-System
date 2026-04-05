import { useState, useEffect } from 'react'
import { walletAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const PRESETS = [50, 100, 200, 500, 1000]

export default function CustomerWallet() {
  const { updateWallet } = useAuth()
  const toast = useToast()
  const [balance, setBalance]       = useState(0)
  const [txns, setTxns]             = useState([])
  const [amount, setAmount]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [recharging, setRecharging] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [b, t] = await Promise.all([walletAPI.getBalance(), walletAPI.getTransactions()])
      setBalance(b.data.walletBalance); setTxns(t.data)
    } catch { toast('Failed to load wallet', 'error') }
    finally { setLoading(false) }
  }

  const recharge = async (amt) => {
    const value = parseFloat(amt)
    if (!value || value <= 0) { toast('Enter a valid amount', 'error'); return }
    setRecharging(true)
    try {
      const r = await walletAPI.recharge(value)
      setBalance(r.data.walletBalance)
      updateWallet(r.data.walletBalance)
      toast(`₹${value} added to wallet!`, 'success')
      setAmount('')
      load()
    } catch (e) { toast(e.response?.data?.error || 'Recharge failed', 'error') }
    finally { setRecharging(false) }
  }

  const TXN_COLOR = { RECHARGE:'var(--green)', PAYMENT:'var(--red)', REFUND:'var(--blue)' }
  const TXN_ICON  = { RECHARGE:'⬆️', PAYMENT:'⬇️', REFUND:'↩️' }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading wallet...</div>

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>My Wallet 💰</div>
        <div className="text-muted text-sm">Manage your canteen wallet balance</div>
      </div>

      <div className="grid-2">
        {/* Left — Balance + Recharge */}
        <div>
          <div className="wallet-card">
            <div className="wallet-label">💰 Available Balance</div>
            <div className="wallet-amount">₹{balance?.toFixed(2)}</div>
            <div style={{ opacity:0.8, fontSize:'0.82rem', marginTop:6 }}>
              Use wallet for instant checkout
            </div>
          </div>

          <div className="card">
            <div className="card-title">➕ Recharge Wallet</div>

            <div className="form-group">
              <label>Quick Add</label>
              <div className="recharge-presets">
                {PRESETS.map(p => (
                  <button key={p} className="preset-btn" onClick={() => recharge(p)} disabled={recharging}>
                    +₹{p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Custom Amount (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  min={1}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && recharge(amount)}
                />
                <button className="btn btn-primary" onClick={() => recharge(amount)} disabled={recharging}>
                  {recharging ? '⏳' : 'Add'}
                </button>
              </div>
            </div>

            <div className="alert alert-info">
              💡 Wallet payments are instant and no change required at the counter.
            </div>
          </div>
        </div>

        {/* Right — Transactions */}
        <div className="card" style={{ height:'fit-content' }}>
          <div className="card-title">📜 Transaction History</div>
          {txns.length === 0
            ? <div className="empty-state"><div className="icon">📄</div><p>No transactions yet</p></div>
            : txns.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{
                  width:38, height:38, borderRadius:10,
                  background: t.type === 'RECHARGE' ? 'var(--green-l)' : t.type === 'PAYMENT' ? 'var(--red-l)' : 'var(--blue-l)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0
                }}>
                  {TXN_ICON[t.type]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{t.description}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>
                    {new Date(t.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight:700, color: TXN_COLOR[t.type], fontSize:'0.95rem' }}>
                  {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
