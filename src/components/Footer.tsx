import React from 'react';
import { Phone, MapPin, Mail, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_RAW } from '../services/whatsapp';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer id="nosotros" className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                RC
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Multiservicios RC
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Especialistas en climatización integral, mantenimiento preventivo de aires acondicionados, electricidad y plomería técnica en Córdoba Capital y Gran Córdoba.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía escrita de 6 meses</span>
            </div>
          </div>

          {/* Quick Contact & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Canales Oficiales
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/549${OFFICIAL_PHONE_RAW}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-slate-200 hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {OFFICIAL_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-300 font-mono">RenzoCorrea11@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-300">Lunes a Sábados: 08:00 a 20:30 hs</span>
              </li>
            </ul>
          </div>

          {/* Zones in Córdoba */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Zonas de Cobertura
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nueva Córdoba, Centro, General Paz, Alta Córdoba, Cofico, Cerro de las Rosas, Urca, Villa Belgrano, Jardín, Argüello, Villa Allende y alrededores.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Móviles técnicos distribuidos por zonas</span>
            </div>
          </div>

          {/* Management & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Acceso Administrativo
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Panel interno para seguimiento de turnos, confirmación WhatsApp en tiempo real y asignación de técnicos.
            </p>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span>Abrir Panel de Administración</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Quiet Sub-footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Multiservicios RC · Córdoba, Argentina. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <a href="#inicio" className="hover:text-slate-300 transition-colors">Inicio</a>
            <a href="#climatizacion" className="hover:text-slate-300 transition-colors">Climatización</a>
            <a href="#agendar-mantenimiento" className="hover:text-slate-300 transition-colors">Agendar</a>
            <a href="#servicios" className="hover:text-slate-300 transition-colors">Servicios</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
