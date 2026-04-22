import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-orange',
  READY:'badge-green', DELIVERED:'badge-gray', CANCELLED:'badge-red'
}
const STATUS_MSG = {
  PENDING:   '⏳ Waiting for confirmation',
  CONFIRMED: '✅ Confirmed — being prepared soon',
  PREPARING: '👨‍🍳 Being cooked right now!',
  READY:     '🔔 READY FOR PICKUP!',
  DELIVERED: '✔️ Delivered',
  CANCELLED: '❌ Cancelled'
}
const STEPS = ['PENDING','CONFIRMED','PREPARING','READY','DELIVERED']

export default function CustomerOrders() {
  const toast = useToast()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const load = async () => {
    try { const r = await orderAPI.getMyOrders(); setOrders(r.data) }
    catch { toast('Failed to load orders','error') }
    finally { setLoading(false) }
  }

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try { await orderAPI.cancel(id); toast('Order cancelled. Refund processed if paid by wallet.','info'); load() }
    catch { toast('Cancellation failed','error') }
  }

  const displayed = filter==='ALL' ? orders : orders.filter(o=>o.status===filter)

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading orders...</div>

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>My Orders 📦</div>
        <div className="text-muted text-sm">Track your orders in real-time • Auto-refreshes every 30 seconds</div>
      </div>

      <div className="category-chips">
        {['ALL','PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'].map(s=>(
          <button key={s} className={`chip ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>{s}</button>
        ))}
      </div>

      {displayed.length===0
        ? <div className="empty-state card"><div className="icon">📭</div><p>No orders found</p></div>
        : displayed.map(order=>(
          <div key={order.id} className="card" style={{marginBottom:14}}>

            {/* Header */}
            <div className="flex justify-between items-center" style={{marginBottom:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:'0.95rem'}}>Order #{order.id}</div>
                <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
            </div>

            {/* Token + Slot + Ready time row */}
            {(order.tokenNumber || order.timeSlot || order.estimatedReadyTime) && (
              <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
                {order.tokenNumber && (
                  <div style={{background:'linear-gradient(135deg,var(--primary),#fb923c)',
                    color:'#fff',borderRadius:10,padding:'8px 16px',textAlign:'center',minWidth:80}}>
                    <div style={{fontSize:'0.62rem',opacity:0.85,letterSpacing:'0.05em'}}>YOUR TOKEN</div>
                    <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.6rem',lineHeight:1}}>
                      #{order.tokenNumber}
                    </div>
                  </div>
                )}
                {order.timeSlot && (
                  <div style={{background:'var(--blue-l)',color:'var(--blue)',borderRadius:10,padding:'8px 14px'}}>
                    <div style={{fontSize:'0.62rem',fontWeight:600}}>TIME SLOT</div>
                    <div style={{fontWeight:700,fontSize:'1.1rem'}}>{order.timeSlot}</div>
                  </div>
                )}
                {order.estimatedReadyTime && (
                  <div style={{background:'var(--green-l)',color:'#15803d',borderRadius:10,padding:'8px 14px'}}>
                    <div style={{fontSize:'0.62rem',fontWeight:600}}>EST. READY</div>
                    <div style={{fontWeight:700,fontSize:'1.1rem'}}>{order.estimatedReadyTime}</div>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar — only for active orders */}
            {!['DELIVERED','CANCELLED'].includes(order.status) && (
              <div style={{marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:0}}>
                  {STEPS.map((step,idx)=>{
                    const stepIdx   = STEPS.indexOf(order.status)
                    const done      = idx <= stepIdx
                    const current   = idx === stepIdx
                    return (
                      <div key={step} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center',width:'100%'}}>
                          {idx>0 && <div style={{flex:1,height:3,background:done?'var(--primary)':'var(--border)',transition:'background 0.3s'}}/>}
                          <div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,
                            background:current?'var(--primary)':done?'var(--green)':'var(--border)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:'0.6rem',color:'#fff',fontWeight:700,
                            boxShadow:current?'0 0 0 4px rgba(249,115,22,0.2)':'none',
                            transition:'all 0.3s'}}>
                            {done && !current ? '✓' : idx+1}
                          </div>
                          {idx<STEPS.length-1 && <div style={{flex:1,height:3,background:idx<stepIdx?'var(--green)':'var(--border)',transition:'background 0.3s'}}/>}
                        </div>
                        <div style={{fontSize:'0.58rem',color:current?'var(--primary)':done?'var(--green)':'var(--muted)',
                          fontWeight:current?700:400,marginTop:4,textAlign:'center'}}>
                          {step}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Status message */}
            <div className={`alert ${order.status==='READY'?'alert-success':order.status==='CANCELLED'?'alert-error':'alert-info'}`}
              style={{marginBottom:12,padding:'8px 12px'}}>
              {STATUS_MSG[order.status]}
            </div>

            {/* Items */}
            <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:10}}>
              {order.items?.map(i=>(
                <div key={i.foodItemId} className="flex justify-between" style={{fontSize:'0.85rem',marginBottom:4}}>
                  <span>{i.foodItemName} × {i.quantity}</span>
                  <span className="font-bold">₹{i.subtotal?.toFixed(2)}</span>
                </div>
              ))}
              <div style={{borderTop:'1px solid var(--border)',marginTop:6,paddingTop:6,
                display:'flex',justifyContent:'space-between',fontWeight:700}}>
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {order.notes && <div style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:8}}>📝 {order.notes}</div>}

            <div className="flex justify-between items-center">
              <span style={{fontSize:'0.75rem',background:'var(--bg)',padding:'3px 10px',borderRadius:6,color:'var(--muted)'}}>
                💳 {order.paymentMethod}
              </span>
              {order.status==='PENDING' && (
                <button className="btn btn-danger btn-sm" onClick={()=>cancel(order.id)}>🚫 Cancel Order</button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  )
}
