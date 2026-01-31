import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import api from '../services/api';
import axios from 'axios';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { Mail, Lock, ArrowRight, PenSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { authenticated, ready, login } = useAuth();

  React.useEffect(() => {
    if (ready && authenticated) {
      navigate('/');
    }
  }, [ready, authenticated, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { accessToken } = res.data;
      login(accessToken);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      let message = 'Login failed. Please try again.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 animate-in bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link to="/" className="flex items-center justify-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <PenSquare className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
            ClassConnect
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                className="w-full mt-2 gap-2"
                loading={loading}
                size="lg"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
