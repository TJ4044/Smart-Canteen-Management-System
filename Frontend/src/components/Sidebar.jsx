import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

const NAV = {
  ADMIN: [
    { to: 'dashboard',  icon: '📊', text: 'Dashboard'     },
    { to: 'menu',       icon: '🍽️', text: 'Manage Menu'   },
    { to: 'orders',     icon: '📋', text: 'All Orders'    },
    { to: 'slots',      icon: '⏰', text: 'Slot Settings' },
    { to: 'users',      icon: '👥', text: 'Manage Users'  },
  ],
  EMPLOYEE: [
    { to: 'dashboard',  icon: '📊', text: 'Dashboard'    },
    { to: 'orders',     icon: '🔴', text: 'Live Orders'  },
    { to: 'menu',       icon: '🍽️', text: 'View Menu'    },
  ],
  CUSTOMER: [
    { to: 'dashboard',  icon: '🏠', text: 'Dashboard'   },
    { to: 'menu',       icon: '🍽️', text: 'Order Food'  },
    { to: 'orders',     icon: '📦', text: 'My Orders'   },
    { to: 'wallet',     icon: '💰', text: 'My Wallet'   },
  ],
}

const ROLE_COLOR = { ADMIN: '', EMPLOYEE: 'green', CUSTOMER: 'blue' }
const ROLE_LABEL = { ADMIN: 'Administrator', EMPLOYEE: 'Canteen Staff', CUSTOMER: 'Customer' }

export default function Sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth()
  const toast = useToast()
  if (!user) return null
  const items = NAV[user.role] || []

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🍴 SmartCanteen</h2>
        <p>v2 — Peak Hour Management</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {items.map(item => (
          <button key={item.to}
            className={`nav-link ${active === item.to ? 'active' : ''}`}
            onClick={() => onNavigate(item.to)}>
            <span className="icon">{item.icon}</span>
            {item.text}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className={`avatar ${ROLE_COLOR[user.role]}`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="name">{user.name}</div>
            <div className="role">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={() => { logout(); toast('Logged out', 'info') }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
