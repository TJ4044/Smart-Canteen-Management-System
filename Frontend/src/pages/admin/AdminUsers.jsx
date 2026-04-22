import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ name:'', email:'', password:'', role:'EMPLOYEE', phone:'' })
  const [saving, setSaving]   = useState(false)
  const toast = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await adminAPI.getUsers()
      setUsers(res.data)
    } catch { toast('Failed to load users', 'error') }
    finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      setSaving(true)
      await adminAPI.createUser(form)
      toast('User created successfully', 'success')
      setShowForm(false)
      setForm({ name:'', email:'', password:'', role:'EMPLOYEE', phone:'' })
      load()
    } catch(err) { toast(err.response?.data?.error || 'Failed to create user', 'error') }
    finally { setSaving(false) }
  }

  async function handleToggle(id) {
    try {
      await adminAPI.toggleUser(id)
      toast('User status updated', 'success')
      load()
    } catch { toast('Failed to update user', 'error') }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try {
      await adminAPI.deleteUser(id)
      toast('User deleted', 'success')
      load()
    } catch { toast('Failed to delete user', 'error') }
  }

  const roleColors = { ADMIN:'badge-red', EMPLOYEE:'badge-blue', CUSTOMER:'badge-green' }

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">👥 Manage Users</div>
          <div className="topbar-sub">Create and manage all system users</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '＋ Add User'}
        </button>
      </div>

      <div className="page">
        {showForm && (
          <div className="card" style={{ borderTop:'3px solid var(--primary)' }}>
            <div className="card-title">➕ Create New User</div>
            <form onSubmit={handleCreate}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Priya Sharma" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="priya@canteen.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Creating…' : '✅ Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-title">All Users ({users.length})</div>
          {loading ? (
            <div className="empty-state"><div className="icon">⏳</div><p>Loading…</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Wallet</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className={`avatar ${u.role==='EMPLOYEE'?'green':u.role==='CUSTOMER'?'blue':''}`}
                               style={{ width:30, height:30, fontSize:'0.75rem' }}>
                            {u.name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight:600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'var(--muted)', fontSize:'0.82rem' }}>{u.email}</td>
                      <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                      <td style={{ fontWeight:600 }}>₹{u.walletBalance?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className={`btn btn-xs ${u.active ? 'btn-outline' : 'btn-green'}`}
                                  onClick={() => handleToggle(u.id)}>
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-xs btn-danger"
                                  onClick={() => handleDelete(u.id, u.name)}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
