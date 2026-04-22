import { useState, useEffect } from 'react'
import { adminAPI, slotAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

export default function AdminDashboard({ navigate }) {
  const toast = useToast()
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [slots, setSlots]         = useState([])
  const [settings, setSettings]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser]     = useState({ name:'',email:'',password:'',phone:'',role:'EMPLOYEE' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [s, u, sl, st] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers(),
        slotAPI.getSlots(), slotAPI.getSettings()
      ])
      setStats(s.data); setUsers(u.data); setSlots(sl.data); setSettings(st.data)
    } catch { toast('Failed to load dashboard','error') }
    finally { setLoading(false) }
  }

  const handleToggleOrdering = async () => {
    try {
      const r = await slotAPI.toggleOrdering()
      toast(r.data.message, 'success'); loadAll()
    } catch { toast('Failed','error') }
  }

  const handleAddUser = async () => {
    try {
      await adminAPI.createUser(newUser)
      toast('User created','success'); setShowAddUser(false)
      setNewUser({name:'',email:'',password:'',phone:'',role:'EMPLOYEE'}); loadAll()
    } catch(e) { toast(e.response?.data?.error||'Failed','error') }
  }

  const handleToggleUser = async (id) => {
    try { const r = await adminAPI.toggleUser(id); toast(r.data.message,'success'); loadAll() }
    catch { toast('Failed','error') }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { await adminAPI.deleteUser(id); toast('Deleted','success'); loadAll() }
    catch { toast('Failed','error') }
  }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  const maxOrders = settings?.maxOrdersPerSlot || 20
  const orderingOn = settings?.orderingEnabled !== false

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Poppins',fontWeight:800,fontSize:'1.5rem'}}>Admin Dashboard 🛡️</div>
        <div className="text-muted text-sm">System overview, slot management and user controls</div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers??0}</div><div className="stat-sub">Registered</div></div>
        <div className="stat-card green"><div className="stat-label">Total Orders</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{stats?.totalOrders??0}</div><div className="stat-sub">All time</div></div>
        <div className="stat-card blue"><div className="stat-label">Active Orders</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{stats?.activeOrders??0}</div><div className="stat-sub">In progress</div></div>
        <div className="stat-card yellow"><div className="stat-label">Revenue</div>
          <div className="stat-value" style={{color:'var(--primary)'}}>₹{(stats?.totalRevenue??0).toFixed(0)}</div></div>
        <div className="stat-card purple"><div className="stat-label">Menu Items</div>
          <div className="stat-value" style={{color:'var(--purple)'}}>{stats?.totalFoodItems??0}</div></div>
      </div>

      <div className="grid-2">
        {/* Slot Load Chart */}
        <div className="card">
          <div className="card-title" style={{justifyContent:'space-between'}}>
            <span>📊 Today's Slot Load</span>
            <button className={`btn btn-sm ${orderingOn?'btn-danger':'btn-green'}`} onClick={handleToggleOrdering}>
              {orderingOn?'🔴 Disable Ordering':'🟢 Enable Ordering'}
            </button>
          </div>
          {slots.length === 0
            ? <div className="empty-state"><div className="icon">📊</div><p>No slots configured</p></div>
            : (
            <>
              <div className="load-chart">
                {slots.map(slot => {
                  const pct = Math.min(100, (slot.ordersInSlot / maxOrders) * 100)
                  const cls = pct >= 90 ? 'full' : pct >= 60 ? 'busy' : 'free'
                  return (
                    <div key={slot.slot} className="load-bar-wrap">
                      <div style={{fontSize:'0.65rem',color:'var(--muted)',fontWeight:600}}>{slot.ordersInSlot}</div>
                      <div className={`load-bar ${cls}`} style={{height:`${Math.max(4,pct)}%`}}/>
                      <div className="load-label">{slot.slot}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-4" style={{fontSize:'0.75rem'}}>
                <span style={{color:'var(--green)'}}>■ Available</span>
                <span style={{color:'var(--yellow)'}}>■ Busy (&gt;60%)</span>
                <span style={{color:'var(--red)'}}>■ Full (&gt;90%)</span>
              </div>
            </>
          )}
          <button className="btn btn-outline btn-sm mt-4" style={{width:'100%'}} onClick={()=>navigate&&navigate('slots')}>
            ⚙️ Configure Slot Settings
          </button>
        </div>

        {/* Quick Settings */}
        <div className="card">
          <div className="card-title">⚙️ Current Slot Settings</div>
          {settings && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[
                ['Peak Hours', `${settings.peakStartTime} – ${settings.peakEndTime}`],
                ['Max Orders/Slot', settings.maxOrdersPerSlot],
                ['Slot Duration', `${settings.slotDurationMinutes} minutes`],
                ['Ordering Status', settings.orderingEnabled ? '✅ Enabled' : '❌ Disabled'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center" style={{padding:'10px 12px',background:'var(--bg)',borderRadius:8}}>
                  <span className="text-muted text-sm">{k}</span>
                  <span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
              <button className="btn btn-primary btn-sm" style={{width:'100%'}} onClick={()=>navigate&&navigate('slots')}>
                Edit Settings →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-title flex justify-between items-center">
          <span>👥 All Users</span>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAddUser(!showAddUser)}>
            {showAddUser?'✕ Cancel':'+ Add User'}
          </button>
        </div>
        {showAddUser && (
          <div style={{background:'var(--bg)',borderRadius:10,padding:20,marginBottom:20}}>
            <div style={{fontWeight:700,marginBottom:14}}>➕ Create New User</div>
            <div className="grid-2">
              <div className="form-group"><label>Full Name</label>
                <input type="text" placeholder="Name" value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})}/></div>
              <div className="form-group"><label>Email</label>
                <input type="email" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})}/></div>
              <div className="form-group"><label>Password</label>
                <input type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})}/></div>
              <div className="form-group"><label>Role</label>
                <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}>
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="CUSTOMER">Customer</option>
                </select></div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddUser}>✅ Create User</button>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Wallet</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u.id}>
                  <td className="text-muted">{i+1}</td>
                  <td><div className="flex items-center gap-2">
                    <div className="avatar" style={{width:28,height:28,fontSize:'0.7rem'}}>{u.name?.charAt(0)}</div>
                    <span style={{fontWeight:500}}>{u.name}</span>
                  </div></td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge badge-${u.role==='ADMIN'?'red':u.role==='EMPLOYEE'?'blue':'green'}`}>{u.role}</span></td>
                  <td className="text-primary font-bold">₹{u.walletBalance?.toFixed(0)}</td>
                  <td><div className="flex gap-2">
                    <button className="btn btn-outline btn-xs" onClick={()=>handleToggleUser(u.id)}>Toggle</button>
                    <button className="btn btn-danger btn-xs" onClick={()=>handleDeleteUser(u.id)}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
