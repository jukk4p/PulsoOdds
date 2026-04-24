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
    <div className="relative min-h-screen bg-bg-base flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 group">
          <div className="bg-accent p-2 rounded-sm rotate-12 group-hover:rotate-0 transition-all duration-500 shadow-[0_0_20px_rgba(200,255,0,0.3)]">
            <Zap className="h-10 w-10 text-bg-base fill-current" />
          </div>
          <h1 className="mt-6 text-4xl font-display font-black text-text-primary tracking-tighter uppercase">
            PULSO<span className="text-accent">ODDS</span>
          </h1>
          <p className="text-text-muted text-[10px] font-black tracking-[0.4em] uppercase mt-2">Acceso de Analista</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-surface border border-border-base rounded-lg p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-bg-base border border-border-base rounded-sm py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/30 focus:border-accent/40 focus:bg-bg-base transition-all text-xs font-mono font-bold"
                  placeholder="usuario@pulsoodds.com"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-bg-base border border-border-base rounded-sm py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/30 focus:border-accent/40 focus:bg-bg-base transition-all text-xs font-mono font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg-base font-black py-5 rounded-sm flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(200,255,0,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale uppercase text-[11px] tracking-[0.2em]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <Zap size={14} className="fill-current" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-text-muted text-[10px] font-black uppercase tracking-widest opacity-30 font-mono">
          © {new Date().getFullYear()} PULSOODDS SYSTEM V4.0
        </p>
      </div>
    </div>
  );
}
