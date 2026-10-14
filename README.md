# Multiservicios RC - Climatización & Gestión Técnica Especializada

Plataforma web moderna, responsiva y editable en **Visual Studio Code**, desarrollada para la gestión eficiente de servicios técnicos, agendamiento de mantenimiento preventivo de aires acondicionados y administración de pedidos en tiempo real con notificaciones automáticas vía **WhatsApp (3517962450)**.

---

## 🚀 Cómo abrir y ejecutar este proyecto en Visual Studio Code

### 1. Requisitos previos
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
- Tener instalado [Visual Studio Code](https://code.visualstudio.com/).

### 2. Pasos para abrir en Visual Studio Code
1. Abre **Visual Studio Code**.
2. Ve a `Archivo` > `Abrir carpeta...` (o `File` > `Open Folder...`) y selecciona la carpeta raíz de este proyecto.
3. Abre una terminal integrada en Visual Studio Code con el atajo:
   - **Windows / Linux:** `Ctrl + \`` (o `Terminal` > `Nueva Terminal`).
   - **Mac:** `Cmd + \``.

### 3. Instalar dependencias
En la terminal integrada de VS Code ejecuta:
```bash
npm install
```

### 4. Iniciar el servidor de desarrollo
Ejecuta:
```bash
npm run dev
```
La aplicación se iniciará en `http://localhost:3000` (o el puerto indicado en la consola). Abre ese enlace en tu navegador web.

---

## 🛠️ Estructura del Proyecto

```text
/
├── index.html                   # Entrada HTML principal, fuentes Plus Jakarta Sans y metadatos SEO
├── package.json                 # Dependencias y scripts de ejecución
├── vite.config.ts               # Configuración de Vite y Tailwind CSS
├── src/
│   ├── main.tsx                 # Entrada React
│   ├── App.tsx                  # Enrutamiento de vistas (Portal Web / Panel de Administración)
│   ├── index.css                # Estilos globales con Tailwind CSS
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript (Órdenes, Clientes, Servicios, Notificaciones)
│   ├── data/
│   │   └── seedData.ts          # Datos iniciales (pedidos pendientes, clientes, tarifas en Córdoba)
│   ├── services/
│   │   ├── whatsapp.ts          # Motor de enlaces y plantillas oficiales de WhatsApp (3517962450)
│   │   └── db.ts                # Base de datos integrada local y reactiva con BroadcastChannel
│   ├── hooks/
│   │   └── useDatabase.ts       # Hook para sincronización en tiempo real
│   ├── components/
│   │   ├── Header.tsx           # Barra superior con navegación y acceso a administración
│   │   ├── Hero.tsx             # Sección principal con propuesta de valor y métricas
│   │   ├── AcPreventiveScheduler.tsx # Sección exclusiva para agendar mantenimiento preventivo de AC
│   │   ├── ClimatizacionShowcase.tsx # Muestra en detalle de climatización e higiene de turbinas
│   │   ├── ServicesGrid.tsx     # Catálogo de servicios (electricidad, plomería, etc.)
│   │   ├── AdminPanel.tsx       # Panel de administración en vivo (estados, WhatsApp y clientes)
│   │   ├── WhatsAppDirectWidget.tsx # Botón flotante de WhatsApp oficial
│   │   └── Footer.tsx           # Pie de página corporativo con zonas de cobertura
│   └── assets/
│       └── images/              # Fotografías profesionales de alta resolución
```

---

## ❄️ Funcionalidades Clave

### 1. Especialidad en Climatización & Mantenimiento Preventivo
- Selector de tipo de equipo (**Split Residencial, Split Inverter, Piso-Techo, Multi-Split, Cassette, Central**).
- Selección de capacidad en frigorías (**2.250 fg, 3.000 fg, 4.500 fg, 6.000 fg, +6.000 fg**).
- Selección de paquetes de servicio (**Eco Limpieza, Mantenimiento Preventivo Profundo con Bacha, Service Integral + Gas, Service Full Anual**).
- Descuento automático por cantidad (10% de descuento a partir de la 2da unidad).
- **Calculadora de presupuesto en tiempo real** antes de confirmar.
- Generación automática del ticket (ej. `RC-2026-0842`).

### 2. Panel de Administración en Tiempo Real
- Conmutable desde la barra superior con el botón **Panel de Administración**.
- Indicador visual con contador de pedidos pendientes en vivo.
- Filtro por estado: `Pendientes`, `Confirmados`, `En Camino`, `Completados`, `Cancelados`.
- Búsqueda en vivo por nombre de cliente, teléfono, ticket o barrio de Córdoba.
- Acciones rápidas en 1 clic:
  - **Confirmar Cita vía WhatsApp:** Genera el mensaje oficial con fecha, turno y técnico para enviar al cliente.
  - **Técnico en Camino:** Envía aviso de salida y tiempo estimado al cliente.
  - **Marcar Completado & Garantía:** Envía certificado digital de garantía técnica por escrito de 6 meses.
- Edición de precios base de servicios y tarifas.
- Directorio de clientes con historial de servicios.
- Historial transparente de notificaciones de WhatsApp.
- Descarga y restauración de copias de seguridad de la base de datos en formato JSON.

### 3. Notificaciones Automáticas vía WhatsApp
- Integrado con el número oficial: **3517962450** (+54 9 351 796-2450).
- Compatible de forma transparente tanto con computadoras (WhatsApp Web) como con teléfonos móviles (App de WhatsApp).

---

## ✏️ Personalizaciones Frecuentes en Visual Studio Code

### Cambiar el número de WhatsApp
Si en el futuro deseas cambiar el número de teléfono, edita una sola línea en `src/data/seedData.ts`:
```typescript
export const OFFICIAL_WHATSAPP_NUMBER = '3517962450';
```

### Modificar precios o paquetes de mantenimiento
Edita la constante `MAINTENANCE_PACKAGES` en `src/data/seedData.ts` o modifícalo en vivo desde la pestaña **Gestión de Tarifas y Servicios** en el Panel de Administración.
