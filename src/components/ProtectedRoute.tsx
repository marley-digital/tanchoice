import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      setIsAuthenticated(!!session)
    }
    checkSession()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-height-screen py-24">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600">Checking session...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

