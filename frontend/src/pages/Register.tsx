import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FinTrackLogo } from '../components/common/FinTrackLogo';
import { Button } from '../components/common/Button';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName: lastName || undefined,
        email,
        password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-[#0F0F0F]">
      {/* Left Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          <FinTrackLogo size="md" />
        </div>

        <div className="max-w-md w-full mx-auto my-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F0F0F] tracking-tight">Create Your Account</h1>
            <p className="text-sm text-[#606060] mt-2">
              Start managing your expenses, revenues, and budgets with FinTrack.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#606060] uppercase tracking-wider mb-2">
                  First Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#606060]">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full h-11 pl-10 pr-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#606060] uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full h-11 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606060] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#606060]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.smith@example.com"
                  className="w-full h-11 pl-10 pr-4 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606060] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#606060]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#606060] mt-1.5">
                Must be at least 6 characters long.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 rounded-xl text-sm font-bold shadow-md gap-2 mt-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
            <p className="text-sm text-[#606060]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#065FD4] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-xs text-[#606060] text-center lg:text-left">
          &copy; {new Date().getFullYear()} FinTrack Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Hero Graphic Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F0F0F] p-12 flex-col justify-between items-center relative overflow-hidden">
        <div className="w-full flex justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#2BA640]" />
            Default Categories Pre-configured
          </span>
        </div>

        <div className="w-full max-w-lg my-auto">
          <img
            src="/fintrack-hero.svg"
            alt="FinTrack Financial Suite"
            className="w-full rounded-2xl shadow-2xl border border-white/10"
          />
          <div className="mt-8 text-center text-white">
            <h2 className="text-2xl font-bold">14 Ready-to-Use Categories</h2>
            <p className="text-[#AAAAAA] text-sm mt-2 max-w-md mx-auto">
              From Groceries and Rent to Freelancing and Investments, your account will be immediately prepared for tracking.
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-between text-xs text-[#606060] font-mono">
          <span>ZERO OVERHEAD</span>
          <span>ENTERPRISE CLEAN ARCHITECTURE</span>
        </div>
      </div>
    </div>
  );
};
