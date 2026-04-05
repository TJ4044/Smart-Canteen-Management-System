import { useState, useEffect } from 'react'
import { adminAPI, menuAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

export default function AdminDashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name:'', email:'', password:'', phone:'', role:'EMPLOYEE' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [s, u] = await Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      setStats(s.data); setUsers(u.data)
    } catch { toast('Failed to load dashboard', 'error') }
    finally { setLoading(false) }
  }

  const handleAddUser = async () => {
    try {
      await adminAPI.createUser(newUser)
      toast('User created successfully', 'success')
      setShowAddUser(false)
      setNewUser({ name:'', email:'', password:'', phone:'', role:'EMPLOYEE' })
      loadData()
    } catch (e) { toast(e.response?.data?.error || 'Failed to create user', 'error') }
  }

  const handleToggle = async (id) => {
    try {
      const r = await adminAPI.toggleUser(id)
      toast(r.data.message, 'success'); loadData()
    } catch { toast('Action failed', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { await adminAPI.deleteUser(id); toast('User deleted', 'success'); loadData() }
    catch { toast('Delete failed', 'error') }
  }

  const ROLE_BADGE = { ADMIN: 'badge-red', EMPLOYEE: 'badge-blue', CUSTOMER: 'badge-green' }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem' }}>Admin Dashboard 🛡️</div>
        <div className="text-muted text-sm">System overview and management</div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-sub">Registered accounts</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{stats?.totalOrders ?? 0}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Active Orders</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{stats?.activeOrders ?? 0}</div>
          <div className="stat-sub">In progress</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{color:'var(--primary)'}}>₹{(stats?.totalRevenue ?? 0).toFixed(0)}</div>
          <div className="stat-sub">From all orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Menu Items</div>
          <div className="stat-value">{stats?.totalFoodItems ?? 0}</div>
          <div className="stat-sub">Food items listed</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-title flex justify-between items-center">
          <span>👥 All Users</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(!showAddUser)}>
            {showAddUser ? '✕ Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <div style={{ background:'var(--bg)', borderRadius:10, padding:20, marginBottom:20 }}>
            <div style={{ fontWeight:700, marginBottom:14 }}>➕ Create New User</div>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="Phone" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddUser}>✅ Create User</button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Role</th>
                <th>Wallet</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="avatar" style={{ width:28, height:28, fontSize:'0.7rem' }}>
                        {u.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight:500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td className="text-primary font-bold">₹{u.walletBalance?.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${u.walletBalance !== undefined ? 'badge-green' : 'badge-gray'}`}>
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-xs" onClick={() => handleToggle(u.id)}>Toggle</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
