import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Suppliers from './pages/Suppliers'
import Trips from './pages/Trips'
import TripForm from './pages/TripForm'
import TripDetail from './pages/TripDetail'
import SupplierReports from './pages/SupplierReports'
import SupplierDetailReport from './pages/SupplierDetailReport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <TripForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/edit"
          element={
            <ProtectedRoute>
              <TripForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/suppliers"
          element={
            <ProtectedRoute>
              <SupplierReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/suppliers/:supplierId"
          element={
            <ProtectedRoute>
              <SupplierDetailReport />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/trips" replace />} />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
