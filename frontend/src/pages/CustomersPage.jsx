import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Customers, readError } from '../api/client'
import { Empty, Loading } from '../components/States'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Notice from '../components/Notice'

const blank = { full_name: '', email: '', phone: '' }

function digitsOf(s) {
  return (s.match(/\d/g) || []).length
}

export default function CustomersPage() {
  const [rows, setRows] = useState(null)
  const [query, setQuery] = useState('')
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = () =>
    Customers.list()
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

  const openEdit = (c) => {
    setEditing(c.id)
    setForm({ full_name: c.full_name, email: c.email, phone: c.phone })
    setFormError('')
    setOpen(true)
  }

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email'
    if (!/^[\d+\-\s]+$/.test(form.phone)) return 'Phone may only contain digits, spaces, dashes, and +'
    const d = digitsOf(form.phone)
    if (d < 7 || d > 15) return 'Phone must contain 7 to 15 digits'
    return ''
  }

  const submit = async () => {
    const problem = validate()
    if (problem) return setFormError(problem)

    const body = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    }

    setSaving(true)
    try {
      if (editing) {
        await Customers.update(editing, body)
        toast.success('Customer updated')
      } else {
        await Customers.create(body)
        toast.success('Customer added')
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
      await Customers.remove(id)
      toast.success('Customer deleted')
      load()
    } catch (e) {
      toast.error(readError(e))
    }
  }

  const filtered = (rows || []).filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    )
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-stone-500">People who place orders with you.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add customer
        </button>
      </div>

      <div className="mb-4">
        <input
          className="field max-w-sm"
          placeholder="Search by name, email, or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {rows === null ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          label={query ? 'No customers match your search.' : 'No customers yet.'}
          hint={query ? 'Try a different search term.' : 'Add your first one with the button above.'}
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[15px]">
            <thead className="text-left text-xs uppercase tracking-wider text-stone-500">
              <tr className="border-b border-stone-200">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-5 py-3 font-medium">{c.full_name}</td>
                  <td className="px-5 py-3 text-stone-500">{c.email}</td>
                  <td className="px-5 py-3 text-stone-500">{c.phone}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="text-accent hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(c)}
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

      <Modal title={editing ? 'Edit customer' : 'Add customer'} open={open} onClose={() => setOpen(false)}>
        {formError && <Notice message={formError} onClose={() => setFormError('')} />}
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              className="field"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="field"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <p className="mt-1 text-xs text-stone-400">
              7–15 digits. Spaces, dashes and a leading + are allowed.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving}>
              {saving ? 'Saving…' : 'Save customer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete customer?"
        message={toDelete ? `${toDelete.full_name} will be removed from your records.` : ''}
        onConfirm={confirmRemove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
