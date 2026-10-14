import React from 'react';
import { ShieldCheck, Wind, Gauge, Droplets, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface ClimatizacionShowcaseProps {
  onScheduleClick: () => void;
}

export const ClimatizacionShowcase: React.FC<ClimatizacionShowcaseProps> = ({ onScheduleClick }) => {
  return (
    <section id="climatizacion" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <span>Especialidad Principal</span>
            <span aria-hidden="true">·</span>
            <span>Climatización Profesional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            ¿Por qué el mantenimiento preventivo es indispensable cada año?
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Un aire acondicionado sin mantenimiento acumula capas de moho y bacterias que respiras a diario, forzando al compresor a trabajar con sobrepresión y disparando el consumo en la boleta de luz. En Multiservicios RC aplicamos tecnología de lavado hidrostático hermético.
          </p>
        </div>

        {/* Asymmetric Bento Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-12">
          
          {/* Card 1: Visual focus on deep cleaning (7 Cols) */}
          <div className="md:col-span-7 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Protocolo Limpio sin Manchas</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Lavado profundo con tolva y bactericida de grado técnico
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Desarmamos la carcasa plástica del split e instalamos una bacha de contención impermeable conectada a desagüe para lavar a presión la turbina y la serpentina sin salpicar ni una sola gota en tus paredes, muebles o pisos.
              </p>
              
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eliminación de bacterias causantes de legionella y alergias respiratorias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Desobstrucción completa de la manguera y bandeja de condensado</span>
                </div>
              </div>
            </div>

            <div className="relative h-64 sm:h-72 w-full overflow-hidden border-t border-slate-200 bg-slate-900">
              <img
                src="/src/assets/images/ac_preventive_cleaning_1791959647634.jpg"
                alt="Limpieza preventiva profunda de evaporadora de aire acondicionado con tolva y presurizadora"
                className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Card 2: Visual focus on outdoor condenser & pressures (5 Cols) */}
          <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>Presiones & Motocompresor</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Control manométrico de refrigerante y vacío
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Chequeamos el salto térmico, sobrecalentamiento y la carga de refrigerante con manómetros calibrados para garantizar que el compresor trabaje liviano en días de calor extremo.
              </p>
            </div>

            <div className="relative h-56 sm:h-64 w-full overflow-hidden border-t border-slate-200 bg-slate-900">
              <img
                src="/src/assets/images/ac_installation_outdoor_1791959647658.jpg"
                alt="Revisión técnica de unidad exterior de aire acondicionado con manómetros"
                className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>

        {/* 3 Pillars of Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">Ahorro hasta 30% de Energía</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cuando la turbina está obstruida por pelusa y hollín, el forzador gira con resistencia y el equipo tarda el doble de tiempo en alcanzar la temperatura consignada.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Wind className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">Aire Puro y Libre de Olores</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El serpentín húmedo es el hábitat predilecto de hongos y esporas. Nuestro bactericida neutro higieniza a fondo el conducto de aire para respirar salud en tu hogar.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">Extiende la Vida Útil</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El 78% de los compresores quemados en verano sufren por falta de mantenimiento preventivo y excesiva temperatura de descarga. Prevenir cuesta una fracción de reparar.
            </p>
          </div>
        </div>

        {/* Callout Strip */}
        <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              ¿Tu aire no enfría como antes?
            </div>
            <div className="text-lg font-bold mt-1">
              Agenda tu mantenimiento preventivo hoy y aprovecha turnos para esta semana.
            </div>
          </div>
          <button
            onClick={onScheduleClick}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Agendar Ahora
          </button>
        </div>

      </div>
    </section>
  );
};
