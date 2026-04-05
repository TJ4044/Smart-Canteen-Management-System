import { useState, useEffect } from 'react'
import { menuAPI, orderAPI, walletAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const FOOD_EMOJIS = { BREAKFAST:'🍳', LUNCH:'🍱', SNACKS:'🥪', DINNER:'🍛', BEVERAGES:'☕', DESSERTS:'🍮' }
const CATEGORIES = ['ALL','BREAKFAST','LUNCH','SNACKS','DINNER','BEVERAGES','DESSERTS']

export default function CustomerMenu({ onNavigate }) {
  const { user, updateWallet } = useAuth()
  const toast = useToast()
  const [items, setItems]           = useState([])
  const [cart, setCart]             = useState({})   // { foodId: quantity }
  const [filter, setFilter]         = useState('ALL')
  const [view, setView]             = useState('menu') // 'menu' | 'cart'
  const [payment, setPayment]       = useState('WALLET')
  const [notes, setNotes]           = useState('')
  const [wallet, setWallet]         = useState(user?.walletBalance || 0)
  const [placing, setPlacing]       = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([menuAPI.getAll(), walletAPI.getBalance()])
      .then(([m, w]) => { setItems(m.data); setWallet(w.data.walletBalance) })
      .catch(() => toast('Failed to load menu', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const addToCart    = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const removeOne    = (id) => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  const removeAll    = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n })
  const cartCount    = Object.values(cart).reduce((s, v) => s + v, 0)
  const cartItems    = Object.entries(cart).map(([id, qty]) => ({ item: items.find(i => i.id === +id), qty })).filter(x => x.item)
  const cartTotal    = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0)
  const displayed    = filter === 'ALL' ? items : items.filter(i => i.category === filter)

  const placeOrder = async () => {
    if (cartItems.length === 0) { toast('Cart is empty', 'error'); return }
    if (payment === 'WALLET' && wallet < cartTotal) { toast('Insufficient wallet balance', 'error'); return }
    setPlacing(true)
    try {
      await orderAPI.place({
        items: cartItems.map(({ item, qty }) => ({ foodItemId: item.id, quantity: qty })),
        paymentMethod: payment,
        notes
      })
      // Refresh wallet
      const w = await walletAPI.getBalance()
      setWallet(w.data.walletBalance); updateWallet(w.data.walletBalance)
      setCart({}); setNotes(''); setView('menu')
      toast('🎉 Order placed successfully!', 'success')
      if (onNavigate) onNavigate('orders')
    } catch (e) { toast(e.response?.data?.error || 'Failed to place order', 'error') }
    finally { setPlacing(false) }
  }

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading menu...</div>

  // ── Cart View ──────────────────────────────────────────────
  if (view === 'cart') return (
    <div>
      <div style={{ marginBottom:24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => setView('menu')} style={{ marginBottom:12 }}>← Back to Menu</button>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>Your Cart 🛒</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">🛒 Cart Items ({cartCount})</div>
            {cartItems.length === 0
              ? <div className="empty-state"><div className="icon">🛒</div><p>Cart is empty</p></div>
              : cartItems.map(({ item, qty }) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-icon">{FOOD_EMOJIS[item.category]}</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price} × {qty} = <strong>₹{(item.price * qty).toFixed(2)}</strong></div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeOne(item.id)}>−</button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(item.id)}>+</button>
                  </div>
                  <button onClick={() => removeAll(item.id)} style={{ background:'none', border:'none', color:'var(--red)', fontSize:'1rem', cursor:'pointer' }}>🗑️</button>
                </div>
              ))
            }
          </div>

          <div className="card">
            <div className="card-title">📝 Special Instructions</div>
            <textarea rows={3} placeholder="Any special requests? (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize:'vertical' }} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">💳 Payment & Summary</div>
            <div className="order-summary">
              {cartItems.map(({ item, qty }) => (
                <div key={item.id} className="summary-row">
                  <span>{item.name} ×{qty}</span>
                  <span>₹{(item.price * qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row total">
                <span>Total</span>
                <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <div className="flex gap-2">
                {['WALLET','CASH'].map(m => (
                  <button key={m} className={`btn btn-sm ${payment === m ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPayment(m)}>
                    {m === 'WALLET' ? '💰 Wallet' : '💵 Cash'}
                  </button>
                ))}
              </div>
            </div>

            {payment === 'WALLET' && (
              <div className="alert alert-info" style={{ marginBottom:14 }}>
                Wallet Balance: <strong>₹{wallet?.toFixed(2)}</strong>
                {wallet < cartTotal && <div style={{ color:'var(--red)', marginTop:4 }}>⚠️ Insufficient balance. Please recharge or pay by cash.</div>}
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ padding:'13px' }} onClick={placeOrder} disabled={placing || cartItems.length === 0}>
              {placing ? '⏳ Placing Order...' : `🛒 Place Order — ₹${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Menu View ──────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>Order Food 🍽️</div>
          <div className="text-muted text-sm">Browse and add items to your cart</div>
        </div>
        {cartCount > 0 && (
          <button className="btn btn-primary" onClick={() => setView('cart')}>
            🛒 Cart ({cartCount}) — ₹{cartTotal.toFixed(2)}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-chips">
        {CATEGORIES.map(c => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'ALL' ? '🍴 All' : `${FOOD_EMOJIS[c] || '🍽️'} ${c}`}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="food-grid">
        {displayed.map(item => {
          const qty = cart[item.id] || 0
          return (
            <div key={item.id} className={`food-card ${!item.available ? 'food-unavailable' : ''}`}>
              <div className="food-img">{FOOD_EMOJIS[item.category] || '🍽️'}</div>
              <div className="food-body">
                <div className="food-name">{item.name}</div>
                <div className="food-desc">{item.description}</div>
                <div className="food-footer">
                  <span className="food-price">₹{item.price}</span>
                  {!item.available
                    ? <span className="badge badge-red">Unavailable</span>
                    : qty === 0
                      ? <button className="btn btn-primary btn-xs" onClick={() => addToCart(item.id)}>+ Add</button>
                      : (
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => removeOne(item.id)}>−</button>
                          <span className="qty-num">{qty}</span>
                          <button className="qty-btn" onClick={() => addToCart(item.id)}>+</button>
                        </div>
                      )
                  }
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:99 }}>
          <button className="btn btn-primary" style={{ padding:'14px 32px', borderRadius:30, boxShadow:'0 8px 24px rgba(249,115,22,0.4)', fontSize:'0.95rem' }} onClick={() => setView('cart')}>
            🛒 View Cart ({cartCount} items) — ₹{cartTotal.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  )
}
