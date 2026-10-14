import { ServiceOrder } from '../types';

export const OFFICIAL_PHONE_DISPLAY = '351 796-2450';
export const OFFICIAL_PHONE_RAW = '3517962450';
export const OFFICIAL_PHONE_E164 = '5493517962450';

/**
 * Normalizes phone numbers to WhatsApp international format (Argentine mobile standard)
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  // Remove non-numeric characters
  let cleaned = rawPhone.replace(/\D/g, '');
  
  if (!cleaned) return OFFICIAL_PHONE_E164;
  
  // If already starts with 549
  if (cleaned.startsWith('549')) {
    return cleaned;
  }
  
  // If starts with 54 but not 9 (standard Argentine country code)
  if (cleaned.startsWith('54') && cleaned.length >= 12) {
    if (cleaned.charAt(2) !== '9') {
      return `549${cleaned.slice(2)}`;
    }
    return cleaned;
  }
  
  // If it's a 10-digit number like 3517962450 or with 0 (e.g. 0351...) or 15 (e.g. 157...)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // Prefix with Argentina mobile code 549
  return `549${cleaned}`;
}

/**
 * Builds universal WhatsApp link
 */
export function buildWhatsAppUrl(phoneNumber: string, messageText: string): string {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${normalizedNumber}?text=${encodedText}`;
}

/**
 * Generates the WhatsApp message when a client creates an appointment for AC maintenance or technical service
 */
export function generateClientBookingMessage(order: ServiceOrder): string {
  const timeSlotLabel = 
    order.preferredTimeSlot === 'manana' ? 'Mañana (08:30 a 12:30 hs)' :
    order.preferredTimeSlot === 'siesta' ? 'Siesta (13:00 a 16:30 hs)' : 
    'Tarde (17:00 a 20:30 hs)';

  const [year, month, day] = order.preferredDate.split('-');
  const formattedDate = `${day}/${month}/${year}`;

  let message = `❄️ *SOLICITUD DE TURNO - MULTISERVICIOS RC*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *Ticket:* ${order.ticketCode}\n`;
  message += `👤 *Cliente:* ${order.clientName}\n`;
  message += `📞 *Teléfono:* ${order.clientPhone}\n`;
  message += `📍 *Dirección:* ${order.address}, ${order.neighborhood} (${order.city})\n\n`;
  
  message += `🛠️ *SERVICIO SOLICITADO:*\n`;
  message += `• *Categoría:* ${order.serviceCategory.toUpperCase()}\n`;
  message += `• *Especialidad:* ${order.serviceTitle}\n`;
  
  if (order.equipmentType) {
    const eqNames: Record<string, string> = {
      split_residencial: 'Split Residencial',
      split_inverter: 'Split Inverter Alta Eficiencia',
      piso_techo: 'Piso-Techo Comercial',
      multi_split: 'Multi-Split',
      cassette: 'Cassette',
      central_conducto: 'Central por Conductos',
    };
    message += `• *Tipo de Equipo:* ${eqNames[order.equipmentType] || order.equipmentType}\n`;
  }
  
  if (order.frigorias) {
    message += `• *Capacidad:* ${order.frigorias} Frigorías\n`;
  }
  
  if (order.unitsCount && order.unitsCount > 1) {
    message += `• *Cantidad de Equipos:* ${order.unitsCount} unidades\n`;
  }
  
  if (order.equipmentSymptoms && order.equipmentSymptoms.length > 0) {
    message += `• *Síntomas reportados:* ${order.equipmentSymptoms.join(', ')}\n`;
  }
  
  if (order.clientNotes) {
    message += `• *Observaciones:* ${order.clientNotes}\n`;
  }
  
  message += `\n📅 *TURNO SOLICITADO:*\n`;
  message += `• *Fecha preferida:* ${formattedDate}\n`;
  message += `• *Franja horaria:* ${timeSlotLabel}\n`;
  message += `💰 *Presupuesto estimado:* $${order.estimatedPrice.toLocaleString('es-AR')}\n\n`;
  message += `Hola Multiservicios RC! Acabo de completar la solicitud en la web y aguardo su confirmación oficial. ¡Muchas gracias!`;

  return message;
}

/**
 * Message sent by Admin to Client confirming their appointment
 */
export function generateAdminConfirmationMessage(order: ServiceOrder, techName?: string): string {
  const [year, month, day] = order.preferredDate.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  
  const timeSlotLabel = 
    order.preferredTimeSlot === 'manana' ? 'Mañana (08:30 a 12:30 hs)' :
    order.preferredTimeSlot === 'siesta' ? 'Siesta (13:00 a 16:30 hs)' : 
    'Tarde (17:00 a 20:30 hs)';

  const assigned = techName || order.technicianAssigned || 'Técnico Especialista Matriculado';

  let message = `❄️ *MULTISERVICIOS RC - CONFIRMACIÓN OFICIAL*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Hola *${order.clientName}*, te confirmamos tu turno técnico agendado:\n\n`;
  message += `📋 *Ticket:* ${order.ticketCode}\n`;
  message += `🛠️ *Servicio:* ${order.serviceTitle}\n`;
  message += `📅 *Fecha agendada:* ${formattedDate}\n`;
  message += `⏰ *Franja horaria:* ${timeSlotLabel}\n`;
  message += `📍 *Dirección:* ${order.address}, ${order.neighborhood}\n`;
  message += `👨‍🔧 *Técnico asignado:* ${assigned}\n`;
  message += `💰 *Presupuesto estimado:* $${order.estimatedPrice.toLocaleString('es-AR')}\n\n`;
  message += `ℹ️ *Recomendación:* Por favor tener despejada el área circundante a la unidad interior para agilizar la instalación de la tolva protectora de lavado.\n\n`;
  message += `Si precisas reprogramar o hacer alguna consulta previa, respondenos directamente a este chat. ¡Nos vemos pronto!`;

  return message;
}

/**
 * Message sent when technician is on their way
 */
export function generateTechEnRouteMessage(order: ServiceOrder, techName?: string, etaMinutes: number = 20): string {
  const assigned = techName || order.technicianAssigned || 'El técnico de Multiservicios RC';

  let message = `🚗 *MULTISERVICIOS RC - TÉCNICO EN CAMINO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Hola *${order.clientName}*, te avisamos que *${assigned}* ya se encuentra en camino a tu domicilio:\n\n`;
  message += `📍 *Destino:* ${order.address}, ${order.neighborhood}\n`;
  message += `⏱️ *Tiempo estimado de llegada:* ${etaMinutes} minutos aprox.\n`;
  message += `📋 *Servicio:* ${order.serviceTitle} (Ticket: ${order.ticketCode})\n\n`;
  message += `Cualquier detalle de timbre o indicación de acceso, por favor avísanos por acá. ¡Muchas gracias!`;

  return message;
}

/**
 * Message sent when work is completed
 */
export function generateJobCompletedMessage(order: ServiceOrder, finalPrice?: number): string {
  const price = finalPrice || order.finalPrice || order.estimatedPrice;

  let message = `✅ *MULTISERVICIOS RC - SERVICIO FINALIZADO CON ÉXITO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Estimado/a *${order.clientName}*, hemos concluido el trabajo técnico en su equipo:\n\n`;
  message += `📋 *Ticket:* ${order.ticketCode}\n`;
  message += `🛠️ *Servicio realizado:* ${order.serviceTitle}\n`;
  message += `📍 *Ubicación:* ${order.address}\n`;
  message += `💰 *Total abonado:* $${price.toLocaleString('es-AR')}\n`;
  message += `🛡️ *Garantía técnica:* 6 meses de respaldo profesional escrito.\n\n`;
  message += `Nos alegra haber colaborado con el confort y seguridad de su espacio. ¡Hasta el próximo mantenimiento preventivo!`;

  return message;
}
