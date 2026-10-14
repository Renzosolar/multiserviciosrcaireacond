import React, { useState } from 'react';
import { 
  Calendar, Clock, Check, Wrench, Shield, AlertCircle, Sparkles, 
  ChevronRight, Phone, MessageCircle, MapPin, User, FileText, CheckCircle2,
  Copy, ExternalLink
} from 'lucide-react';
import { 
  EquipmentType, FrigoriasOption, MaintenancePackageId, ServiceOrder 
} from '../types';
import { MAINTENANCE_PACKAGES } from '../data/seedData';
import { 
  buildWhatsAppUrl, generateClientBookingMessage, OFFICIAL_PHONE_DISPLAY, 
  OFFICIAL_PHONE_RAW, OFFICIAL_PHONE_E164 
} from '../services/whatsapp';

interface AcPreventiveSchedulerProps {
  onOrderCreated: (order: ServiceOrder) => void;
}

const EQUIPMENT_OPTIONS: { id: EquipmentType; label: string; desc: string }[] = [
  { id: 'split_residencial', label: 'Split Residencial', desc: 'Mural tradicional frío o frío/calor' },
  { id: 'split_inverter', label: 'Split Inverter', desc: 'Tecnología inverter de alta eficiencia' },
  { id: 'piso_techo', label: 'Piso - Techo', desc: 'Equipos comerciales de mayor caudal' },
  { id: 'multi_split', label: 'Multi-Split', desc: 'Una unidad exterior con varias interiores' },
  { id: 'cassette', label: 'Cassette Empotrado', desc: 'Instalado al cielorraso en oficinas/locales' },
  { id: 'central_conducto', label: 'Central por Conductos', desc: 'Climatización zonificada por rejillas' },
];

const FRIGORIAS_OPTIONS: { id: FrigoriasOption; label: string; btu: string }[] = [
  { id: '2250', label: '2.250 Frig.', btu: '9.000 BTU' },
  { id: '3000', label: '3.000 Frig.', btu: '12.000 BTU (Más habitual)' },
  { id: '4500', label: '4.500 Frig.', btu: '18.000 BTU' },
  { id: '6000', label: '6.000 Frig.', btu: '24.000 BTU' },
  { id: 'mayor_6000', label: '+6.000 Frig.', btu: 'Industrial / Gran porte' },
];

const COMMON_SYMPTOMS = [
  'Olor a humedad o moho al encender',
  'Gotea agua hacia adentro',
  'Enfría poco o tarda mucho en aclimatar',
  'Congela la cañería exterior o serpentina',
  'Ruido o vibración en la turbina interna',
  'Hace más de 1 año no se limpia a fondo',
];

export const AcPreventiveScheduler: React.FC<AcPreventiveSchedulerProps> = ({ onOrderCreated }) => {
  // Form State
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('split_residencial');
  const [frigorias, setFrigorias] = useState<FrigoriasOption>('3000');
  const [selectedPackageId, setSelectedPackageId] = useState<MaintenancePackageId>('preventivo_profundo');
  const [unitsCount, setUnitsCount] = useState<number>(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // Date & Shift State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  
  const [preferredDate, setPreferredDate] = useState<string>(minDateStr);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'manana' | 'siesta' | 'tarde'>('manana');

  // Client Info State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // UI Flow State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ServiceOrder | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Price Calculation
  const activePackage = MAINTENANCE_PACKAGES.find((p) => p.id === selectedPackageId) || MAINTENANCE_PACKAGES[1];
  
  // Size multiplier
  const sizeMultiplier = 
    frigorias === '2250' ? 0.95 :
    frigorias === '3000' ? 1.0 :
    frigorias === '4500' ? 1.15 :
    frigorias === '6000' ? 1.3 : 1.5;

  const baseUnitPrice = Math.round(activePackage.basePrice * sizeMultiplier);
  const subtotal = baseUnitPrice * unitsCount;
  // 10% discount for 2 or more units
  const discount = unitsCount > 1 ? Math.round(subtotal * 0.1) : 0;
  const estimatedTotal = subtotal - discount;

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!clientName.trim()) errors.clientName = 'Por favor ingresa tu nombre y apellido';
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 8) {
      errors.clientPhone = 'Ingresa un número de WhatsApp válido (ej. 351 7962450)';
    }
    if (!address.trim()) errors.address = 'Ingresa la calle y altura de tu domicilio';
    if (!neighborhood.trim()) errors.neighborhood = 'Ingresa el barrio (ej. Nueva Córdoba, General Paz, etc.)';
    if (!preferredDate) errors.preferredDate = 'Selecciona una fecha preferida';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const newOrderData: Omit<ServiceOrder, 'id' | 'ticketCode' | 'createdAt' | 'updatedAt'> = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: 'Córdoba Capital',
      serviceCategory: 'climatizacion',
      serviceTitle: `${activePackage.name} (${unitsCount} ${unitsCount === 1 ? 'unidad' : 'unidades'})`,
      equipmentType,
      frigorias,
      unitsCount,
      maintenancePackageId: selectedPackageId,
      equipmentSymptoms: selectedSymptoms,
      clientNotes: clientNotes.trim() || undefined,
      preferredDate,
      preferredTimeSlot,
      status: 'pendiente',
      estimatedPrice: estimatedTotal,
      technicianAssigned: 'Renzo Correa (Técnico Matriculado)',
      internalNotes: `Solicitud web de mantenimiento preventivo. Equipo: ${equipmentType}, ${frigorias} fg.`,
    };

    try {
      // Create in DB
      onOrderCreated(newOrderData as any);
      // Construct created object for immediate local modal display
      const tempOrder: ServiceOrder = {
        ...newOrderData,
        id: `ord-${Date.now()}`,
        ticketCode: `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConfirmedOrder(tempOrder);
    } catch (err) {
      console.error('Error creating order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!confirmedOrder) return;
    const message = generateClientBookingMessage(confirmedOrder);
    const url = buildWhatsAppUrl(OFFICIAL_PHONE_RAW, message);
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    if (!confirmedOrder) return;
    const message = generateClientBookingMessage(confirmedOrder);
    navigator.clipboard.writeText(message);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <section id="agendar-mantenimiento" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <span>Sección Exclusiva de Climatización</span>
            <span aria-hidden="true">·</span>
            <span>Atención Inmediata</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Agendar Mantenimiento Técnico Preventivo de Aire Acondicionado
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Configura el tipo de equipo, elige el nivel de mantenimiento y reserva el turno que mejor se adapte a tus horarios. La cita se registra en tiempo real y genera tu confirmación automática directa a nuestro WhatsApp oficial: <strong className="text-slate-900">{OFFICIAL_PHONE_DISPLAY}</strong>.
          </p>
        </div>

        {/* Interactive Booking Studio Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Configuration Steps (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Equipment Type */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Tipo de Equipo</h3>
                </div>
                <span className="text-xs text-slate-500">Selecciona el formato de tu equipo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEquipmentType(item.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      equipmentType === item.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                      <span>{item.label}</span>
                      {equipmentType === item.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Frigorías & Units Count */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Capacidad (Frigorías) y Cantidad</h3>
                </div>
                <span className="text-xs text-slate-500">Aproximado según ambiente</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
                {FRIGORIAS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrigorias(opt.id)}
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                      frigorias === opt.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 ${frigorias === opt.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {opt.btu}
                    </div>
                  </button>
                ))}
              </div>

              {/* Units counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">¿Cuántos equipos deseas mantener?</div>
                  <div className="text-xs text-slate-500">
                    Aprovecha un <span className="font-semibold text-emerald-600">10% de descuento</span> a partir de la segunda unidad.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUnitsCount(Math.max(1, unitsCount - 1))}
                    disabled={unitsCount <= 1}
                    className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-slate-900 w-8 text-center tabular-nums">
                    {unitsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitsCount(unitsCount + 1)}
                    className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Maintenance Package */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Nivel de Mantenimiento Requerido</h3>
                </div>
                <span className="text-xs text-slate-500">Protocolo técnico homologado</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MAINTENANCE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const isRecommended = pkg.id === 'preventivo_profundo';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        {/* Header of package */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">{pkg.name}</h4>
                              {isRecommended && (
                                <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{pkg.tagline}</div>
                          </div>
                          
                          <div className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors border-slate-300">
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-4">{pkg.description}</p>

                        {/* What includes */}
                        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                          {pkg.includes.slice(0, 3).map((inc, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono">Duración: {pkg.estimatedDuration}</span>
                        <div className="text-right">
                          <span className="font-bold text-base text-slate-900 font-mono tabular-nums">
                            ${Math.round(pkg.basePrice * sizeMultiplier).toLocaleString('es-AR')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">base por unidad</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Symptoms / Diagnosis help */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-800 mb-2.5">
                  ¿Presenta alguno de estos síntomas tu equipo? (Opcional para el técnico)
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((symptom) => {
                    const isChecked = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? `✓ ${symptom}` : `+ ${symptom}`}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Step 4: Date, Shift & Client Details */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                    4
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Fecha, Turno y Datos de Contacto</h3>
                </div>
                <span className="text-xs text-slate-500">Confirmación garantizada</span>
              </div>

              {/* Date & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Fecha preferida de visita</span>
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    required
                  />
                  {formErrors.preferredDate && (
                    <span className="text-xs text-rose-600 mt-1 block">{formErrors.preferredDate}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Franja horaria deseada</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'manana', label: 'Mañana', hours: '08:30 - 12:30' },
                      { id: 'siesta', label: 'Siesta', hours: '13:00 - 16:30' },
                      { id: 'tarde', label: 'Tarde', hours: '17:00 - 20:30' },
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredTimeSlot(slot.id as any)}
                        className={`p-2 rounded-xl text-center border text-xs transition-colors cursor-pointer ${
                          preferredTimeSlot === slot.id
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{slot.label}</div>
                        <div className="text-[10px] opacity-80 font-mono">{slot.hours}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lucas Ferrari"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {formErrors.clientName && (
                    <span className="text-xs text-rose-600 mt-1 block">{formErrors.clientName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp de Contacto *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 351 555-1234"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    required
                  />
                  {formErrors.clientPhone && (
                    <span className="text-xs text-rose-600 mt-1 block">{formErrors.clientPhone}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Calle y Número (Piso/Dpto) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Obispo Trejo 640, Piso 4 C"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {formErrors.address && (
                    <span className="text-xs text-rose-600 mt-1 block">{formErrors.address}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Barrio / Localidad (Córdoba) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Nueva Córdoba / Cerro de las Rosas"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {formErrors.neighborhood && (
                    <span className="text-xs text-rose-600 mt-1 block">{formErrors.neighborhood}</span>
                  )}
                </div>
              </div>

              {/* Additional notes */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Observaciones de acceso o detalles del lugar (Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Timbre 4B, escalera cómoda, unidad exterior en balcón techado."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

            </div>

          </div>

          {/* Sticky Summary & Real-time Budget Estimation Calculator (4 Cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">Presupuesto Estimado</h3>
                </div>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  En tiempo real
                </span>
              </div>

              {/* Service details summary */}
              <div className="py-4 space-y-3 text-xs border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Servicio:</span>
                  <span className="font-semibold text-slate-900 text-right">{activePackage.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Equipo / Frigorías:</span>
                  <span className="font-mono text-slate-900">{frigorias} Frigorías</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cantidad de unidades:</span>
                  <span className="font-mono text-slate-900">{unitsCount} {unitsCount === 1 ? 'unidad' : 'unidades'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal base:</span>
                  <span className="font-mono tabular-nums text-slate-900">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento múltiple (10%):</span>
                    <span className="font-mono tabular-nums">-${discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="py-4">
                <div className="text-xs text-slate-500 mb-1">Total estimado a abonar</div>
                <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  ${estimatedTotal.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Incluye bactericida, tolva impermeable, desinfección y mano de obra técnica.
                </div>
              </div>

              {/* WhatsApp Notification Direct Guarantee */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 mb-5 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notificación Automática WhatsApp</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700">
                  Al confirmar, se enviará la orden a nuestra central técnica con el número <span className="font-mono font-semibold text-slate-900">{OFFICIAL_PHONE_DISPLAY}</span> para asignación inmediata.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando turno...</span>
                ) : (
                  <>
                    <span>Confirmar y Agendar Turno</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-400">
                  Sin seña previa · Pago contra servicio completado
                </span>
              </div>

            </div>
          </div>

        </form>

      </div>

      {/* Confirmation Modal with WhatsApp Direct Trigger */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center mb-6">
              <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Ticket: {confirmedOrder.ticketCode}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                ¡Turno Registrado con Éxito!
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Tu solicitud de mantenimiento preventivo ya está cargada en el panel de control de Multiservicios RC.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-semibold text-slate-900">{confirmedOrder.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio:</span>
                <span className="font-semibold text-slate-900">{confirmedOrder.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Turno:</span>
                <span className="font-mono text-slate-900">
                  {confirmedOrder.preferredDate} ({confirmedOrder.preferredTimeSlot.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Domicilio:</span>
                <span className="text-slate-900">{confirmedOrder.address}, {confirmedOrder.neighborhood}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                <span className="text-slate-700">Presupuesto Estimado:</span>
                <span className="text-blue-700 font-mono tabular-nums">
                  ${confirmedOrder.estimatedPrice.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Call to Action Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Vía WhatsApp (3517962450)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotification ? '¡Mensaje Copiado!' : 'Copiar Texto de Cita'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmedOrder(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-4">
              También puedes aguardar a que nuestro técnico se comunique contigo en los próximos minutos.
            </p>

          </div>
        </div>
      )}

    </section>
  );
};
