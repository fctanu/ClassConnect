import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostDetails from './pages/PostDetails';
import { Button } from './components/ui';
import { GraduationCap, LogOut } from 'lucide-react';

export default function App() {
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!cancelled) {
          setApiStatus(res.ok ? 'online' : 'offline');
        }
      } catch {
        if (!cancelled) setApiStatus('offline');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1220] text-white backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 group"
              >
                <div className="bg-lime-400/20 p-2 rounded-lg group-hover:bg-lime-400/30 transition-colors">
                  <GraduationCap className="w-5 h-5 text-lime-400" />
                </div>
                <span className="font-heading font-bold text-xl tracking-tight text-white">ClassConnect</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 ml-8">
                <Link
                  to="/forum"
                  className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Forum
                </Link>
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                  apiStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                  }`} />
                <span className="text-[10px] sm:text-xs font-medium text-white/70">
                  {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Loading...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {authenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-white hover:text-white hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn btn-sm bg-transparent text-white hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-sm bg-lime-500 text-[#0B1220] hover:bg-lime-400 font-bold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/forum" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetails />} />
        </Routes>
      </main>

      {/* Compact Footer */}
      <footer className="border-t border-border mt-auto bg-[#0B1220] text-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Simple compact footer */}
          <div className="md:hidden text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-white">ClassConnect</span>
            </div>
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} ClassConnect. All rights reserved.
            </p>
          </div>

          {/* Desktop: Full footer */}
          <div className="hidden md:grid grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-xl tracking-tight text-white">ClassConnect</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                Empowering students to connect, collaborate, and succeed.
              </p>
            </div>

            {/* Platform Column */}
            <div className="space-y-4">
              <h4 className="font-bold text-white tracking-wide">Platform</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">Study Groups</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Resource Sharing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mentorship</a></li>
              </ul>
            </div>

            {/* Community Column */}
            <div className="space-y-4">
              <h4 className="font-bold text-white tracking-wide">Community</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h4 className="font-bold text-white tracking-wide">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Desktop copyright */}
          <div className="hidden md:flex border-t border-white/10 mt-12 pt-8 justify-between items-center">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} ClassConnect. All rights reserved.
            </p>
            <span className="text-sm text-white/60">Built for Students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
