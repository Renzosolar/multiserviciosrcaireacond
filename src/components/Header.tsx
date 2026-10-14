import React from 'react';
import { Phone, ShieldCheck, LayoutDashboard, Globe, Wrench } from 'lucide-react';
import { OFFICIAL_PHONE_DISPLAY } from '../services/whatsapp';

interface HeaderProps {
  currentView: 'client' | 'admin';
  onViewChange: (view: 'client' | 'admin') => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, pendingCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <a 
          href="#inicio" 
          onClick={(e) => {
            if (currentView === 'admin') {
              e.preventDefault();
              onViewChange('client');
            }
          }}
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            RC
          </div>
          <span>Multiservicios RC</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <a 
            href="#climatizacion" 
            onClick={() => { if (currentView === 'admin') onViewChange('client'); }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            Climatización
          </a>
          <a 
            href="#agendar-mantenimiento" 
            onClick={() => { if (currentView === 'admin') onViewChange('client'); }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 text-blue-700 font-semibold"
          >
            Agendar Mantenimiento
          </a>
          <a 
            href="#servicios" 
            onClick={() => { if (currentView === 'admin') onViewChange('client'); }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            Otros Servicios
          </a>
          <a 
            href="#nosotros" 
            onClick={() => { if (currentView === 'admin') onViewChange('client'); }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            Garantía & Cobertura
          </a>
        </nav>

        {/* Zone 3: 1 primary action (or mode switcher) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/5493517962450?text=Hola%20Multiservicios%20RC,%20quisiera%20hacer%20una%20consulta%20técnica"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-mono tabular-nums">{OFFICIAL_PHONE_DISPLAY}</span>
          </a>

          {currentView === 'client' ? (
            <button
              onClick={() => onViewChange('admin')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Panel de Administración</span>
              {pendingCount > 0 && (
                <span className="ml-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[11px] font-mono tabular-nums">
                  {pendingCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onViewChange('client')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-all whitespace-nowrap shrink-0"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Volver a la Web</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
