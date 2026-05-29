import { useEffect, useState } from 'react'
import { Stats, readError } from '../api/client'
import { money, shortDate } from '../api/format'
import { Loading } from '../components/States'
import Notice from '../components/Notice'

function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Stats.dashboard().then(setData).catch((e) => setError(readError(e)))
  }, [])

  if (error) return <Notice message={error} onClose={() => setError('')} />
  if (!data) return <Loading />

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">
          A snapshot of your inventory, customers, and orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Products" value={data.total_products} hint="Items in catalogue" />
        <StatCard label="Customers" value={data.total_customers} hint="Registered accounts" />
        <StatCard label="Orders" value={data.total_orders} hint="Placed to date" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Low stock</h2>
            <span className="text-xs text-stone-400">≤ {data.low_stock_threshold} units</span>
          </div>

          {data.low_stock_products.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.low_stock_products.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-stone-400">{p.sku}</div>
                  </div>
                  <span className={p.quantity <= 5 ? 'badge-danger' : 'badge-warn'}>
                    {p.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <span className="text-xs text-stone-400">Latest 5</span>
          </div>

          {data.recent_orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recent_orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">
                      #{o.id} · {o.customer_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-stone-400">
                      {o.item_count} item{o.item_count === 1 ? '' : 's'} · {shortDate(o.created_at)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{money(o.total_amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
