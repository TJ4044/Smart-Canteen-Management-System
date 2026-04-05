import { useState, useEffect } from 'react'
import { orderAPI, walletAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green', DELIVERED:'badge-gray', CANCELLED:'badge-red'
}
const STATUS_MSG = {
  PENDING:'⏳ Order received, waiting for confirmation',
  CONFIRMED:'✅ Order confirmed! Being prepared soon',
  PREPARING:'👨‍🍳 Your food is being prepared',
  READY:'🔔 Your order is ready for pickup!',
  DELIVERED:'✔️ Delivered. Enjoy your meal!',
  CANCELLED:'❌ Order was cancelled'
}

export default function CustomerDashboard() {
  const { user, updateWallet } = useAuth()
  const toast = useToast()
  const [orders, setOrders]   = useState([])
  const [wallet, setWallet]   = useState(user?.walletBalance || 0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([orderAPI.getMyOrders(), walletAPI.getBalance()])
      .then(([o, w]) => { setOrders(o.data); setWallet(w.data.walletBalance); updateWallet(w.data.walletBalance) })
      .catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await orderAPI.cancel(id)
      toast('Order cancelled. Wallet refunded if paid online.', 'info')
      const [o, w] = await Promise.all([orderAPI.getMyOrders(), walletAPI.getBalance()])
      setOrders(o.data); setWallet(w.data.walletBalance); updateWallet(w.data.walletBalance)
    } catch { toast('Cancel failed', 'error') }
  }

  const recent = orders.slice(0, 5)
  const active = orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status))
  const delivered = orders.filter(o => o.status === 'DELIVERED').length
  const totalSpent = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0)

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>
          Welcome, {user?.name?.split(' ')[0]}! 👋
        </div>
        <div className="text-muted text-sm">Your canteen activity at a glance</div>
      </div>

      {/* Wallet Banner */}
      <div className="wallet-card" style={{ marginBottom:20 }}>
        <div className="wallet-label">💰 Wallet Balance</div>
        <div className="wallet-amount">₹{wallet?.toFixed(2)}</div>
        <div style={{ opacity:0.8, fontSize:'0.82rem', marginTop:6 }}>Total spent: ₹{totalSpent.toFixed(2)}</div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Delivered</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{delivered}</div>
          <div className="stat-sub">Completed</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{active.length}</div>
          <div className="stat-sub">In progress</div>
        </div>
      </div>

      {/* Active Orders */}
      {active.length > 0 && (
        <div className="card">
          <div className="card-title">🔴 Live Orders</div>
          {active.map(order => (
            <div key={order.id} style={{ background:'var(--bg)', borderRadius:10, padding:'14px 16px', marginBottom:12, border:'1px solid var(--border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom:8 }}>
                <div style={{ fontWeight:700 }}>Order #{order.id}</div>
                <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:8 }}>
                {STATUS_MSG[order.status]}
              </div>
              <div style={{ fontSize:'0.82rem', marginBottom:10 }}>
                {order.items?.map(i => `${i.foodItemName} ×${i.quantity}`).join(', ')}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold">₹{order.totalAmount?.toFixed(2)}</span>
                {order.status === 'PENDING' && (
                  <button className="btn btn-danger btn-xs" onClick={() => cancelOrder(order.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <div className="card-title">📦 Recent Orders</div>
        {recent.length === 0
          ? <div className="empty-state"><div className="icon">🛒</div><p>No orders yet. Go order something!</p></div>
          : recent.map(order => (
            <div key={order.id} className="order-card" style={{ marginBottom:10 }}>
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
              </div>
              <div className="order-items-list">
                {order.items?.map(i => `${i.foodItemName} ×${i.quantity}`).join(' • ')}
              </div>
              <div className="order-footer">
                <span className="order-total">₹{order.totalAmount?.toFixed(2)}</span>
                <span className="text-muted text-sm">via {order.paymentMethod}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
