import { useState, useEffect } from 'react'
import { menuAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const FOOD_EMOJIS = { BREAKFAST:'🍳', LUNCH:'🍱', SNACKS:'🥪', DINNER:'🍛', BEVERAGES:'☕', DESSERTS:'🍮' }

export default function EmployeeMenu() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    menuAPI.getAllAdmin()
      .then(r => setItems(r.data))
      .catch(() => toast('Failed to load menu', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['ALL', ...new Set(items.map(i => i.category))]
  const displayed = filter === 'ALL' ? items : items.filter(i => i.category === filter)

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading...</div>

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>Today's Menu 🍽️</div>
        <div className="text-muted text-sm">Current menu items and availability</div>
      </div>

      <div className="category-chips">
        {categories.map(c => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'ALL' ? '🍴 All' : `${FOOD_EMOJIS[c] || '🍽️'} ${c}`}
          </button>
        ))}
      </div>

      <div className="food-grid">
        {displayed.map(item => (
          <div key={item.id} className={`food-card ${!item.available ? 'food-unavailable' : ''}`}>
            <div className="food-img">{FOOD_EMOJIS[item.category] || '🍽️'}</div>
            <div className="food-body">
              <div className="food-name">{item.name}</div>
              <div className="food-desc">{item.description}</div>
              <div className="food-footer">
                <span className="food-price">₹{item.price}</span>
                <span className={`badge ${item.available ? 'badge-green' : 'badge-red'}`}>
                  {item.available ? `Stock: ${item.stockQuantity}` : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
