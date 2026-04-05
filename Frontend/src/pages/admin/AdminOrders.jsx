import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_FLOW = ['PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED']

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green',    DELIVERED:'badge-gray', CANCELLED:'badge-red'
}

const NEXT_ACTION = {
  PENDING:'CONFIRMED', CONFIRMED:'PREPARING', PREPARING:'READY', READY:'DELIVERED'
}
const NEXT_LABEL = {
  PENDING:'✅ Confirm', CONFIRMED:'👨‍🍳 Start Preparing', PREPARING:'🔔 Mark Ready', READY:'✔️ Delivered'
}

export default function AdminOrders() {
  const toast = useToast()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    try { const r = await orderAPI.getAll(); setOrders(r.data) }
    catch { toast('Failed to load orders', 'error') }
    finally { setLoading(false) }
  }

  const update = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status)
      toast(`Order #${id} → ${status}`, 'success')
      load()
    } catch { toast('Update failed', 'error') }
  }

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try { await orderAPI.cancel(id); toast('Order cancelled', 'info'); load() }
    catch { toast('Cancel failed', 'error') }
  }

  const displayed = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const counts = STATUS_FLOW.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc }, {})

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading orders...</div>

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>All Orders 📋</div>
        <div className="text-muted text-sm">Monitor and update order statuses in real-time</div>
      </div>

      {/* Status Quick Counts */}
      <div className="stat-grid" style={{ marginBottom:20 }}>
        {['PENDING','CONFIRMED','PREPARING','READY','DELIVERED'].map(s => (
          <div key={s} className="stat-card" style={{ padding:'14px 16px', cursor:'pointer' }} onClick={() => setFilter(s === filter ? 'ALL' : s)}>
            <div className="stat-label">{s}</div>
            <div className="stat-value" style={{ fontSize:'1.6rem' }}>{counts[s] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="category-chips">
        {['ALL', ...STATUS_FLOW].map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s} {s !== 'ALL' && counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {/* Orders */}
      {displayed.length === 0
        ? <div className="empty-state card"><div className="icon">📭</div><p>No orders found</p></div>
        : displayed.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-id">Order #{order.id}</div>
                <div className="order-date">
                  👤 {order.userName} &nbsp;•&nbsp;
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
            </div>

            <div className="order-items-list">
              {order.items?.map(i => (
                <span key={i.foodItemId} style={{ marginRight:12 }}>
                  {i.foodItemName} × {i.quantity} (₹{i.subtotal})
                </span>
              ))}
            </div>

            {order.notes && (
              <div style={{ fontSize:'0.78rem', background:'var(--yellow-l)', color:'#92400e', padding:'6px 10px', borderRadius:6, marginBottom:10 }}>
                📝 Note: {order.notes}
              </div>
            )}

            <div className="order-footer">
              <div>
                <span className="order-total">₹{order.totalAmount?.toFixed(2)}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--muted)', marginLeft:8 }}>
                  via {order.paymentMethod}
                </span>
              </div>
              <div className="flex gap-2">
                {NEXT_ACTION[order.status] && (
                  <button className="btn btn-green btn-sm" onClick={() => update(order.id, NEXT_ACTION[order.status])}>
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
                {!['DELIVERED','CANCELLED'].includes(order.status) && (
                  <button className="btn btn-outline btn-sm" onClick={() => cancel(order.id)}>🚫 Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}
