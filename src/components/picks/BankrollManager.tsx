"use client";

import { useState, useEffect } from "react";
import { Wallet, Settings2, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function BankrollManager() {
  const [bankroll, setBankroll] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pulso_bankroll");
    if (saved) {
      setBankroll(saved);
    }
  }, []);

  const handleUpdate = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    
    setBankroll(cleaned);
    localStorage.setItem("pulso_bankroll", cleaned);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("bankroll-updated", { detail: cleaned }));
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent/50 transition-all duration-300 group cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Wallet className="w-3.5 h-3.5 text-accent" />
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/60">BANKROLL</span>
          <span className="text-xs font-black text-text-primary tabular-nums">
            {bankroll ? `${Number(bankroll).toLocaleString()}€` : "0€"}
          </span>
        </div>
        <Settings2 className={cn("w-3 h-3 text-text-muted/40 group-hover:text-accent transition-all", isOpen && "rotate-90")} />
      </div>

      {/* Refined Popover */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-64 bg-[#0D121A] border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 animate-in fade-in zoom-in-95 duration-300 z-[100]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-sm bg-accent/10 border border-accent/20">
              <Calculator className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Gestión de Stake</h3>
              <p className="text-[10px] font-medium text-text-muted">Configura tu capital para cálculos</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Presupuesto Total (€)</label>
              <input 
                type="text"
                value={bankroll}
                onChange={(e) => handleUpdate(e.target.value)}
                placeholder="Ej: 1000"
                className="w-full bg-bg-base border border-border-base rounded-sm py-3 px-4 text-xs font-bold text-text-primary focus:outline-none focus:border-accent transition-all"
              />
            </div>
            
            <div className="p-4 rounded-sm bg-bg-base/50 border border-border-base italic">
              <p className="text-[10px] leading-relaxed text-text-muted">
                <strong className="text-accent">¿Cómo funciona?</strong> Calculamos tu apuesta según el Stake (1 Stake = 1% de tu bankroll).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
