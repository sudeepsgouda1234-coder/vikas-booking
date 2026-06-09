import React, { useState } from 'react';
import { ShieldAlert, User, Key, ArrowRight, X, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('vikas');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!username.trim() || !password.trim()) {
      setErrorText('Please load both administrator keys.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Identity credentials validation failed.');
      }

      onLoginSuccess(body.token);
    } catch (err: any) {
      setErrorText(err.message || 'Incorrect passphrase verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#111113] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Subtle premium accent ring */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold to-gold-dark" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 mt-2">
            <div className="h-12 w-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center mx-auto border border-gold/20 shadow-sm">
              <ShieldAlert className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-extrabold text-lg text-white font-display">Identity Verification</h3>
            <p className="text-xs text-white/40">
              Auth secure session to view scheduled bookings and manage availability slots.
            </p>
          </div>

          {/* Sandbox Credentials Auto-hint */}
          <div className="p-3.5 bg-black/40 border border-gold/20 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-gold block tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-gold animate-pulse" />
              Demo Developer Credentials
            </span>
            <div className="text-[11px] text-white/60 font-mono space-y-1">
              <div>Username: <strong className="text-white">vikas</strong></div>
              <div>Password: <strong className="text-white">password123</strong></div>
            </div>
          </div>

          {errorText && (
            <p className="p-3 bg-red-500/10 border border-red-500/10 text-red-550 text-xs font-semibold rounded-xl text-center font-mono">
              {errorText}
            </p>
          )}

          <div className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  required
                  placeholder="vikas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 placeholder-white/20 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Passphrase</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 placeholder-white/20 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Login actions trigger */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-white text-black hover:bg-gold font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xl active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Unlock Admin Panel
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
