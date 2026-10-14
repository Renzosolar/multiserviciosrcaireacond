import React, { useState } from 'react';
import { Wrench, Zap, Droplets, Building2, MessageCircle, ArrowRight } from 'lucide-react';
import { ServiceCategory, ServiceItem } from '../types';
import { buildWhatsAppUrl, OFFICIAL_PHONE_RAW } from '../services/whatsapp';

interface ServicesGridProps {
  services: ServiceItem[];
  onSelectServiceForBooking: (service: ServiceItem) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ services, onSelectServiceForBooking }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ServiceCategory>('all');

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter((s) => s.category === activeCategory);

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'climatizacion':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'electricidad':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'plomeria':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'edilicio':
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleWhatsAppConsult = (service: ServiceItem) => {
    const text = `Hola Multiservicios RC! Quisiera solicitar presupuesto o información técnica para el servicio: *${service.title}*. Muchas gracias.`;
    const url = buildWhatsAppUrl(OFFICIAL_PHONE_RAW, text);
    window.open(url, '_blank');
  };

  return (
    <section id="servicios" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
              <span>Catálogo Técnico Completo</span>
              <span aria-hidden="true">·</span>
              <span>Soluciones Integrales</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Todos los Servicios de Multiservicios RC
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Desde climatización y tableros eléctricos hasta presurización de agua y abonos preventivos para oficinas y viviendas.
            </p>
          </div>

          {/* Interactive filter tabs (segmented control) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl self-start md:self-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'climatizacion', label: 'Climatización' },
              { id: 'electricidad', label: 'Electricidad' },
              { id: 'plomeria', label: 'Plomería' },
              { id: 'edilicio', label: 'Edilicio' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Optional Service Image */}
                {service.imagePath && (
                  <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={service.imagePath}
                      alt={service.title}
                      className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-900 flex items-center gap-1.5 shadow-xs">
                      {getCategoryIcon(service.category)}
                      <span className="capitalize">{service.category}</span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {!service.imagePath && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        {getCategoryIcon(service.category)}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {service.shortDesc}
                  </p>

                  {/* Highlights list */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    {service.highlights.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">·</span>
                        <span className="line-clamp-2">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer with Price and Quick Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Tarifa base desde</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                    ${service.basePrice.toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppConsult(service)}
                    title="Consultar por WhatsApp"
                    className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {service.category === 'climatizacion' ? (
                    <a
                      href="#agendar-mantenimiento"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      <span>Agendar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppConsult(service)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
