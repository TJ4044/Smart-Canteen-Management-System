import { useState, useEffect, useRef } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_FLOW = {
  PENDING:    { next: 'CONFIRMED',  label: 'Accept Order',   color: 'btn-primary' },
  CONFIRMED:  { next: 'PREPARING',  label: 'Start Cooking',  color: 'btn-purple'  },
  PREPARING:  { next: 'READY',      label: 'Mark Ready',     color: 'btn-green'   },
  READY:      { next: 'DELIVERED',  label: 'Delivered ✓',    color: 'btn-green'   },
  DELIVERED:  { next: null,         label: 'Completed',      color: 'btn-outline' },
  CANCELLED:  { next: null,         label: 'Cancelled',      color: 'btn-outline' },
}

const STATUS_BADGE = {
  PENDING:   'badge-orange', CONFIRMED: 'badge-blue',
  PREPARING: 'badge-yellow', READY:     'badge-purple',
  DELIVERED: 'badge-green',  CANCELLED: 'badge-gray',
}

const STATUS_ICON = {
  PENDING:'⏳', CONFIRMED:'✅', PREPARING:'👨‍🍳', READY:'🔔', DELIVERED:'✔️', CANCELLED:'❌'
}

function priorityClass(score) {
  if (score >= 40) return 'priority-high'
  if (score >= 15) return 'priority-med'
  return 'priority-low'
}

function priorityLabel(score) {
  if (score >= 40) return { label: '🔴 HIGH', tip: 'Long prep — cook first' }
  if (score >= 15) return { label: '🟡 MEDIUM', tip: 'Medium prep time' }
  return { label: '🟢 QUICK', tip: 'Quick to prepare' }
}

export default function EmployeeOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter]     = useState('ACTIVE')
  const [countdown, setCountdown] = useState(30)
  const timerRef = useRef(null)
  const toast    = useToast()

  useEffect(() => {
    load()
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { load(); return 30 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  async function load() {
    try {
      const res = await orderAPI.getActive()
      setOrders(res.data)
    } catch { toast('Failed to load orders', 'error') }
    finally { setLoading(false) }
  }

  async function advance(order) {
    const flow = STATUS_FLOW[order.status]
    if (!flow?.next) return
    try {
      setUpdating(order.id)
      await orderAPI.updateStatus(order.id, flow.next)
      toast(`Order #${order.tokenNumber} → ${flow.next}`, 'success')
      load()
    } catch { toast('Update failed', 'error') }
    finally { setUpdating(null) }
  }

  async function cancel(order) {
    if (!window.confirm(`Cancel order #${order.tokenNumber}? Wallet will be refunded.`)) return
    try {
      setUpdating(order.id)
      await orderAPI.cancel(order.id)
      toast(`Order #${order.tokenNumber} cancelled. Wallet refunded.`, 'info')
      load()
    } catch { toast('Cancel failed', 'error') }
    finally { setUpdating(null) }
  }

  const ACTIVE_STATUSES = ['PENDING','CONFIRMED','PREPARING','READY']
  const filtered = filter === 'ACTIVE'
    ? orders.filter(o => ACTIVE_STATUSES.includes(o.status))
    : orders

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🔴 Live Order Queue</div>
          <div className="topbar-sub">
            Sorted by priority — longest prep first · Auto-refresh in {countdown}s
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', gap:6 }}>
            {['ACTIVE','ALL'].map(f => (
              <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`}
                      onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { load(); setCountdown(30) }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="page">
        {/* Priority Legend */}
        <div className="card" style={{ padding:'12px 16px', marginBottom:16 }}>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:'0.8rem' }}>
            <span><span style={{ color:'var(--red)', fontWeight:700 }}>🔴 HIGH PRIORITY</span> — Score ≥ 40 (long prep items first)</span>
            <span><span style={{ color:'var(--yellow)', fontWeight:700 }}>🟡 MEDIUM</span> — Score 15-39</span>
            <span><span style={{ color:'var(--green)', fontWeight:700 }}>🟢 QUICK</span> — Score &lt; 15 (fast items)</span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="icon">⏳</div><p>Loading orders…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎉</div>
            <p style={{ fontWeight:600 }}>No active orders!</p>
            <p>All caught up. Queue is clear.</p>
          </div>
        ) : (
          <div>
            {/* Group by status */}
            {['PENDING','CONFIRMED','PREPARING','READY'].map(status => {
              const group = filtered.filter(o => o.status === status)
              if (group.length === 0) return null
              return (
                <div key={status} style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:'1.1rem' }}>{STATUS_ICON[status]}</span>
                    <span style={{ fontWeight:700, fontSize:'0.95rem' }}>{status}</span>
                    <span className={`badge ${STATUS_BADGE[status]}`}>{group.length} orders</span>
                  </div>
                  {group.map(order => {
                    const pLevel = priorityLabel(order.priorityScore)
                    const flow   = STATUS_FLOW[order.status]
                    return (
                      <div key={order.id}
                           className={`order-card ${priorityClass(order.priorityScore)}`}
                           style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>

                          {/* Left */}
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                              <div className="token-badge" style={{ padding:'6px 14px', borderRadius:8, display:'inline-block' }}>
                                <span style={{ fontSize:'0.7rem', display:'block', opacity:0.85 }}>TOKEN</span>
                                <span style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.3rem' }}>
                                  #{order.tokenNumber}
                                </span>
                              </div>
                              <div>
                                <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{order.userName}</div>
                                <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                                  Slot: {order.timeSlot || '—'} · Ready by: {order.estimatedReadyTime || '—'}
                                </div>
                              </div>
                              <span style={{ marginLeft:'auto', fontSize:'0.75rem', fontWeight:700,
                                background: order.priorityScore>=40?'var(--red-l)':order.priorityScore>=15?'var(--yellow-l)':'var(--green-l)',
                                color: order.priorityScore>=40?'var(--red)':order.priorityScore>=15?'var(--yellow)':'var(--green)',
                                padding:'3px 9px', borderRadius:20 }}>
                                {pLevel.label}
                              </span>
                            </div>

                            {/* Items */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                              {order.items?.map((item, i) => (
                                <span key={i} style={{ background:'var(--bg)', border:'1px solid var(--border)',
                                  borderRadius:6, padding:'3px 10px', fontSize:'0.78rem', fontWeight:500 }}>
                                  {item.foodItemName} ×{item.quantity}
                                  <span style={{ color:'var(--muted)', marginLeft:4 }}>({item.prepTimeMinutes}min)</span>
                                </span>
                              ))}
                            </div>

                            <div style={{ fontSize:'0.78rem', color:'var(--muted)', display:'flex', gap:16 }}>
                              <span>💰 ₹{order.totalAmount?.toFixed(2)}</span>
                              <span>💳 {order.paymentMethod}</span>
                              <span>⚡ Score: {order.priorityScore}</span>
                              {order.notes && <span>📝 {order.notes}</span>}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                            {flow?.next && (
                              <button
                                className={`btn btn-sm ${flow.color}`}
                                disabled={updating === order.id}
                                onClick={() => advance(order)}>
                                {updating === order.id ? '⏳' : flow.label}
                              </button>
                            )}
                            {['PENDING','CONFIRMED'].includes(order.status) && (
                              <button className="btn btn-xs btn-danger"
                                      disabled={updating === order.id}
                                      onClick={() => cancel(order)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
