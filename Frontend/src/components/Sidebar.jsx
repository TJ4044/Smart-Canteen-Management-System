import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

const NAV = {
  ADMIN: [
    { label: 'Navigation', items: [
      { to: 'dashboard',  icon: '📊', text: 'Dashboard'    },
      { to: 'menu',       icon: '🍽️', text: 'Manage Menu'  },
      { to: 'orders',     icon: '📋', text: 'All Orders'   },
      { to: 'users',      icon: '👥', text: 'Manage Users' },
    ]},
  ],
  EMPLOYEE: [
    { label: 'Navigation', items: [
      { to: 'dashboard',  icon: '📊', text: 'Dashboard'    },
      { to: 'orders',     icon: '📋', text: 'Live Orders'  },
      { to: 'menu',       icon: '🍽️', text: 'View Menu'    },
    ]},
  ],
  CUSTOMER: [
    { label: 'Navigation', items: [
      { to: 'dashboard',  icon: '🏠', text: 'Dashboard'    },
      { to: 'menu',       icon: '🍽️', text: 'Order Food'   },
      { to: 'orders',     icon: '📦', text: 'My Orders'    },
      { to: 'wallet',     icon: '💰', text: 'My Wallet'    },
    ]},
  ],
}

const ROLE_COLOR = { ADMIN: '', EMPLOYEE: 'green', CUSTOMER: 'blue' }
const ROLE_LABEL = { ADMIN: 'Administrator', EMPLOYEE: 'Canteen Staff', CUSTOMER: 'Customer' }

export default function Sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth()
  const toast = useToast()

  if (!user) return null
  const sections = NAV[user.role] || []
  const color = ROLE_COLOR[user.role]

  const handleLogout = () => {
    logout()
    toast('Logged out successfully', 'info')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🍴 SmartCanteen</h2>
        <p>Management System</p>
      </div>

      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.label}>
            <div className="nav-section-label">{sec.label}</div>
            {sec.items.map(item => (
              <button
                key={item.to}
                className={`nav-link ${active === item.to ? 'active' : ''}`}
                onClick={() => onNavigate(item.to)}
              >
                <span className="icon">{item.icon}</span>
                {item.text}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className={`avatar ${color}`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="name">{user.name}</div>
            <div className="role">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
