import { useState, useEffect } from 'react'
import { slotAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

export default function AdminSlots() {
  const toast = useToast()
  const [slots, setSlots]       = useState([])
  const [settings, setSettings] = useState(null)
  const [form, setForm]         = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [s, st] = await Promise.all([slotAPI.getSlots(), slotAPI.getSettings()])
      setSlots(s.data); setSettings(st.data)
      setForm({
        maxOrdersPerSlot: st.data.maxOrdersPerSlot,
        slotDurationMinutes: st.data.slotDurationMinutes,
        peakStartTime: st.data.peakStartTime,
        peakEndTime: st.data.peakEndTime,
        orderingEnabled: st.data.orderingEnabled,
      })
    } catch { toast('Failed to load','error') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await slotAPI.updateSettings(form)
      toast('Settings saved!','success'); load()
    } catch { toast('Save failed','error') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    try { const r = await slotAPI.toggleOrdering(); toast(r.data.message,'success'); load() }
    catch { toast('Failed','error') }
  }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  const maxOrders = form.maxOrdersPerSlot || 20
  const orderingOn = settings?.orderingEnabled !== false
  const totalCapacity = slots.length * maxOrders
  const totalBooked   = slots.reduce((s,sl)=>s+sl.ordersInSlot,0)

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>Slot Settings ⏰</div>
        <div className="text-muted text-sm">Control peak hour capacity and order distribution</div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: orderingOn ? 'var(--green-l)' : 'var(--red-l)',
        border: `1px solid ${orderingOn ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: 10, padding: '14px 18px', marginBottom: 20,
        display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div>
          <div style={{fontWeight:700,color: orderingOn?'#15803d':'#b91c1c'}}>
            {orderingOn ? '✅ Ordering is ENABLED' : '❌ Ordering is DISABLED'}
          </div>
          <div style={{fontSize:'0.8rem',color:'var(--muted)',marginTop:3}}>
            {orderingOn ? 'Customers can place orders right now' : 'Admin has paused all new orders'}
          </div>
        </div>
        <button className={`btn btn-sm ${orderingOn?'btn-danger':'btn-green'}`} onClick={handleToggle}>
          {orderingOn ? '🔴 Disable Now' : '🟢 Enable Now'}
        </button>
      </div>

      <div className="grid-2">
        {/* Settings Form */}
        <div className="card">
          <div className="card-title">⚙️ Configure Slot Rules</div>
          <div className="form-group">
            <label>Max Orders Per Slot</label>
            <input type="number" min={1} max={100}
              value={form.maxOrdersPerSlot||20}
              onChange={e=>setForm({...form,maxOrdersPerSlot:+e.target.value})}/>
            <div style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:4}}>
              Kitchen can handle this many orders per time slot
            </div>
          </div>
          <div className="form-group">
            <label>Slot Duration (minutes)</label>
            <input type="number" min={5} max={60} step={5}
              value={form.slotDurationMinutes||10}
              onChange={e=>setForm({...form,slotDurationMinutes:+e.target.value})}/>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Peak Start Time</label>
              <input type="time" value={form.peakStartTime||'13:00'}
                onChange={e=>setForm({...form,peakStartTime:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Peak End Time</label>
              <input type="time" value={form.peakEndTime||'14:00'}
                onChange={e=>setForm({...form,peakEndTime:e.target.value})}/>
            </div>
          </div>
          <div className="alert alert-info" style={{fontSize:'0.8rem'}}>
            💡 Example: Peak 1:00–2:00 PM with 10-min slots and max 20 orders = 6 slots × 20 = 120 orders max during lunch
          </div>
          <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
        </div>

        {/* Today's Load Overview */}
        <div className="card">
          <div className="card-title">📊 Today's Live Load</div>
          <div style={{display:'flex',gap:16,marginBottom:20}}>
            <div style={{flex:1,background:'var(--bg)',borderRadius:8,padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'1.6rem',fontWeight:800,color:'var(--primary)'}}>{totalBooked}</div>
              <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>Orders Placed</div>
            </div>
            <div style={{flex:1,background:'var(--bg)',borderRadius:8,padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'1.6rem',fontWeight:800,color:'var(--green)'}}>{totalCapacity-totalBooked}</div>
              <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>Remaining Capacity</div>
            </div>
          </div>

          {/* Horizontal load bars per slot */}
          {slots.length === 0
            ? <div className="empty-state"><div className="icon">📊</div><p>No slots for today</p></div>
            : slots.map(slot => {
                const pct = Math.min(100, (slot.ordersInSlot / maxOrders) * 100)
                const color = pct >= 90 ? 'var(--red)' : pct >= 60 ? 'var(--yellow)' : 'var(--green)'
                return (
                  <div key={slot.slot} style={{marginBottom:10}}>
                    <div className="flex justify-between" style={{marginBottom:4,fontSize:'0.82rem'}}>
                      <span style={{fontWeight:600}}>🕐 {slot.slot}</span>
                      <span style={{color:'var(--muted)'}}>
                        {slot.ordersInSlot}/{slot.maxOrders} orders
                        {pct>=90&&<span style={{color:'var(--red)',marginLeft:6}}>FULL</span>}
                      </span>
                    </div>
                    <div style={{background:'var(--border)',borderRadius:6,height:10,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:6,transition:'width 0.4s'}}/>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
