import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = { PENDING:'badge-yellow',CONFIRMED:'badge-blue',PREPARING:'badge-orange',READY:'badge-green',DELIVERED:'badge-gray',CANCELLED:'badge-red' }
const NEXT = { PENDING:'CONFIRMED',CONFIRMED:'PREPARING',PREPARING:'READY',READY:'DELIVERED' }
const NEXT_LABEL = { PENDING:'✅ Confirm',CONFIRMED:'👨‍🍳 Start',PREPARING:'🔔 Ready',READY:'✔️ Delivered' }

export default function AdminOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => { load() }, [])
  const load = async () => {
    try { const r = await orderAPI.getAll(); setOrders(r.data) }
    catch { toast('Failed to load','error') }
    finally { setLoading(false) }
  }

  const update = async (id, status) => {
    try { await orderAPI.updateStatus(id,status); toast(`Order #${id} → ${status}`,'success'); load() }
    catch { toast('Failed','error') }
  }

  const displayed = filter==='ALL' ? orders : orders.filter(o=>o.status===filter)
  const counts = ['PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED']
    .reduce((a,s)=>({...a,[s]:orders.filter(o=>o.status===s).length}),{})

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>All Orders 📋</div>
        <div className="text-muted text-sm">Monitor and manage all orders with token numbers</div>
      </div>
      <div className="stat-grid" style={{marginBottom:16}}>
        {['PENDING','CONFIRMED','PREPARING','READY'].map(s=>(
          <div key={s} className="stat-card" style={{padding:'12px 14px',cursor:'pointer'}} onClick={()=>setFilter(s===filter?'ALL':s)}>
            <div className="stat-label">{s}</div>
            <div className="stat-value" style={{fontSize:'1.6rem'}}>{counts[s]||0}</div>
          </div>
        ))}
      </div>
      <div className="category-chips">
        {['ALL','PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'].map(s=>(
          <button key={s} className={`chip ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>
            {s}{s!=='ALL'&&counts[s]>0?` (${counts[s]})`:''}
          </button>
        ))}
      </div>
      {displayed.map(order=>(
        <div key={order.id} className="order-card">
          <div className="flex justify-between items-center" style={{marginBottom:10}}>
            <div>
              <div className="flex items-center gap-2">
                {order.tokenNumber && (
                  <div style={{background:'var(--primary)',color:'#fff',borderRadius:20,padding:'2px 10px',fontWeight:800,fontSize:'0.85rem'}}>
                    🎫 #{order.tokenNumber}
                  </div>
                )}
                <span style={{fontWeight:700}}>Order #{order.id}</span>
                <span className="text-muted text-sm">— {order.userName}</span>
              </div>
              <div style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:2}}>
                {order.timeSlot && `⏰ Slot: ${order.timeSlot}`}
                {order.estimatedReadyTime && ` | Ready ~${order.estimatedReadyTime}`}
                {' | '}{new Date(order.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
            <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
          </div>
          <div style={{fontSize:'0.82rem',color:'var(--muted)',marginBottom:8}}>
            {order.items?.map(i=>`${i.foodItemName} ×${i.quantity} (${i.prepTimeMinutes}min)`).join(' • ')}
          </div>
          {order.notes && <div className="alert alert-warning" style={{padding:'6px 10px',marginBottom:8,fontSize:'0.78rem'}}>📝 {order.notes}</div>}
          <div className="flex justify-between items-center">
            <span className="text-primary font-bold">₹{order.totalAmount?.toFixed(2)} via {order.paymentMethod}</span>
            <div className="flex gap-2">
              {NEXT[order.status] && (
                <button className="btn btn-green btn-sm" onClick={()=>update(order.id,NEXT[order.status])}>
                  {NEXT_LABEL[order.status]}
                </button>
              )}
              {!['DELIVERED','CANCELLED'].includes(order.status) && (
                <button className="btn btn-outline btn-sm" onClick={()=>update(order.id,'CANCELLED')}>🚫 Cancel</button>
              )}
            </div>
          </div>
        </div>
      ))}
      {displayed.length===0 && <div className="empty-state card"><div className="icon">📭</div><p>No orders found</p></div>}
    </div>
  )
}
