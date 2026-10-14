import React, { useState } from 'react';
import { MessageCircle, Phone, X, Calendar, Wrench, Shield } from 'lucide-react';
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_RAW, buildWhatsAppUrl } from '../services/whatsapp';

export const WhatsAppDirectWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDirect = (customPrompt?: string) => {
    const text = customPrompt || 'Hola Multiservicios RC! Me comunico desde la web para realizar una consulta técnica.';
    const url = buildWhatsAppUrl(OFFICIAL_PHONE_RAW, text);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      
      {/* Popover options */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Multiservicios RC</div>
                <div className="text-[11px] text-emerald-600 font-medium">Línea Oficial WhatsApp</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-600 leading-relaxed">
            ¿En qué podemos ayudarte hoy? Envíanos un mensaje directo al <strong className="text-slate-900 font-mono">{OFFICIAL_PHONE_DISPLAY}</strong>.
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOpenDirect('¡Hola! Quisiera solicitar presupuesto para mantenimiento preventivo de aire acondicionado.')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="line-clamp-1">Consultar Mantenimiento de Aire</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDirect('¡Hola! Necesito una instalación técnica matriculada de aire acondicionado.')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span className="line-clamp-1">Instalación Matriculada</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDirect('¡Hola! Tengo una urgencia técnica en mi domicilio / comercio.')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="line-clamp-1">Consulta Urgente</span>
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Respuesta habitual: &lt; 15 min</span>
            <span className="font-mono">Córdoba Cap.</span>
          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de WhatsApp con Multiservicios RC"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer font-bold text-xs"
      >
        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-mono tabular-nums">{OFFICIAL_PHONE_DISPLAY}</span>
        <span className="sm:hidden">WhatsApp</span>
      </button>

    </div>
  );
};
