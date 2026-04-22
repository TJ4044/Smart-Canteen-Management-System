import { useState, useEffect } from 'react'
import { walletAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const PRESETS = [50, 100, 200, 500]

export default function CustomerWallet() {
  const { user, updateWallet } = useAuth()
  const toast = useToast()

  const [balance,  setBalance]  = useState(user?.walletBalance || 0)
  const [txns,     setTxns]     = useState([])
  const [amount,   setAmount]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [recharging, setRecharging] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [b, t] = await Promise.all([walletAPI.getBalance(), walletAPI.getTransactions()])
      setBalance(b.data.walletBalance)
      setTxns(t.data)
      updateWallet(b.data.walletBalance)
    } catch { toast('Failed to load wallet','error') }
    finally { setLoading(false) }
  }

  const handleRecharge = async (amt) => {
    const val = parseFloat(amt || amount)
    if (!val || val <= 0) { toast('Enter a valid amount','error'); return }
    if (val > 10000) { toast('Max recharge is ₹10,000','error'); return }
    setRecharging(true)
    try {
      const r = await walletAPI.recharge(val)
      setBalance(r.data.walletBalance)
      updateWallet(r.data.walletBalance)
      toast(`✅ ₹${val} added to wallet!`, 'success')
      setAmount('')
      await load()
    } catch(e) { toast(e.response?.data?.error || 'Recharge failed','error') }
    finally { setRecharging(false) }
  }

  const txnColor = (type) => {
    if (type === 'RECHARGE') return { color:'#15803d', bg:'var(--green-l)', prefix:'+' }
    if (type === 'REFUND')   return { color:'#1d4ed8', bg:'var(--blue-l)',  prefix:'+' }
    return { color:'#b91c1c', bg:'var(--red-l)', prefix:'-' }
  }

  const txnIcon = { RECHARGE:'💰', PAYMENT:'🛒', REFUND:'↩️' }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading wallet...</div>

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>My Wallet 💰</div>
        <div className="text-muted text-sm">Manage your canteen wallet balance</div>
      </div>

      {/* Wallet card */}
      <div className="wallet-card" style={{marginBottom:24}}>
        <div style={{fontSize:'0.78rem',opacity:0.8,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>
          Available Balance
        </div>
        <div className="wallet-amount">₹{balance?.toFixed(2)}</div>
        <div style={{opacity:0.8,fontSize:'0.82rem',marginTop:8}}>
          {user?.name} • Smart Canteen Wallet
        </div>
      </div>

      {/* Recharge section */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">⚡ Quick Recharge</div>

        {/* Preset amounts */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
          {PRESETS.map(p=>(
            <button key={p} className="preset-btn" onClick={()=>handleRecharge(p)} disabled={recharging}>
              + ₹{p}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}>
            <label>Custom Amount (₹)</label>
            <input type="number" placeholder="Enter amount e.g. 150"
              value={amount} onChange={e=>setAmount(e.target.value)}
              min={1} max={10000}
              onKeyDown={e=>e.key==='Enter' && handleRecharge()}/>
          </div>
          <button className="btn btn-primary" style={{paddingTop:10,paddingBottom:10}}
            onClick={()=>handleRecharge()} disabled={recharging || !amount}>
            {recharging ? '⏳' : '+ Add Money'}
          </button>
        </div>

        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginTop:10}}>
          ℹ️ This is a demo app. No real money is involved. Wallet is used for canteen payments.
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="card-title">📜 Transaction History ({txns.length})</div>

        {txns.length === 0
          ? <div className="empty-state"><div className="icon">📭</div><p>No transactions yet</p></div>
          : txns.map(txn=>{
            const style = txnColor(txn.type)
            return (
              <div key={txn.id} style={{display:'flex',alignItems:'center',gap:12,
                padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:38,height:38,borderRadius:10,background:style.bg,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'1.1rem',flexShrink:0}}>
                  {txnIcon[txn.type]||'💳'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'0.87rem'}}>{txn.description}</div>
                  <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>
                    {new Date(txn.createdAt).toLocaleString('en-IN')} • {txn.type}
                  </div>
                </div>
                <div style={{fontWeight:700,fontSize:'1rem',color:style.color}}>
                  {style.prefix}₹{Math.abs(txn.amount)?.toFixed(2)}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
