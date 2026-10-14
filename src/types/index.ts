export type OrderStatus = 'pendiente' | 'confirmado' | 'en_camino' | 'completado' | 'cancelado';

export type ServiceCategory = 'climatizacion' | 'electricidad' | 'plomeria' | 'edilicio';

export type EquipmentType = 
  | 'split_residencial'
  | 'split_inverter'
  | 'piso_techo'
  | 'multi_split'
  | 'cassette'
  | 'central_conducto';

export type FrigoriasOption = '2250' | '3000' | '4500' | '6000' | 'mayor_6000';

export type MaintenancePackageId = 
  | 'eco_limpieza'
  | 'preventivo_profundo'
  | 'service_integral_gas'
  | 'mantenimiento_anual_full';

export interface MaintenancePackage {
  id: MaintenancePackageId;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  estimatedDuration: string;
  includes: string[];
  recommendedFrequency: string;
}

export interface ServiceOrder {
  id: string;
  ticketCode: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  address: string;
  neighborhood: string;
  city: string;
  serviceCategory: ServiceCategory;
  serviceTitle: string;
  
  // Specific Climatización AC details
  equipmentType?: EquipmentType;
  frigorias?: FrigoriasOption;
  unitsCount?: number;
  maintenancePackageId?: MaintenancePackageId;
  equipmentSymptoms?: string[];
  clientNotes?: string;
  
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: 'manana' | 'siesta' | 'tarde';
  
  status: OrderStatus;
  estimatedPrice: number;
  finalPrice?: number;
  technicianAssigned?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  shortDesc: string;
  fullDesc: string;
  basePrice: number;
  priceUnit: string;
  featured: boolean;
  priorityOrder: number;
  highlights: string[];
  imagePath?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  neighborhood: string;
  totalOrders: number;
  lastServiceDate: string;
  notes?: string;
}

export interface WhatsAppLog {
  id: string;
  orderId?: string;
  ticketCode?: string;
  recipientPhone: string;
  recipientName: string;
  messageType: 'solicitud_cliente' | 'confirmacion_cita' | 'tecnico_en_camino' | 'trabajo_completado' | 'presupuesto_personalizado';
  messageText: string;
  timestamp: string;
  status: 'generado' | 'enviado';
}

export interface DatabaseState {
  orders: ServiceOrder[];
  services: ServiceItem[];
  clients: ClientRecord[];
  whatsappLogs: WhatsAppLog[];
  settings: {
    businessName: string;
    whatsappNumber: string; // "3517962450"
    whatsappCountryCode: string; // "549"
    contactEmail: string;
    cityCoverage: string;
    emergencyAvailable: boolean;
  };
}
