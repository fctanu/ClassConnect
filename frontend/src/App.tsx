import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';
import { useTheme } from './context/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Button, ThemeToggle } from './components/ui';
import { CheckSquare, LogOut, Search } from 'lucide-react';

export default function App() {
  const { authenticated, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-surface-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <CheckSquare className="w-7 h-7" />
              <span className="font-semibold text-xl dark:text-white">MERN TODO</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {authenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline dark:text-white">Logout</span>
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-gray-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-surface-500 dark:text-gray-400">
            MERN TODO - Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
