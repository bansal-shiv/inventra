import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Customers, Orders, Products, readError } from '../api/client'
import { money, shortDate } from '../api/format'
import { Empty, Loading } from '../components/States'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Notice from '../components/Notice'

function summarise(items) {
  if (!items?.length) return '—'
  const parts = items.map((i) => `${i.product_name} ×${i.quantity}`)
  const joined = parts.join(', ')
  return joined.length > 60 ? joined.slice(0, 57) + '…' : joined
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(null)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [formError, setFormError] = useState('')

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState([{ product_id: '', quantity: 1 }])

  const [detail, setDetail] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = () =>
    Orders.list()
      .then(setOrders)
      .catch((e) => toast.error(readError(e)))

  useEffect(() => {
    load()
    Products.list().then(setProducts).catch(() => {})
    Customers.list().then(setCustomers).catch(() => {})
  }, [])

  const openCreate = () => {
    setCustomerId('')
    setLines([{ product_id: '', quantity: 1 }])
    setFormError('')
    setOpen(true)
  }

  const addLine = () => setLines([...lines, { product_id: '', quantity: 1 }])
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i, patch) =>
    setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const preview = lines.reduce((sum, l) => {
    const p = products.find((x) => x.id === Number(l.product_id))
    return p ? sum + Number(p.price) * Number(l.quantity || 0) : sum
  }, 0)

  const submit = async () => {
    if (!customerId) return setFormError('Select a customer')
    const items = lines
      .filter((l) => l.product_id && Number(l.quantity) > 0)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }))
    if (items.length === 0) return setFormError('Add at least one product')

    setSaving(true)
    try {
      await Orders.create({ customer_id: Number(customerId), items })
      toast.success('Order placed')
      setOpen(false)
      load()
      Products.list().then(setProducts)
    } catch (e) {
      setFormError(readError(e))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    const id = toDelete.id
    setToDelete(null)
    try {
      await Orders.remove(id)
      toast.success('Order cancelled — stock restored')
      load()
      Products.list().then(setProducts)
    } catch (e) {
      toast.error(readError(e))
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-stone-500">
            Create orders, view history, and track stock movement.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Create order
        </button>
      </div>

      {orders === null ? (
        <Loading />
      ) : orders.length === 0 ? (
        <Empty label="No orders yet." hint="Create your first one with the button above." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[15px]">
            <thead className="text-left text-xs uppercase tracking-wider text-stone-500">
              <tr className="border-b border-stone-200">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3">{o.customer_name || `#${o.customer_id}`}</td>
                  <td className="px-5 py-3 text-stone-500">{summarise(o.items)}</td>
                  <td className="px-5 py-3 text-stone-500">{shortDate(o.created_at)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{money(o.total_amount)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDetail(o)} className="text-accent hover:underline">
                        View
                      </button>
                      <button
                        onClick={() => setToDelete(o)}
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

      <Modal title="Create order" open={open} onClose={() => setOpen(false)} size="lg">
        {formError && <Notice message={formError} onClose={() => setFormError('')} />}
        <div className="space-y-5">
          <div>
            <label className="label">Customer</label>
            <select
              className="field"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="label">Items</label>
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className="field flex-1"
                  value={line.product_id}
                  onChange={(e) => updateLine(i, { product_id: e.target.value })}
                >
                  <option value="">Product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} {p.quantity === 0 ? '(out)' : `(${p.quantity} in stock)`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="field w-24"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: e.target.value })}
                />
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(i)}
                    className="icon-btn"
                    aria-label="Remove line"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={addLine} className="text-sm font-medium text-accent hover:underline">
              + Add another item
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50 px-4 py-3">
            <span className="text-sm text-stone-600">Estimated total</span>
            <span className="text-lg font-semibold">{money(preview)}</span>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving}>
              {saving ? 'Placing…' : 'Place order'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title={detail ? `Order #${detail.id}` : ''}
        open={!!detail}
        onClose={() => setDetail(null)}
        size="lg"
      >
        {detail && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-stone-500">Customer</div>
                <div className="font-medium">{detail.customer_name || `#${detail.customer_id}`}</div>
              </div>
              <div>
                <div className="text-stone-500">Placed</div>
                <div className="font-medium">{shortDate(detail.created_at)}</div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-stone-500">
                <tr className="border-b border-stone-200">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit</th>
                  <th className="py-2 text-right">Line</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-stone-100 last:border-0">
                    <td className="py-2.5">{it.product_name}</td>
                    <td className="py-2.5 text-right">{it.quantity}</td>
                    <td className="py-2.5 text-right">{money(it.unit_price)}</td>
                    <td className="py-2.5 text-right">
                      {money(Number(it.unit_price) * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 font-semibold">
              <span>Total</span>
              <span>{money(detail.total_amount)}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Cancel order?"
        message={
          toDelete
            ? `Order #${toDelete.id} will be cancelled and the stock returned to inventory.`
            : ''
        }
        confirmLabel="Cancel order"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
