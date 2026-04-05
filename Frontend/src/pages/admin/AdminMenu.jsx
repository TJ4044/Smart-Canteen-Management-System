import { useState, useEffect } from 'react'
import { menuAPI } from '../../api/api'
import { useToast } from '../../components/Toast'

const CATEGORIES = ['BREAKFAST','LUNCH','SNACKS','DINNER','BEVERAGES','DESSERTS']
const FOOD_EMOJIS = {
  BREAKFAST:'🍳', LUNCH:'🍱', SNACKS:'🥪', DINNER:'🍛', BEVERAGES:'☕', DESSERTS:'🍮'
}

const empty = { name:'', description:'', price:'', category:'LUNCH', stockQuantity:'', available: true }

export default function AdminMenu() {
  const toast = useToast()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(empty)
  const [filter, setFilter]     = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    try { const r = await menuAPI.getAllAdmin(); setItems(r.data) }
    catch { toast('Failed to load menu', 'error') }
    finally { setLoading(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.price) { toast('Name and price are required', 'error'); return }
    try {
      const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) || 0 }
      if (editId) { await menuAPI.update(editId, payload); toast('Item updated!', 'success') }
      else        { await menuAPI.create(payload);         toast('Item added!', 'success')   }
      setShowForm(false); setEditId(null); setForm(empty); load()
    } catch (e) { toast(e.response?.data?.error || 'Save failed', 'error') }
  }

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: item.price,
              category: item.category, stockQuantity: item.stockQuantity, available: item.available })
    setEditId(item.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try { await menuAPI.delete(id); toast('Item deleted', 'success'); load() }
    catch { toast('Delete failed', 'error') }
  }

  const handleToggle = async (id) => {
    try { await menuAPI.toggle(id); toast('Availability updated', 'success'); load() }
    catch { toast('Update failed', 'error') }
  }

  const displayed = filter === 'ALL' ? items : items.filter(i => i.category === filter)

  if (loading) return <div className="flex-center" style={{height:300}}>⏳ Loading menu...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily:'Poppins', fontWeight:800, fontSize:'1.5rem' }}>Menu Management 🍽️</div>
        <div className="text-muted text-sm">Add, edit, or remove food items from the canteen menu</div>
      </div>

      {/* Add / Edit Form */}
      <div className="card">
        <div className="card-title flex justify-between items-center">
          <span>{editId ? '✏️ Edit Item' : '➕ Add New Item'}</span>
          {!showForm
            ? <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Item</button>
            : <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditId(null); setForm(empty) }}>✕ Cancel</button>
          }
        </div>

        {showForm && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label>Item Name *</label>
                <input type="text" placeholder="e.g. Masala Dosa" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input type="number" placeholder="e.g. 40" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" placeholder="e.g. 50" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" placeholder="Short description of the item" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} style={{width:'auto', marginRight:8}} />
                Available for ordering
              </label>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {editId ? '💾 Update Item' : '✅ Add to Menu'}
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="category-chips">
        {['ALL', ...CATEGORIES].map(c => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'ALL' ? '🍴 All' : `${FOOD_EMOJIS[c]} ${c}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-title">📋 Menu Items ({displayed.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayed.map((item, i) => (
                <tr key={item.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:'1.5rem' }}>{FOOD_EMOJIS[item.category]}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{item.name}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td className="text-primary font-bold">₹{item.price}</td>
                  <td>{item.stockQuantity}</td>
                  <td>
                    <span className={`badge ${item.available ? 'badge-green' : 'badge-red'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-xs" onClick={() => handleEdit(item)}>✏️ Edit</button>
                      <button className="btn btn-outline btn-xs" onClick={() => handleToggle(item.id)}>
                        {item.available ? '🔴 Hide' : '🟢 Show'}
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state"><div className="icon">🍽️</div><p>No items found</p></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
