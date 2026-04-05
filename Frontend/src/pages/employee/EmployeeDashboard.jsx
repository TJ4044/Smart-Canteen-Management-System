import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green', DELIVERED:'badge-gray', CANCELLED:'badge-red'
}
const NEXT = { PENDING:'CONFIRMED', CONFIRMED:'PREPARING', PREPARING:'READY', READY:'DELIVERED' }
const NEXT_LABEL = { PENDING:'✅ Accept', CONFIRMED:'👨‍🍳 Start Cooking', PREPARING:'🔔 Ready!', READY:'✔️ Delivered' }

export default function EmployeeDashboard() {
  const toast = useToast()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('active')

  useEffect(() => { load() }, [])
  useEffect(() => {
    // auto-refresh every 30s
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const load = async () => {
    try {
      const r = tab === 'active' ? await orderAPI.getActive() : await orderAPI.getAll()
      setOrders(r.data)
    } catch { toast('Failed to refresh orders', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); load() }, [tab])

  const update = async (id, status) => {
    try { await orderAPI.updateStatus(id, status); toast(`Order #${id} updated to ${status}`, 'success'); load() }
    catch { toast('Update failed', 'error') }
  }

  const counts = { pending: orders.filter(o => o.status === 'PENDING').length,
                   preparing: orders.filter(o => o.status === 'PREPARING').length,
                   ready: orders.filter(o => o.status === 'READY').length }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>Employee Dashboard 👨‍🍳</div>
        <div className="text-muted text-sm">Manage incoming orders and update preparation status</div>
      </div>

      {/* Quick stats */}
      <div className="stat-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{color:'var(--yellow)'}}>{counts.pending}</div>
          <div className="stat-sub">Awaiting confirmation</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Preparing</div>
          <div className="stat-value" style={{color:'var(--primary)'}}>{counts.preparing}</div>
          <div className="stat-sub">In the kitchen</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Ready</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{counts.ready}</div>
          <div className="stat-sub">Ready for pickup</div>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="tabs" style={{ maxWidth:320, marginBottom:20 }}>
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>🔴 Active Orders</button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>📋 All Orders</button>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span className="text-muted text-sm">{orders.length} order(s)</span>
        <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {loading
        ? <div className="flex-center" style={{height:200}}>⏳ Loading...</div>
        : orders.length === 0
          ? <div className="empty-state card"><div className="icon">🎉</div><p>No active orders right now!</p></div>
          : orders.map(order => (
            <div key={order.id} className="order-card" style={{ borderLeft:`4px solid var(--${order.status === 'PENDING' ? 'yellow' : order.status === 'PREPARING' ? 'primary' : order.status === 'READY' ? 'green' : 'muted'})` }}>
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order.id} — {order.userName}</div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
              </div>

              {/* Items detail */}
              <div style={{ background:'var(--bg)', borderRadius:8, padding:'10px 14px', marginBottom:12 }}>
                {order.items?.map(i => (
                  <div key={i.foodItemId} className="flex justify-between" style={{ fontSize:'0.85rem', marginBottom:4 }}>
                    <span style={{ fontWeight:500 }}>{i.foodItemName} × {i.quantity}</span>
                    <span className="text-primary font-bold">₹{i.subtotal}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {order.notes && (
                <div style={{ fontSize:'0.78rem', background:'var(--yellow-l)', color:'#92400e', padding:'6px 10px', borderRadius:6, marginBottom:10 }}>
                  📝 {order.notes}
                </div>
              )}

              <div className="order-footer">
                <span className="text-muted text-sm">via {order.paymentMethod}</span>
                <div className="flex gap-2">
                  {NEXT[order.status] && (
                    <button className="btn btn-green btn-sm" onClick={() => update(order.id, NEXT[order.status])}>
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {!['DELIVERED','CANCELLED'].includes(order.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => update(order.id, 'CANCELLED')}>🚫 Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))
      }
    </div>
  )
}
