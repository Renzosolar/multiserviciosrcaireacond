import React, { useState } from 'react';
import { 
  LayoutDashboard, Clock, CheckCircle2, AlertTriangle, Search, Filter, 
  MessageCircle, Phone, MapPin, User, Wrench, Calendar, DollarSign, 
  Car, FileDown, Upload, RefreshCw, Edit3, Trash2, ShieldCheck, ChevronDown,
  Layers, Users, MessageSquareText, Database
} from 'lucide-react';
import { ServiceOrder, OrderStatus, ServiceCategory, ServiceItem, ClientRecord, WhatsAppLog } from '../types';
import { 
  buildWhatsAppUrl, generateAdminConfirmationMessage, generateTechEnRouteMessage, 
  generateJobCompletedMessage, OFFICIAL_PHONE_DISPLAY 
} from '../services/whatsapp';

interface AdminPanelProps {
  orders: ServiceOrder[];
  services: ServiceItem[];
  clients: ClientRecord[];
  whatsappLogs: WhatsAppLog[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, technician?: string, notes?: string) => void;
  onUpdateOrder: (orderId: string, partial: Partial<ServiceOrder>) => void;
  onDeleteOrder: (orderId: string) => void;
  onLogWhatsApp: (log: Omit<WhatsAppLog, 'id' | 'timestamp'>) => void;
  onUpdateService: (serviceId: string, partial: Partial<ServiceItem>) => void;
  onExportDatabase: () => string;
  onImportDatabase: (json: string) => boolean;
  onResetDatabase: () => void;
}

type AdminTab = 'pedidos' | 'servicios' | 'clientes' | 'whatsapp' | 'basedatos';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  services,
  clients,
  whatsappLogs,
  onUpdateOrderStatus,
  onUpdateOrder,
  onDeleteOrder,
  onLogWhatsApp,
  onUpdateService,
  onExportDatabase,
  onImportDatabase,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('pedidos');
  
  // Orders Filters
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Order for detail or editing
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [editingTech, setEditingTech] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingPrice, setEditingPrice] = useState<number>(0);
  
  // Database backup JSON state
  const [importJsonText, setImportJsonText] = useState('');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats calculation
  const pendingCount = orders.filter((o) => o.status === 'pendiente').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmado').length;
  const enCaminoCount = orders.filter((o) => o.status === 'en_camino').length;
  const completedCount = orders.filter((o) => o.status === 'completado').length;
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.finalPrice || curr.estimatedPrice || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || order.serviceCategory === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      order.ticketCode.toLowerCase().includes(q) ||
      order.clientName.toLowerCase().includes(q) ||
      order.clientPhone.includes(q) ||
      order.address.toLowerCase().includes(q) ||
      order.neighborhood.toLowerCase().includes(q) ||
      order.serviceTitle.toLowerCase().includes(q);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Action handlers
  const handleSelectOrder = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setEditingTech(order.technicianAssigned || 'Renzo Correa (Técnico Matriculado)');
    setEditingNotes(order.internalNotes || '');
    setEditingPrice(order.finalPrice || order.estimatedPrice);
  };

  const handleSaveOrderChanges = () => {
    if (!selectedOrder) return;
    onUpdateOrder(selectedOrder.id, {
      technicianAssigned: editingTech,
      internalNotes: editingNotes,
      finalPrice: Number(editingPrice),
    });
    setSelectedOrder((prev) => prev ? {
      ...prev,
      technicianAssigned: editingTech,
      internalNotes: editingNotes,
      finalPrice: Number(editingPrice),
    } : null);
  };

  const handleSendWhatsAppConfirmation = (order: ServiceOrder) => {
    const msg = generateAdminConfirmationMessage(order, editingTech || order.technicianAssigned);
    const url = buildWhatsAppUrl(order.clientPhone, msg);
    
    // Log in database
    onLogWhatsApp({
      orderId: order.id,
      ticketCode: order.ticketCode,
      recipientPhone: order.clientPhone,
      recipientName: order.clientName,
      messageType: 'confirmacion_cita',
      messageText: msg,
      status: 'enviado',
    });

    // Update status to confirmed if pending
    if (order.status === 'pendiente') {
      onUpdateOrderStatus(order.id, 'confirmado', editingTech || order.technicianAssigned);
    }

    window.open(url, '_blank');
  };

  const handleSendTechEnRoute = (order: ServiceOrder) => {
    const msg = generateTechEnRouteMessage(order, editingTech || order.technicianAssigned, 20);
    const url = buildWhatsAppUrl(order.clientPhone, msg);

    onLogWhatsApp({
      orderId: order.id,
      ticketCode: order.ticketCode,
      recipientPhone: order.clientPhone,
      recipientName: order.clientName,
      messageType: 'tecnico_en_camino',
      messageText: msg,
      status: 'enviado',
    });

    onUpdateOrderStatus(order.id, 'en_camino', editingTech || order.technicianAssigned);
    window.open(url, '_blank');
  };

  const handleSendJobCompleted = (order: ServiceOrder) => {
    const msg = generateJobCompletedMessage(order, Number(editingPrice) || order.estimatedPrice);
    const url = buildWhatsAppUrl(order.clientPhone, msg);

    onLogWhatsApp({
      orderId: order.id,
      ticketCode: order.ticketCode,
      recipientPhone: order.clientPhone,
      recipientName: order.clientName,
      messageType: 'trabajo_completado',
      messageText: msg,
      status: 'enviado',
    });

    onUpdateOrderStatus(order.id, 'completado', editingTech || order.technicianAssigned);
    window.open(url, '_blank');
  };

  const handleExportBackup = () => {
    const jsonStr = onExportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multiservicios_rc_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    if (!importJsonText.trim()) return;
    const ok = onImportDatabase(importJsonText);
    if (ok) {
      setImportMessage({ type: 'success', text: '¡Base de datos restaurada con éxito!' });
      setImportJsonText('');
    } else {
      setImportMessage({ type: 'error', text: 'Error: El formato JSON es inválido o incompatible.' });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pendiente</span>
          </span>
        );
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Confirmado</span>
          </span>
        );
      case 'en_camino':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Car className="w-3 h-3 text-purple-600" />
            <span>En Camino</span>
          </span>
        );
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Completado</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Cancelado</span>
          </span>
        );
    }
  };

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <span>Panel de Control en Tiempo Real</span>
              <span aria-hidden="true">·</span>
              <span>Central Multiservicios RC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión de Pedidos, Servicios y Notificaciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sincronización en vivo con base de datos local y mensajería oficial vía WhatsApp (3517962450).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Total {orders.length} pedidos registrados
            </span>
          </div>
        </div>

        {/* Real-time KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
              <span>Pendientes</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {pendingCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requieren confirmación</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
              <span>Confirmados</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {confirmedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">En agenda técnica</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-purple-700 font-semibold mb-1">
              <span>En Camino</span>
              <Car className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {enCaminoCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Técnico en domicilio</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
              <span>Completados</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {completedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Garantía activa</div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
              <span>Facturación Est.</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              ${totalRevenue.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">En cartera actual</div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 mb-6 overflow-x-auto">
          {[
            { id: 'pedidos', label: 'Pedidos en Tiempo Real', icon: Layers, count: orders.length },
            { id: 'servicios', label: 'Gestión de Tarifas y Servicios', icon: Wrench, count: services.length },
            { id: 'clientes', label: 'Directorio de Clientes', icon: Users, count: clients.length },
            { id: 'whatsapp', label: 'Notificaciones WhatsApp', icon: MessageSquareText, count: whatsappLogs.length },
            { id: 'basedatos', label: 'Base de Datos & Respaldo', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Pedidos en Tiempo Real */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por ticket, cliente, teléfono, barrio o equipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Status filter buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'pendiente', label: 'Pendientes' },
                  { id: 'confirmado', label: 'Confirmados' },
                  { id: 'en_camino', label: 'En Camino' },
                  { id: 'completado', label: 'Completados' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No se encontraron pedidos</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Prueba cambiando los filtros de búsqueda o registra un nuevo agendamiento desde la web.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-xl border transition-all p-5 shadow-2xs ${
                      order.status === 'pendiente' 
                        ? 'border-amber-300/80 bg-amber-50/10' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      
                      {/* Left: Client & Order Data */}
                      <div className="space-y-2 flex-1">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {order.ticketCode}
                          </span>
                          {getStatusBadge(order.status)}
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500 font-mono">
                            Turno: {order.preferredDate} ({order.preferredTimeSlot.toUpperCase()})
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>{order.clientName}</span>
                            <span className="text-xs text-slate-400 font-normal">({order.neighborhood})</span>
                          </h3>
                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono">{order.clientPhone}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.address}</span>
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs">
                          <div className="font-semibold text-slate-800">
                            {order.serviceTitle}
                          </div>
                          {order.equipmentType && (
                            <div className="text-slate-500 mt-0.5">
                              Tipo: <strong className="text-slate-700">{order.equipmentType}</strong> · Frigorías: <strong className="text-slate-700">{order.frigorias} fg</strong> · Cantidad: <strong className="text-slate-700">{order.unitsCount || 1}</strong>
                            </div>
                          )}
                          {order.equipmentSymptoms && order.equipmentSymptoms.length > 0 && (
                            <div className="text-amber-700 text-[11px] mt-1">
                              Síntomas: {order.equipmentSymptoms.join(', ')}
                            </div>
                          )}
                          {order.clientNotes && (
                            <div className="text-slate-500 italic text-[11px] mt-1 bg-slate-50 p-2 rounded-lg">
                              "{order.clientNotes}"
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right: Pricing, Status Selector & Direct WhatsApp Actions */}
                      <div className="lg:w-80 shrink-0 space-y-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-5">
                        
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-500">Presupuesto estimado:</span>
                          <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                            ${(order.finalPrice || order.estimatedPrice).toLocaleString('es-AR')}
                          </span>
                        </div>

                        {/* Status selector */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Cambiar Estado:
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                          >
                            <option value="pendiente">🟡 Pendiente de Confirmación</option>
                            <option value="confirmado">🔵 Confirmado en Agenda</option>
                            <option value="en_camino">🟣 Técnico en Camino</option>
                            <option value="completado">🟢 Completado con Garantía</option>
                            <option value="cancelado">🔴 Cancelado</option>
                          </select>
                        </div>

                        {/* WhatsApp Action Buttons */}
                        <div className="space-y-1.5 pt-1">
                          
                          {/* Button: Confirm via WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppConfirmation(order)}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Confirmar Cita vía WhatsApp</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            {/* Button: Técnico en camino */}
                            <button
                              type="button"
                              onClick={() => handleSendTechEnRoute(order)}
                              className="py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Car className="w-3 h-3 text-purple-600" />
                              <span>En Camino</span>
                            </button>

                            {/* Button: Finalizado */}
                            <button
                              type="button"
                              onClick={() => handleSendJobCompleted(order)}
                              className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Garantía</span>
                            </button>
                          </div>

                        </div>

                        {/* Edit details trigger */}
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => handleSelectOrder(order)}
                            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                          >
                            Editar detalles y técnico
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el pedido ${order.ticketCode}?`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Gestión de Servicios y Tarifas */}
        {activeTab === 'servicios' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tarifas y Precios de Servicios</h3>
                <p className="text-xs text-slate-500">
                  Modifica los precios base en tiempo real. Se reflejan inmediatamente en la calculadora de presupuesto.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {services.map((svc) => (
                <div key={svc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                        {svc.category}
                      </span>
                      {svc.featured && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Destacado
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{svc.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.shortDesc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tarifa base ($)</span>
                      <input
                        type="number"
                        defaultValue={svc.basePrice}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            onUpdateService(svc.id, { basePrice: val });
                          }
                        }}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Directorio de Clientes */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Directorio de Clientes Registrados</h3>
              <p className="text-xs text-slate-500">
                Historial de clientes, direcciones y acceso rápido a contacto directo por WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((cli) => (
                <div key={cli.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-slate-900">{cli.name}</h4>
                      <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {cli.totalOrders} {cli.totalOrders === 1 ? 'servicio' : 'servicios'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{cli.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{cli.address}, {cli.neighborhood}</span>
                      </div>
                      {cli.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-2 border-t border-slate-200/80 pt-1">
                          {cli.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Último: {cli.lastServiceDate}</span>
                    <a
                      href={buildWhatsAppUrl(cli.phone, `Hola ${cli.name}! Te escribimos desde Multiservicios RC.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactar</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Historial de Notificaciones WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Registro de Notificaciones Vía WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Log transparente de mensajes generados con el número oficial <strong className="text-slate-800">{OFFICIAL_PHONE_DISPLAY}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {whatsappLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  Aún no se han enviado notificaciones en esta sesión.
                </p>
              ) : (
                whatsappLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.recipientName}</span>
                        <span className="font-mono text-slate-500">({log.recipientPhone})</span>
                        {log.ticketCode && (
                          <span className="font-mono text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded text-[10px]">
                            {log.ticketCode}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <pre className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                      {log.messageText}
                    </pre>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <a
                        href={buildWhatsAppUrl(log.recipientPhone, log.messageText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reenviar por WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Base de Datos & Respaldo */}
        {activeTab === 'basedatos' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Base de Datos Integrada & Respaldo</h3>
              <p className="text-xs text-slate-500">
                La base de datos se guarda en almacenamiento local del navegador y se sincroniza en tiempo real entre pestañas. Puedes exportar o importar tus datos en formato JSON para transportarlos a Visual Studio Code o realizar copias de seguridad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Export backup */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-blue-600" />
                  <span>Exportar Copia de Seguridad JSON</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Descarga todos los pedidos, clientes, tarifas y logs de WhatsApp en un único archivo JSON listo para usar.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Backup JSON</span>
                </button>
              </div>

              {/* Reset to Seed */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Restablecer Datos Semilla de Prueba</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Restaura los 4 pedidos de muestra en Córdoba, tarifas oficiales y registros iniciales de WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Deseas restablecer la base de datos a los datos iniciales?')) {
                      onResetDatabase();
                    }
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restablecer Datos Semilla</span>
                </button>
              </div>

            </div>

            {/* Import JSON */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Importar / Restaurar Base de Datos</span>
              </h4>
              <p className="text-xs text-slate-600">
                Pega el contenido JSON de una copia de seguridad para restaurar todos los registros.
              </p>
              
              <textarea
                rows={4}
                placeholder="Pega el contenido JSON aquí..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              {importMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  importMessage.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {importMessage.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleImportBackup}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
              >
                Restaurar Base de Datos
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Order Edit Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedOrder.ticketCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Editar Orden: {selectedOrder.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Técnico Asignado:
                </label>
                <input
                  type="text"
                  value={editingTech}
                  onChange={(e) => setEditingTech(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Presupuesto Final Acordado ($):
                </label>
                <input
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas Técnicas Internas (Materiales, escaleras, repuestos):
                </label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveOrderChanges();
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
