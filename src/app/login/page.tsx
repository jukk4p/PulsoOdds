'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Zap, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales inválidas. Revisa tu acceso.');
      setLoading(false);
    } else {
      router.push('/admin/picks');
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo Block */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="bg-neon-green p-1.5 rounded-lg rotate-12 group-hover:rotate-0 transition-all">
              <Zap className="h-6 w-6 text-black fill-black" />
            </div>
            <span className="text-3xl font-black italic tracking-tighter text-white">
              PULSO<span className="text-neon-green">ODDS</span>
            </span>
          </Link>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Portal de Administración</h1>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email de Acceso</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-neon-green transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pulsoodds.com"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:border-neon-green/30 focus:bg-white/[0.08] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-neon-green transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:border-neon-green/30 focus:bg-white/[0.08] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <p className="text-xs font-bold text-red-500/80 tracking-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale uppercase text-xs tracking-widest"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Entrar al Centro de Mando
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-[10px] text-white/20 font-medium uppercase tracking-[0.2em]">
          Protegido por Supabase Protocol
        </p>
      </div>
    </div>
  );
}
