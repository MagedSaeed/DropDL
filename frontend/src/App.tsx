import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Navbar from './components/Navbar/Navbar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import DownloadPage from './pages/Download/DownloadPage'
import HistoryPage from './pages/History/HistoryPage'
import LoginPage from './pages/Login/LoginPage'

function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DownloadPage />} />
                <Route path="/app" element={<DownloadPage />} />
                <Route path="/app/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/app/history" element={<HistoryPage />} />
                </Route>
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
