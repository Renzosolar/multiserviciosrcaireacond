import { DatabaseState, ServiceOrder, ServiceItem, ClientRecord, WhatsAppLog, OrderStatus } from '../types';
import { INITIAL_STATE } from '../data/seedData';

const STORAGE_KEY = 'multiservicios_rc_database_v1';
const BROADCAST_CHANNEL_NAME = 'multiservicios_rc_broadcast';

type ChangeListener = (state: DatabaseState) => void;

class LocalDatabase {
  private state: DatabaseState;
  private listeners: Set<ChangeListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadFromStorage();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'DATABASE_UPDATED' && event.data?.payload) {
          this.state = event.data.payload;
          this.notifyListeners(false);
        }
      };
    }
  }

  private loadFromStorage(): DatabaseState {
    if (typeof window === 'undefined') return INITIAL_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.orders && parsed.services) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using seed data', e);
    }
    // Save initial state if fresh
    this.saveToStorage(INITIAL_STATE);
    return INITIAL_STATE;
  }

  private saveToStorage(state: DatabaseState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  private notifyListeners(broadcast: boolean = true): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in DB listener', err);
      }
    });

    if (broadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'DATABASE_UPDATED',
        payload: this.state,
      });
    }
  }

  public subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getOrders(): ServiceOrder[] {
    return [...this.state.orders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getPendingOrders(): ServiceOrder[] {
    return this.state.orders.filter((o) => o.status === 'pendiente');
  }

  public getServices(): ServiceItem[] {
    return [...this.state.services].sort((a, b) => a.priorityOrder - b.priorityOrder);
  }

  public getClients(): ClientRecord[] {
    return [...this.state.clients];
  }

  public getWhatsAppLogs(): WhatsAppLog[] {
    return [...this.state.whatsappLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  public generateNextTicketCode(): string {
    const year = new Date().getFullYear();
    const existingCodes = this.state.orders
      .map((o) => o.ticketCode)
      .filter((code) => code.startsWith(`RC-${year}-`));
    
    let maxNumber = 843;
    existingCodes.forEach((code) => {
      const parts = code.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNum = maxNumber + 1;
    return `RC-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  public createOrder(orderInput: Omit<ServiceOrder, 'id' | 'ticketCode' | 'createdAt' | 'updatedAt'>): ServiceOrder {
    const now = new Date().toISOString();
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ticketCode = this.generateNextTicketCode();

    const newOrder: ServiceOrder = {
      ...orderInput,
      id,
      ticketCode,
      createdAt: now,
      updatedAt: now,
    };

    // Update orders
    const updatedOrders = [newOrder, ...this.state.orders];

    // Upsert client record
    const existingClientIndex = this.state.clients.findIndex(
      (c) => c.phone.replace(/\D/g, '') === orderInput.clientPhone.replace(/\D/g, '')
    );

    let updatedClients = [...this.state.clients];
    if (existingClientIndex >= 0) {
      const existing = updatedClients[existingClientIndex];
      updatedClients[existingClientIndex] = {
        ...existing,
        name: orderInput.clientName,
        address: orderInput.address,
        neighborhood: orderInput.neighborhood,
        totalOrders: existing.totalOrders + 1,
        lastServiceDate: now.split('T')[0],
      };
    } else {
      const newClient: ClientRecord = {
        id: `cli-${Date.now()}`,
        name: orderInput.clientName,
        phone: orderInput.clientPhone,
        email: orderInput.clientEmail,
        address: orderInput.address,
        neighborhood: orderInput.neighborhood,
        totalOrders: 1,
        lastServiceDate: now.split('T')[0],
        notes: `Cliente registrado mediante agendamiento web ${ticketCode}`,
      };
      updatedClients = [newClient, ...updatedClients];
    }

    this.state = {
      ...this.state,
      orders: updatedOrders,
      clients: updatedClients,
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, technicianAssigned?: string, internalNotes?: string): ServiceOrder | null {
    const index = this.state.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const existing = this.state.orders[index];
    const updated: ServiceOrder = {
      ...existing,
      status,
      technicianAssigned: technicianAssigned !== undefined ? technicianAssigned : existing.technicianAssigned,
      internalNotes: internalNotes !== undefined ? internalNotes : existing.internalNotes,
      updatedAt: new Date().toISOString(),
    };

    const updatedOrders = [...this.state.orders];
    updatedOrders[index] = updated;

    this.state = {
      ...this.state,
      orders: updatedOrders,
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return updated;
  }

  public updateOrder(orderId: string, partial: Partial<ServiceOrder>): ServiceOrder | null {
    const index = this.state.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const updated: ServiceOrder = {
      ...this.state.orders[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    const updatedOrders = [...this.state.orders];
    updatedOrders[index] = updated;

    this.state = {
      ...this.state,
      orders: updatedOrders,
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return updated;
  }

  public deleteOrder(orderId: string): boolean {
    const filtered = this.state.orders.filter((o) => o.id !== orderId);
    if (filtered.length === this.state.orders.length) return false;

    this.state = {
      ...this.state,
      orders: filtered,
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return true;
  }

  public logWhatsApp(logInput: Omit<WhatsAppLog, 'id' | 'timestamp'>): WhatsAppLog {
    const newLog: WhatsAppLog = {
      ...logInput,
      id: `wlog-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    this.state = {
      ...this.state,
      whatsappLogs: [newLog, ...this.state.whatsappLogs],
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return newLog;
  }

  public updateService(serviceId: string, partial: Partial<ServiceItem>): ServiceItem | null {
    const index = this.state.services.findIndex((s) => s.id === serviceId);
    if (index === -1) return null;

    const updated: ServiceItem = {
      ...this.state.services[index],
      ...partial,
    };

    const updatedServices = [...this.state.services];
    updatedServices[index] = updated;

    this.state = {
      ...this.state,
      services: updatedServices,
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    return updated;
  }

  public exportDatabaseJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.services)) {
        this.state = parsed;
        this.saveToStorage(this.state);
        this.notifyListeners();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON database import', e);
    }
    return false;
  }

  public resetToSeed(): void {
    this.state = INITIAL_STATE;
    this.saveToStorage(this.state);
    this.notifyListeners();
  }
}

export const db = new LocalDatabase();
