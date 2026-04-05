import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green', DELIVERED:'badge-gray', CANCELLED:'badge-red'
}
const STATUS_MSG = {
  PENDING:'⏳ Waiting for confirmation',
  CONFIRMED:'✅ Confirmed — being prepared',
  PREPARING:'👨‍🍳 Being cooked right now',
  READY:'🔔 Ready for pickup!',
  DELIVERED:'✔️ Delivered',
  CANCELLED:'❌ Cancelled'
}

export default function CustomerOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    try { const r = await orderAPI.getMyOrders(); setOrders(r.data) }
    catch { toast('Failed to load orders', 'error') }
    finally { setLoading(false) }
  }

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try { await orderAPI.cancel(id); toast('Order cancelled. Refund processed if paid by wallet.', 'info'); load() }
    catch { toast('Cancellation failed', 'error') }
  }

  const displayed = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading orders...</div>

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>My Orders 📦</div>
        <div className="text-muted text-sm">Track all your past and current orders</div>
      </div>

      {/* Filter */}
      <div className="category-chips">
        {['ALL','PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'].map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {displayed.length === 0
        ? <div className="empty-state card"><div className="icon">📭</div><p>No orders found</p></div>
        : displayed.map(order => (
          <div key={order.id} className="card" style={{ marginBottom:14 }}>
            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem' }}>Order #{order.id}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
            </div>

            {/* Status message */}
            <div className="alert alert-info" style={{ marginBottom:12, padding:'8px 12px' }}>
              {STATUS_MSG[order.status]}
            </div>

            {/* Items */}
            <div style={{ background:'var(--bg)', borderRadius:8, padding:'12px 14px', marginBottom:12 }}>
              {order.items?.map(i => (
                <div key={i.foodItemId} className="flex justify-between" style={{ fontSize:'0.85rem', marginBottom:6 }}>
                  <span>{i.foodItemName} × {i.quantity}</span>
                  <span className="font-bold">₹{i.subtotal?.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {order.notes && (
              <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginBottom:10 }}>📝 Note: {order.notes}</div>
            )}

            <div className="flex justify-between items-center">
              <span style={{ fontSize:'0.78rem', background:'var(--bg)', padding:'4px 10px', borderRadius:6, color:'var(--muted)' }}>
                💳 {order.paymentMethod}
              </span>
              {order.status === 'PENDING' && (
                <button className="btn btn-danger btn-sm" onClick={() => cancel(order.id)}>🚫 Cancel Order</button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  )
}
