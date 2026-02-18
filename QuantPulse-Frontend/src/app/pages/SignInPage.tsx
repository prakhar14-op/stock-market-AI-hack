import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Delay login to show success message
      setTimeout(() => {
        login(email);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#3A6FF8] shadow-sm shadow-blue-500/20">
            <BarChart3 className="size-6 text-white" />
          </div>
          <span className="text-2xl text-zinc-100">QuantPulse India</span>
        </Link>

        <Card variant="elevated" className="p-9 shadow-2xl shadow-blue-900/10 border-[#3A6FF8]/20">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isSubmitting || isSuccess}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isSubmitting || isSuccess}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[rgba(100,150,255,0.2)] bg-[rgba(15,23,42,0.6)] text-[#3A6FF8]"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-[#5B8DFF] hover:text-[#7AA3FF] font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant={isSuccess ? "outline" : "prominent"} // Use a different variant or style for success if available, else just prominent
              className={`w-full h-11 text-base mt-2 ${isSuccess ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20" : ""}`}
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : isSuccess ? (
                <>
                  Success! Redirecting...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(100,150,255,0.1)] text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#5B8DFF] hover:text-[#7AA3FF] font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-center text-blue-200">
              <strong>Demo Mode:</strong> No real account required. Enter any email/password to sign in.
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-zinc-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
