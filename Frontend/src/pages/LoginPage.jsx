import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/api'
import { useToast } from '../components/Toast'

const ROLES = [
  { id: 'ADMIN',    icon: '🛡️', label: 'Admin'    },
  { id: 'EMPLOYEE', icon: '👨‍🍳', label: 'Employee' },
  { id: 'CUSTOMER', icon: '😊', label: 'Customer'  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [tab, setTab]     = useState('login')
  const [role, setRole]   = useState('CUSTOMER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm]   = useState({ name:'', email:'', password:'', phone:'' })
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setError('') }

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password })
      login(res.data)
      toast(`Welcome back, ${res.data.name}!`, 'success')
    } catch(e) { setError(e.response?.data?.error || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await authAPI.register({ ...form, role })
      login(res.data)
      toast(`Welcome, ${res.data.name}!`, 'success')
    } catch(e) { setError(e.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>🍴 SmartCanteen v2</h1>
          <p>Now with peak-hour management, token queue system, and smart slot scheduling.</p>
          <div className="auth-feature"><span>🎫</span> Token numbers — no more crowding</div>
          <div className="auth-feature"><span>⏰</span> Pre-order & schedule your pickup time</div>
          <div className="auth-feature"><span>📊</span> Slot limits — kitchen load controlled</div>
          <div className="auth-feature"><span>🔴</span> Priority cooking — longest items first</div>
          <div style={{marginTop:28,padding:'14px',background:'rgba(255,255,255,0.15)',borderRadius:10,fontSize:'0.8rem'}}>
            <strong>Demo:</strong><br/>
            admin@canteen.com / admin123<br/>
            emp@canteen.com / emp123<br/>
            customer@canteen.com / cust123
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>{tab==='login'?'Welcome Back 👋':'Create Account'}</h2>
          <p className="sub">{tab==='login'?'Sign in to your account':'Join SmartCanteen v2'}</p>
          <div className="tabs">
            <button className={`tab ${tab==='login'?'active':''}`} onClick={()=>{setTab('login');setError('')}}>Sign In</button>
            <button className={`tab ${tab==='register'?'active':''}`} onClick={()=>{setTab('register');setError('')}}>Register</button>
          </div>
          {tab==='register' && (
            <>
              <div className="form-group">
                <label>Select Role</label>
                <div className="role-picker">
                  {ROLES.map(r=>(
                    <div key={r.id} className={`role-option ${role===r.id?'selected':''}`} onClick={()=>setRole(r.id)}>
                      <div className="role-icon">{r.icon}</div>
                      <div className="role-name">{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Full Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)}/>
              </div>
            </>
          )}
          <div className="form-group"><label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
          </div>
          <div className="form-group"><label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e=>set('password',e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&tab==='login'&&handleLogin()}/>
          </div>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <button className="btn btn-primary btn-full" style={{padding:'12px',fontSize:'0.95rem'}}
            onClick={tab==='login'?handleLogin:handleRegister} disabled={loading}>
            {loading?'⏳ Please wait...':(tab==='login'?'🔐 Sign In':'🚀 Create Account')}
          </button>
        </div>
      </div>
    </div>
  )
}
