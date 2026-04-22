import { useState, useEffect } from 'react'
import { menuAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const FOOD_ICONS = {
  BREAKFAST:'🌅', LUNCH:'☀️', SNACKS:'🍿', DINNER:'🌙', BEVERAGES:'☕', DESSERTS:'🍰'
}

export default function EmployeeMenu() {
  const [items, setItems]   = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    menuAPI.getAll().then(r => setItems(r.data))
      .catch(() => toast('Failed to load menu', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const cats = ['ALL','BREAKFAST','LUNCH','SNACKS','DINNER','BEVERAGES','DESSERTS']
  const visible = filter === 'ALL' ? items : items.filter(i => i.category === filter)

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🍽️ Menu Reference</div>
          <div className="topbar-sub">All items with preparation times</div>
        </div>
      </div>
      <div className="page">
        <div className="category-chips">
          {cats.map(c => (
            <button key={c} className={`chip ${filter===c?'active':''}`} onClick={() => setFilter(c)}>
              {FOOD_ICONS[c] || '🍽️'} {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="empty-state"><div className="icon">⏳</div><p>Loading…</p></div>
        ) : (
          <div className="food-grid">
            {visible.map(item => (
              <div key={item.id} className={`food-card ${!item.available?'food-unavailable':''}`}>
                <div className="food-img">
                  {FOOD_ICONS[item.category] || '🍽️'}
                  <span className="prep-badge">⏱ {item.prepTimeMinutes}min</span>
                </div>
                <div className="food-body">
                  <div className="food-name">{item.name}</div>
                  <div className="food-desc">{item.description}</div>
                  <div className="food-footer">
                    <div className="food-price">₹{item.price}</div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span className={`badge ${item.available?'badge-green':'badge-red'}`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop:6, fontSize:'0.72rem', color:'var(--muted)' }}>
                    Stock: {item.stockQuantity} · Category: {item.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
