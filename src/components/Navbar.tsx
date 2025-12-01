import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '../lib/auth'

const navLinks = [
  { path: '/suppliers', label: 'Suppliers' },
  { path: '/trips', label: 'Trips' },
  { path: '/reports/suppliers', label: 'Reports' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      setUserEmail(user?.email ?? '')
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/trips" className="text-lg font-semibold tracking-wide">
              TANCHOICE LIMITED – Simply Organic
            </Link>
            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    location.pathname.startsWith(link.path)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && <span className="text-sm text-slate-200">{userEmail}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

