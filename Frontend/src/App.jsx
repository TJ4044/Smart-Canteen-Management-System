import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMenu      from './pages/admin/AdminMenu'
import AdminOrders    from './pages/admin/AdminOrders'

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeMenu      from './pages/employee/EmployeeMenu'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerMenu      from './pages/customer/CustomerMenu'
import CustomerOrders    from './pages/customer/CustomerOrders'
import CustomerWallet    from './pages/customer/CustomerWallet'

// ── Page titles ───────────────────────────────────────────────
const PAGE_META = {
  dashboard: { title: 'Dashboard',       sub: 'Overview of your activity' },
  menu:      { title: 'Menu',            sub: 'Food items and categories'  },
  orders:    { title: 'Orders',          sub: 'Track and manage orders'    },
  users:     { title: 'User Management', sub: 'All registered users'       },
  wallet:    { title: 'My Wallet',       sub: 'Balance and transactions'   },
}

// ── Authenticated app shell ───────────────────────────────────
function AppShell() {
  const { user, loading } = useAuth()
  const [page, setPage]   = useState('dashboard')

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:12 }}>🍴</div>
        <div style={{ fontFamily:'Poppins', fontWeight:700, fontSize:'1.2rem' }}>SmartCanteen</div>
        <div style={{ color:'var(--muted)', marginTop:6 }}>Loading...</div>
      </div>
    </div>
  )

  if (!user) return <LoginPage />

  const meta = PAGE_META[page] || {}

  const renderPage = () => {
    if (user.role === 'ADMIN') {
      switch (page) {
        case 'dashboard': return <AdminDashboard />
        case 'menu':      return <AdminMenu />
        case 'orders':    return <AdminOrders />
        case 'users':     return <AdminDashboard />   // users tab inside dashboard
        default:          return <AdminDashboard />
      }
    }
    if (user.role === 'EMPLOYEE') {
      switch (page) {
        case 'dashboard': return <EmployeeDashboard />
        case 'orders':    return <EmployeeDashboard />
        case 'menu':      return <EmployeeMenu />
        default:          return <EmployeeDashboard />
      }
    }
    if (user.role === 'CUSTOMER') {
      switch (page) {
        case 'dashboard': return <CustomerDashboard onNavigate={setPage} />
        case 'menu':      return <CustomerMenu onNavigate={setPage} />
        case 'orders':    return <CustomerOrders />
        case 'wallet':    return <CustomerWallet />
        default:          return <CustomerDashboard onNavigate={setPage} />
      }
    }
    return <div>Unknown role</div>
  }

  return (
    <div className="app-layout">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {user.role === 'CUSTOMER' && (
              <div style={{ background:'var(--primary-l)', color:'var(--primary)', padding:'6px 14px', borderRadius:20, fontSize:'0.82rem', fontWeight:600 }}>
                💰 ₹{user.walletBalance?.toFixed(2)}
              </div>
            )}
            <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>{user.email}</div>
          </div>
        </div>
        <div className="page">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  )
}
