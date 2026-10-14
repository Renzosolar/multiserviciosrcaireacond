import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { DatabaseState, ServiceOrder, ServiceItem, ClientRecord, WhatsAppLog } from '../types';

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>(() => db.getState());

  useEffect(() => {
    const unsubscribe = db.subscribe((updatedState) => {
      setState({ ...updatedState });
    });
    return () => unsubscribe();
  }, []);

  return {
    state,
    orders: state.orders,
    pendingOrders: state.orders.filter((o) => o.status === 'pendiente'),
    services: state.services,
    clients: state.clients,
    whatsappLogs: state.whatsappLogs,
    settings: state.settings,
    
    // Actions
    createOrder: (order: Parameters<typeof db.createOrder>[0]) => db.createOrder(order),
    updateOrderStatus: (id: string, status: any, tech?: string, notes?: string) => 
      db.updateOrderStatus(id, status, tech, notes),
    updateOrder: (id: string, partial: Partial<ServiceOrder>) => db.updateOrder(id, partial),
    deleteOrder: (id: string) => db.deleteOrder(id),
    logWhatsApp: (log: Parameters<typeof db.logWhatsApp>[0]) => db.logWhatsApp(log),
    updateService: (id: string, partial: Partial<ServiceItem>) => db.updateService(id, partial),
    exportDatabaseJson: () => db.exportDatabaseJson(),
    importDatabaseJson: (json: string) => db.importDatabaseJson(json),
    resetToSeed: () => db.resetToSeed(),
  };
}
