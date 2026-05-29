import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Products, readError } from '../api/client'
import { money } from '../api/format'
import { Empty, Loading } from '../components/States'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Notice from '../components/Notice'

const blank = { name: '', sku: '', price: '', quantity: '' }

function StockBadge({ qty }) {
  if (qty === 0) return <span className="badge-danger">Out of stock</span>
  if (qty <= 5) return <span className="badge-danger">{qty} left</span>
  if (qty <= 10) return <span className="badge-warn">{qty} left</span>
  return <span className="badge-ok">{qty} in stock</span>
}

export default function ProductsPage() {
  const [rows, setRows] = useState(null)
  const [query, setQuery] = useState('')
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = () =>
    Products.list()
      .then(setRows)
      .catch((e) => toast.error(readError(e)))

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setFormError('')
    setOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity })
    setFormError('')
    setOpen(true)
  }

  const validate = () => {
    if (!form.name.trim() || !form.sku.trim()) return 'Name and SKU are required'
    if (Number(form.price) <= 0) return 'Price must be greater than zero'
    if (Number(form.quantity) < 0) return 'Quantity cannot be negative'
    if (!Number.isInteger(Number(form.quantity))) return 'Quantity must be a whole number'
    return ''
  }

  const submit = async () => {
    const problem = validate()
    if (problem) return setFormError(problem)

    const body = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    setSaving(true)
    try {
      if (editing) {
        await Products.update(editing, body)
        toast.success('Product updated')
      } else {
        await Products.create(body)
        toast.success('Product added')
      }
      setOpen(false)
      load()
    } catch (e) {
      setFormError(readError(e))
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    const id = toDelete.id
    setToDelete(null)
    try {
      await Products.remove(id)
      toast.success('Product deleted')
      load()
    } catch (e) {
      toast.error(readError(e))
    }
  }

  const filtered = (rows || []).filter((p) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-stone-500">Manage your catalogue and stock levels.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add product
        </button>
      </div>

      <div className="mb-4">
        <input
          className="field max-w-sm"
          placeholder="Search by name or SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {rows === null ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          label={query ? 'No products match your search.' : 'No products yet.'}
          hint={query ? 'Try a different name or SKU.' : 'Add your first one with the button above.'}
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[15px]">
            <thead className="text-left text-xs uppercase tracking-wider text-stone-500">
              <tr className="border-b border-stone-200">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-stone-500">{p.sku}</td>
                  <td className="px-5 py-3 text-right">{money(p.price)}</td>
                  <td className="px-5 py-3 text-right">
                    <StockBadge qty={p.quantity} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-accent hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(p)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing ? 'Edit product' : 'Add product'} open={open} onClose={() => setOpen(false)}>
        {formError && <Notice message={formError} onClose={() => setFormError('')} />}
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">SKU / code</label>
            <input
              className="field"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min="0"
                className="field"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={toDelete ? `“${toDelete.name}” will be removed from your catalogue.` : ''}
        onConfirm={confirmRemove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
