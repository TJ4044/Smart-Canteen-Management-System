import { useState, useEffect } from 'react'
import { orderAPI, walletAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green', DELIVERED:'badge-gray', CANCELLED:'badge-red'
}
const STATUS_MSG = {
  PENDING:   '⏳ Order received — waiting for canteen staff to confirm',
  CONFIRMED: '✅ Confirmed! Your food will be prepared soon',
  PREPARING: '👨‍🍳 Being cooked right now in the kitchen',
  READY:     '🔔 YOUR ORDER IS READY! Come collect it now!',
  DELIVERED: '✔️ Delivered. Enjoy your meal!',
  CANCELLED: '❌ Order was cancelled'
}

export default function CustomerDashboard({ navigate }) {
  const { user, updateWallet } = useAuth()
  const toast = useToast()
  const [orders,  setOrders]  = useState([])
  const [wallet,  setWallet]  = useState(user?.walletBalance || 0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([orderAPI.getMyOrders(), walletAPI.getBalance()])
      .then(([o, w]) => {
        setOrders(o.data)
        setWallet(w.data.walletBalance)
        updateWallet(w.data.walletBalance)
      })
      .catch(() => toast('Failed to load dashboard','error'))
      .finally(() => setLoading(false))

    // Auto-refresh every 30s for live status
    const id = setInterval(async () => {
      try { const r = await orderAPI.getMyOrders(); setOrders(r.data) } catch {}
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await orderAPI.cancel(id)
      toast('Order cancelled. Wallet refunded if paid online.','info')
      const [o, w] = await Promise.all([orderAPI.getMyOrders(), walletAPI.getBalance()])
      setOrders(o.data); setWallet(w.data.walletBalance); updateWallet(w.data.walletBalance)
    } catch { toast('Cancel failed','error') }
  }

  const active    = orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status))
  const delivered = orders.filter(o => o.status === 'DELIVERED').length
  const totalSpent = orders.filter(o => o.status !== 'CANCELLED').reduce((s,o) => s + o.totalAmount, 0)
  const readyOrders = active.filter(o => o.status === 'READY')

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>
          Welcome, {user?.name?.split(' ')[0]}! 👋
        </div>
        <div className="text-muted text-sm">Your canteen dashboard</div>
      </div>

      {/* 🔔 READY ALERT — most prominent element */}
      {readyOrders.map(order => (
        <div key={order.id} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',
          borderRadius:12,padding:20,marginBottom:20,color:'#fff',
          animation:'pulse 2s infinite',boxShadow:'0 0 20px rgba(34,197,94,0.4)'}}>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.85}}`}</style>
          <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.3rem',marginBottom:6}}>
            🔔 YOUR ORDER IS READY FOR PICKUP!
          </div>
          <div style={{fontSize:'0.9rem',opacity:0.95,marginBottom:12}}>
            {order.items?.map(i=>i.foodItemName).join(', ')}
          </div>
          {order.tokenNumber && (
            <div style={{background:'rgba(255,255,255,0.25)',borderRadius:10,padding:'10px 16px',display:'inline-block'}}>
              <div style={{fontSize:'0.75rem',opacity:0.85}}>YOUR TOKEN NUMBER</div>
              <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'2.5rem',lineHeight:1}}>
                #{order.tokenNumber}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Wallet banner */}
      <div className="wallet-card" style={{marginBottom:20}}>
        <div style={{fontSize:'0.78rem',opacity:0.85,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>
          💰 Wallet Balance
        </div>
        <div className="wallet-amount">₹{wallet?.toFixed(2)}</div>
        <div style={{opacity:0.8,fontSize:'0.82rem',marginTop:6}}>
          Total spent: ₹{totalSpent.toFixed(2)}
        </div>
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

      {/* Active orders with token display */}
      {active.length > 0 && (
        <div className="card">
          <div className="card-title">🔴 Live Orders</div>
          {active.map(order => (
            <div key={order.id} style={{background:'var(--bg)',borderRadius:10,
              padding:'14px 16px',marginBottom:12,border:'1px solid var(--border)'}}>
              <div className="flex justify-between items-center" style={{marginBottom:10}}>
                <div>
                  <div style={{fontWeight:700}}>Order #{order.id}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
              </div>

              {/* Token + Time info */}
              {(order.tokenNumber || order.timeSlot || order.estimatedReadyTime) && (
                <div style={{display:'flex',gap:10,marginBottom:10,flexWrap:'wrap'}}>
                  {order.tokenNumber && (
                    <div style={{background:'var(--primary)',color:'#fff',borderRadius:10,
                      padding:'8px 16px',textAlign:'center',minWidth:80}}>
                      <div style={{fontSize:'0.65rem',opacity:0.85}}>TOKEN</div>
                      <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.4rem',lineHeight:1}}>
                        #{order.tokenNumber}
                      </div>
                    </div>
                  )}
                  {order.timeSlot && (
                    <div style={{background:'var(--blue-l)',color:'var(--blue)',borderRadius:10,
                      padding:'8px 14px',textAlign:'center'}}>
                      <div style={{fontSize:'0.65rem',fontWeight:600}}>TIME SLOT</div>
                      <div style={{fontWeight:700,fontSize:'1.1rem'}}>{order.timeSlot}</div>
                    </div>
                  )}
                  {order.estimatedReadyTime && (
                    <div style={{background:'var(--green-l)',color:'#15803d',borderRadius:10,
                      padding:'8px 14px',textAlign:'center'}}>
                      <div style={{fontSize:'0.65rem',fontWeight:600}}>READY BY ~</div>
                      <div style={{fontWeight:700,fontSize:'1.1rem'}}>{order.estimatedReadyTime}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Status message */}
              <div style={{fontSize:'0.83rem',color:'var(--muted)',marginBottom:10,
                background:order.status==='READY'?'var(--green-l)':'transparent',
                padding:order.status==='READY'?'8px 10px':'0',borderRadius:8,
                color:order.status==='READY'?'#15803d':'var(--muted)',fontWeight:order.status==='READY'?700:'normal'}}>
                {STATUS_MSG[order.status]}
              </div>

              <div style={{fontSize:'0.82rem',marginBottom:8}}>
                {order.items?.map(i=>`${i.foodItemName} ×${i.quantity}`).join(' • ')}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-primary font-bold">₹{order.totalAmount?.toFixed(2)}</span>
                {order.status === 'PENDING' && (
                  <button className="btn btn-danger btn-xs" onClick={()=>cancelOrder(order.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div className="card-title flex justify-between items-center">
          <span>📦 Recent Orders</span>
          <button className="btn btn-outline btn-sm" onClick={()=>navigate('orders')}>View All</button>
        </div>
        {orders.length === 0
          ? <div className="empty-state"><div className="icon">🛒</div>
              <p>No orders yet.</p>
              <button className="btn btn-primary btn-sm" style={{marginTop:12}} onClick={()=>navigate('menu')}>
                Order Now
              </button>
            </div>
          : orders.slice(0,4).map(order => (
            <div key={order.id} style={{display:'flex',justifyContent:'space-between',
              alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontWeight:600,fontSize:'0.85rem'}}>
                  Order #{order.id}
                  {order.tokenNumber && <span style={{marginLeft:6,fontSize:'0.72rem',color:'var(--primary)'}}>🎫#{order.tokenNumber}</span>}
                </div>
                <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>
                  {order.items?.map(i=>i.foodItemName).join(', ').slice(0,40)}...
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div><span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span></div>
                <div style={{fontSize:'0.75rem',color:'var(--primary)',fontWeight:700,marginTop:4}}>
                  ₹{order.totalAmount?.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
