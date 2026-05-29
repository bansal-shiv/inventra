import { NavLink, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
]

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-stone-200 bg-white md:w-56 md:shrink-0 md:border-b-0 md:border-r">
          <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible md:py-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-accent text-white shadow-soft'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-5 py-6 md:px-10 md:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '8px', fontSize: '14px' },
          success: { iconTheme: { primary: '#3b5bdb', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
