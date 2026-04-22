import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import LoginPage from './pages/LoginPage'
import Sidebar from './components/Sidebar'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMenu      from './pages/admin/AdminMenu'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminSlots     from './pages/admin/AdminSlots'
import AdminUsers     from './pages/admin/AdminUsers'

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeOrders    from './pages/employee/EmployeeOrders'
import EmployeeMenu      from './pages/employee/EmployeeMenu'

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerMenu      from './pages/customer/CustomerMenu'
import CustomerOrders    from './pages/customer/CustomerOrders'
import CustomerWallet    from './pages/customer/CustomerWallet'

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage]   = useState('dashboard')

  if (loading) return (
    <div className="flex-center" style={{ height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:'2rem' }}>🍽️</div>
      <div style={{ color:'var(--muted)', fontSize:'0.9rem' }}>Loading Smart Canteen…</div>
    </div>
  )

  if (!user) return <LoginPage />

  const role = user.role

  const pages = {
    ADMIN: {
      dashboard: <AdminDashboard navigate={setPage} />,
      menu:      <AdminMenu />,
      orders:    <AdminOrders />,
      slots:     <AdminSlots />,
      users:     <AdminUsers />,
    },
    EMPLOYEE: {
      dashboard: <EmployeeDashboard />,
      orders:    <EmployeeOrders />,
      menu:      <EmployeeMenu />,
    },
    CUSTOMER: {
      dashboard: <CustomerDashboard navigate={setPage} />,
      menu:      <CustomerMenu onNavigate={setPage} />,
      orders:    <CustomerOrders />,
      wallet:    <CustomerWallet />,
    },
  }

  const currentPage = pages[role]?.[page] || pages[role]?.['dashboard']

  return (
    <div className="app-layout">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="main-content">
        <div className="page">{currentPage}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  )
}
