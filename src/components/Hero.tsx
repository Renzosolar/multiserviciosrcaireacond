import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, Zap, Award, CheckCircle2, MessageCircle } from 'lucide-react';
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_E164 } from '../services/whatsapp';

interface HeroProps {
  onScheduleClick: () => void;
}

interface ComfortSlide {
  id: string;
  image: string;
  tag: string;
  environment: string;
  metric: string;
  title: string;
  description: string;
}

const COMFORT_SLIDES: ComfortSlide[] = [
  {
    id: 'family',
    image: '/src/assets/images/ac_comfort_family_1791960618168.jpg',
    tag: 'Confort Familiar',
    environment: 'Living & Espacios Comunes',
    metric: '24°C Clima Ideal',
    title: 'Disfruta del hogar con aire puro y temperatura perfecta',
    description: 'Ambientes frescos, libres de humedad sofocante y sin malos olores gracias al mantenimiento preventivo periódico con bactericida.',
  },
  {
    id: 'bedroom',
    image: '/src/assets/images/ac_comfort_bedroom_1791960618715.jpg',
    tag: 'Sueño Tranquilo',
    environment: 'Dormitorios Principales',
    metric: '19 dB Ultra Silencioso',
    title: 'Descanso profundo sin ruidos ni goteos nocturnos',
    description: 'La limpieza de la turbina elimina vibraciones molestas y ruidos mecánicos para un descanso reparador toda la noche.',
  },
  {
    id: 'homeoffice',
    image: '/src/assets/images/ac_comfort_homeoffice_1791960618842.jpg',
    tag: 'Productividad',
    environment: 'Home Office & Estudios',
    metric: 'Ahorro 30% Luz',
    title: 'Trabaja cómodo y concentrado en días de calor',
    description: 'Un equipo calibrado con su carga óptima de gas enfría en pocos minutos manteniendo un consumo energético eficiente.',
  },
  {
    id: 'technical',
    image: '/src/assets/images/hero_ac_service_1791959647609.jpg',
    tag: 'Garantía Técnica',
    environment: 'Servicio Matriculado',
    metric: '6 Meses Garantía',
    title: 'Diagnóstico técnico con instrumental de precisión',
    description: 'Técnicos especialistas de Multiservicios RC con manómetros digitales, bacha impermeable y protocolo limpio.',
  },
];

export const Hero: React.FC<HeroProps> = ({ onScheduleClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % COMFORT_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % COMFORT_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + COMFORT_SLIDES.length) % COMFORT_SLIDES.length);
  };

  return (
    <section id="inicio" className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Hero: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center py-2">
            
            {/* Clean unboxed metadata kicker */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-700 mb-4 tracking-wide">
              <span>Especialistas en Climatización</span>
              <span aria-hidden="true">·</span>
              <span>Técnicos Matriculados</span>
              <span aria-hidden="true">·</span>
              <span>Córdoba Capital</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance mb-6">
              Mantenimiento preventivo e instalación de aires acondicionados con garantía escrita
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              En <strong className="text-slate-900 font-semibold">Multiservicios RC</strong> cuidamos la salud de tu familia y la vida útil de tus equipos. Realizamos limpieza técnica profunda con bacha impermeable sin ensuciar tus paredes, control manométrico de refrigerante y soporte integral en electricidad y plomería.
            </p>

            {/* CTAs block */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <button
                onClick={onScheduleClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Mantenimiento Preventivo</span>
              </button>

              <a
                href={`https://wa.me/${OFFICIAL_PHONE_E164}?text=Hola%20Multiservicios%20RC,%20quisiera%20consultar%20por%20un%20servicio%20técnico%20de%20aire%20acondicionado.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {OFFICIAL_PHONE_DISPLAY}</span>
              </a>
            </div>

            {/* Micro value highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sin ensuciar tu casa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bactericida certificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confirmación inmediata</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Comfort Image Carousel (Bootstrap style) */}
          <div className="lg:col-span-5 relative flex items-center">
            <div 
              className="w-full h-full min-h-[360px] sm:min-h-[440px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 relative group flex flex-col justify-end"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Active Comfort Image matching the selected CSS selector */}
              <img
                src={COMFORT_SLIDES[currentSlide].image}
                alt={COMFORT_SLIDES[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add('bg-gradient-to-tr', 'from-blue-900', 'to-slate-800');
                  }
                }}
              />

              {/* Scrim overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />

              {/* Top Bar inside image: Pill status & Slide indicators */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-blue-900 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{COMFORT_SLIDES[currentSlide].tag}</span>
                </span>

                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-white text-[10px] font-mono tabular-nums">
                  <span>0{currentSlide + 1}</span>
                  <span className="opacity-50">/</span>
                  <span className="opacity-50">0{COMFORT_SLIDES.length}</span>
                </div>
              </div>

              {/* Navigation arrows (Carousel Prev / Next buttons) */}
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Imagen anterior de confort"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Siguiente imagen de confort"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
              >
                ›
              </button>

              {/* Bottom Comfort Details Card */}
              <div className="relative z-10 p-4 sm:p-5 m-3 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-slate-900 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-blue-700">{COMFORT_SLIDES[currentSlide].environment}</span>
                  <span className="font-mono text-emerald-700 font-semibold">{COMFORT_SLIDES[currentSlide].metric}</span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-900">
                  {COMFORT_SLIDES[currentSlide].title}
                </h4>
                
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {COMFORT_SLIDES[currentSlide].description}
                </p>

                {/* Thumbnail dots selector */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    {COMFORT_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Ver diapositiva ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Confort Multiservicios RC</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4-column Proof / KPI strip below the hero split */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
              +1.200
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">Aires Acondicionados</div>
            <div className="text-xs text-slate-500 mt-0.5">Mantenidos con éxito en Córdoba</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              100%
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">Técnicos Matriculados</div>
            <div className="text-xs text-slate-500 mt-0.5">Normas IRAM y seguridad eléctrica</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
              6 Meses
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">Garantía por Escrito</div>
            <div className="text-xs text-slate-500 mt-0.5">En services integrales e instalaciones</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              &lt; 15 min
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">Respuesta WhatsApp</div>
            <div className="text-xs text-slate-500 mt-0.5">Línea directa oficial 3517962450</div>
          </div>
        </div>

      </div>
    </section>
  );
};
