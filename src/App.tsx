import React, { useState } from 'react';
import { useDatabase } from './hooks/useDatabase';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ClimatizacionShowcase } from './components/ClimatizacionShowcase';
import { AcPreventiveScheduler } from './components/AcPreventiveScheduler';
import { ServicesGrid } from './components/ServicesGrid';
import { AdminPanel } from './components/AdminPanel';
import { WhatsAppDirectWidget } from './components/WhatsAppDirectWidget';
import { Footer } from './components/Footer';
import { ServiceOrder } from './types';
import { generateClientBookingMessage, OFFICIAL_PHONE_RAW } from './services/whatsapp';

export default function App() {
  const [currentView, setCurrentView] = useState<'client' | 'admin'>('client');
  const {
    orders,
    pendingOrders,
    services,
    clients,
    whatsappLogs,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    logWhatsApp,
    updateService,
    exportDatabaseJson,
    importDatabaseJson,
    resetToSeed,
  } = useDatabase();

  const handleScrollToScheduler = () => {
    if (currentView === 'admin') {
      setCurrentView('client');
      setTimeout(() => {
        const el = document.getElementById('agendar-mantenimiento');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('agendar-mantenimiento');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderCreated = (newOrderData: Parameters<typeof createOrder>[0]) => {
    const createdOrder = createOrder(newOrderData);
    
    // Automatically log WhatsApp notification in database
    const bookingMsg = generateClientBookingMessage(createdOrder);
    logWhatsApp({
      orderId: createdOrder.id,
      ticketCode: createdOrder.ticketCode,
      recipientPhone: OFFICIAL_PHONE_RAW,
      recipientName: 'Multiservicios RC (Central)',
      messageType: 'solicitud_cliente',
      messageText: bookingMsg,
      status: 'generado',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingCount={pendingOrders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'client' ? (
          <>
            {/* Hero Section */}
            <Hero onScheduleClick={handleScrollToScheduler} />

            {/* Climatización Showcase: Highlighted priority service */}
            <ClimatizacionShowcase onScheduleClick={handleScrollToScheduler} />

            {/* Exclusive Preventive AC Maintenance Scheduler */}
            <AcPreventiveScheduler onOrderCreated={handleOrderCreated} />

            {/* General Services Catalog */}
            <ServicesGrid
              services={services}
              onSelectServiceForBooking={handleScrollToScheduler}
            />
          </>
        ) : (
          /* Real-Time Administration Panel */
          <AdminPanel
            orders={orders}
            services={services}
            clients={clients}
            whatsappLogs={whatsappLogs}
            onUpdateOrderStatus={updateOrderStatus}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
            onLogWhatsApp={logWhatsApp}
            onUpdateService={updateService}
            onExportDatabase={exportDatabaseJson}
            onImportDatabase={importDatabaseJson}
            onResetDatabase={resetToSeed}
          />
        )}
      </main>

      {/* Floating WhatsApp Action Widget */}
      <WhatsAppDirectWidget />

      {/* Footer */}
      <Footer onAdminClick={() => setCurrentView('admin')} />
    </div>
  );
}
