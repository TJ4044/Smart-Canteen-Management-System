import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = { PENDING:'badge-yellow',CONFIRMED:'badge-blue',PREPARING:'badge-orange',READY:'badge-green',DELIVERED:'badge-gray',CANCELLED:'badge-red' }
const NEXT = { PENDING:'CONFIRMED',CONFIRMED:'PREPARING',PREPARING:'READY',READY:'DELIVERED' }
const NEXT_LABEL = { PENDING:'✅ Accept',CONFIRMED:'👨‍🍳 Start Cooking',PREPARING:'🔔 Mark Ready',READY:'✔️ Delivered' }

function getPriorityInfo(score) {
  if (score >= 30) return { label:'🔴 HIGH',  cls:'priority-high', color:'var(--red)'    }
  if (score >= 15) return { label:'🟡 MED',   cls:'priority-med',  color:'var(--yellow)' }
  return                  { label:'🟢 LOW',   cls:'priority-low',  color:'var(--green)'  }
}

export default function EmployeeDashboard() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = async () => {
    try {
      const r = tab==='active' ? await orderAPI.getActive() : await orderAPI.getAll()
      setOrders(r.data); setLastRefresh(new Date())
    } catch { toast('Failed to refresh','error') }
    finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); load() }, [tab])
  useEffect(() => {
    // Auto-refresh every 30 seconds
    const id = setInterval(() => load(), 30000)
    return () => clearInterval(id)
  }, [tab])

  const update = async (id, status) => {
    try { await orderAPI.updateStatus(id,status); toast(`Order #${id} → ${status}`,'success'); load() }
    catch { toast('Update failed','error') }
  }

  const counts = {
    pending:   orders.filter(o=>o.status==='PENDING').length,
    preparing: orders.filter(o=>o.status==='PREPARING').length,
    ready:     orders.filter(o=>o.status==='READY').length,
  }

  // Group by time slot for slot-based view
  const bySlot = orders.reduce((acc, o) => {
    const slot = o.timeSlot || 'No Slot'
    if (!acc[slot]) acc[slot] = []
    acc[slot].push(o)
    return acc
  }, {})

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>Employee Dashboard 👨‍🍳</div>
        <div className="text-muted text-sm">
          Orders sorted by priority — longer prep items first | Auto-refresh every 30s
          <span style={{marginLeft:8,color:'var(--green)'}}>🟢 Last: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{color:'var(--yellow)'}}>{counts.pending}</div>
          <div className="stat-sub">Awaiting accept</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Preparing</div>
          <div className="stat-value" style={{color:'var(--primary)'}}>{counts.preparing}</div>
          <div className="stat-sub">In kitchen now</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Ready</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{counts.ready}</div>
          <div className="stat-sub">Pickup ready</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Active</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{orders.length}</div>
          <div className="stat-sub">In queue</div>
        </div>
      </div>

      {/* Priority legend */}
      <div style={{background:'var(--bg)',borderRadius:10,padding:'10px 16px',marginBottom:16,display:'flex',gap:20,fontSize:'0.8rem'}}>
        <strong>Priority Guide:</strong>
        <span style={{color:'var(--red)'}}>🔴 HIGH — Score ≥30 (cook first)</span>
        <span style={{color:'var(--yellow)'}}>🟡 MED — Score 15–29</span>
        <span style={{color:'var(--green)'}}>🟢 LOW — Score &lt;15</span>
        <span style={{color:'var(--muted)'}}>Score = Σ(prep_time × quantity)</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between" style={{marginBottom:16}}>
        <div className="tabs" style={{maxWidth:300}}>
          <button className={`tab ${tab==='active'?'active':''}`} onClick={()=>setTab('active')}>🔴 Active</button>
          <button className={`tab ${tab==='all'?'active':''}`} onClick={()=>setTab('all')}>📋 All</button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh Now</button>
      </div>

      {loading
        ? <div className="flex-center" style={{height:200}}>⏳ Loading...</div>
        : orders.length === 0
          ? <div className="empty-state card"><div className="icon">🎉</div><p>No active orders right now!</p></div>
          : (
            // Group by time slot
            Object.keys(bySlot).sort().map(slot => (
              <div key={slot}>
                {/* Slot header */}
                <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0 10px',}}>
                  <div style={{background:'var(--primary)',color:'#fff',borderRadius:20,padding:'4px 14px',fontWeight:700,fontSize:'0.85rem'}}>
                    ⏰ Slot: {slot}
                  </div>
                  <div style={{fontSize:'0.78rem',color:'var(--muted)'}}>{bySlot[slot].length} order(s)</div>
                  <div style={{flex:1,height:1,background:'var(--border)'}}/>
                </div>

                {bySlot[slot].map(order => {
                  const pri = getPriorityInfo(order.priorityScore || 0)
                  return (
                    <div key={order.id} className={`order-card ${pri.cls}`} style={{marginBottom:12}}>
                      <div className="flex justify-between items-center" style={{marginBottom:10}}>
                        <div className="flex items-center gap-2" style={{flexWrap:'wrap'}}>
                          {/* Token */}
                          {order.tokenNumber && (
                            <div style={{background:'var(--primary)',color:'#fff',borderRadius:20,padding:'3px 12px',fontWeight:800,fontSize:'0.9rem'}}>
                              🎫 #{order.tokenNumber}
                            </div>
                          )}
                          {/* Priority */}
                          <span style={{background:pri.color,color:'#fff',borderRadius:6,padding:'2px 8px',fontSize:'0.72rem',fontWeight:700}}>
                            {pri.label} (score: {order.priorityScore||0})
                          </span>
                          <span style={{fontWeight:600}}>Order #{order.id}</span>
                          <span className="text-muted text-sm">— {order.userName}</span>
                        </div>
                        <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                      </div>

                      {/* Est ready time */}
                      {order.estimatedReadyTime && (
                        <div style={{fontSize:'0.78rem',color:'var(--purple)',fontWeight:600,marginBottom:8}}>
                          🕐 Est. Ready: {order.estimatedReadyTime}
                        </div>
                      )}

                      {/* Items with prep times */}
                      <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
                        {order.items?.map(i=>(
                          <div key={i.foodItemId} className="flex justify-between" style={{fontSize:'0.85rem',marginBottom:4}}>
                            <span>
                              {i.foodItemName} ×{i.quantity}
                              <span style={{marginLeft:8,fontSize:'0.72rem',color:'var(--muted)'}}>
                                ({i.prepTimeMinutes}min × {i.quantity} = {i.prepTimeMinutes*i.quantity}pts)
                              </span>
                            </span>
                            <span className="font-bold">₹{i.subtotal}</span>
                          </div>
                        ))}
                        <div style={{borderTop:'1px solid var(--border)',marginTop:6,paddingTop:6,display:'flex',justifyContent:'space-between',fontWeight:700}}>
                          <span>Total</span>
                          <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="alert alert-warning" style={{padding:'6px 10px',marginBottom:8,fontSize:'0.78rem'}}>
                          📝 {order.notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-muted text-sm">via {order.paymentMethod}</span>
                        <div className="flex gap-2">
                          {NEXT[order.status] && (
                            <button className="btn btn-green btn-sm" onClick={()=>update(order.id,NEXT[order.status])}>
                              {NEXT_LABEL[order.status]}
                            </button>
                          )}
                          {!['DELIVERED','CANCELLED'].includes(order.status) && (
                            <button className="btn btn-danger btn-sm" onClick={()=>update(order.id,'CANCELLED')}>🚫</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )
      }
    </div>
  )
}
