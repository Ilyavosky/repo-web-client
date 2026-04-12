# 🖥️ GlamStock · repo-web-client

> **Frontend Web** — Interfaz de usuario para el sistema de gestión de inventario GlamStock, construida con Next.js 16 y React 19.

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características y Funcionalidades](#características-y-funcionalidades)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos Previos](#requisitos-previos)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Instalación y Arranque](#instalación-y-arranque)
8. [Rutas de la Aplicación](#rutas-de-la-aplicación)
9. [Sistema de Autenticación en el Cliente](#sistema-de-autenticación-en-el-cliente)
10. [Arquitectura de Componentes](#arquitectura-de-componentes)
11. [Seguridad del Frontend](#seguridad-del-frontend)
12. [Scripts Disponibles](#scripts-disponibles)
13. [Relación con otros Repositorios](#relación-con-otros-repositorios)

---

## Descripción General

`repo-web-client` es la interfaz web del sistema **GlamStock**. Es una SPA (Single Page Application) con renderizado del servidor construida con el **App Router de Next.js 16**. Se comunica exclusivamente con el `repo-api-service` a través de la API REST interna.

La aplicación está diseñada para que el personal de una tienda de moda multi-sucursal pueda:

- **Gestionar el catálogo de productos** con variantes por modelo y color.
- **Controlar el inventario** de cada sucursal en tiempo real.
- **Registrar ventas** y consultar el historial de transacciones.
- **Analizar el negocio** mediante un dashboard con KPIs, rankings de productos y alertas de stock.
- **Administrar sucursales** y activar/desactivar puntos de venta.

---

## Características y Funcionalidades

| Módulo | Funcionalidades |
|---|---|
| 🔐 **Login** | Autenticación con email/contraseña. Soporte para flujo MFA (TOTP de 2 etapas) |
| 📊 **Dashboard** | KPIs del negocio: ventas totales, ingresos, utilidad, top productos más y menos vendidos, alertas de stock bajo |
| 📦 **Inventario** | Stock por sucursal, filtros por SKU/nombre/rango de stock, ajustes directos de cantidad |
| 🏪 **Sucursales** | CRUD completo, mapa de ubicaciones, activar/desactivar sucursales |
| 🛍️ **Ventas** | Registro de ventas con validación de stock, historial filtrado por fecha y sucursal, reversión de ventas |
| 📋 **Productos** | Catálogo con paginación, creación de productos maestros con variantes múltiples, gestión de precios |

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.1.6 (canary) | Framework React con App Router + SSR |
| React | 19.2.3 | UI Library |
| TypeScript | ^5 | Lenguaje |
| Tailwind CSS | ^4 | Estilos utilitarios |
| Recharts | ^3.7 | Gráficos y visualizaciones del dashboard |
| Lucide React | ^1.7 | Iconografía |
| `babel-plugin-react-compiler` | ^1 | Optimización automática de React |

---

## Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20.x LTS |
| npm | 10.x |

> ⚠️ El frontend **no funciona de manera aislada**. Requiere que el `repo-api-service` esté corriendo en `http://localhost:4000` (o la URL configurada en `API_URL`).

---

## Estructura del Proyecto

```
repo-web-client/
├── .env.local                  # Variables de entorno locales (NO commitear)
├── .env.local.example          # Plantilla de variables de entorno
├── .gitignore
├── next.config.ts              # Configuración de Next.js (CSP, headers de seguridad)
├── postcss.config.mjs          # Configuración de PostCSS para Tailwind v4
├── tsconfig.json               # Configuración de TypeScript
├── package.json
└── src/
    ├── middleware.ts            # Middleware de autenticación a nivel Edge
    ├── app/
    │   ├── layout.tsx           # Layout raíz (HTML, meta tags)
    │   ├── page.tsx             # Página raíz (redirige a /dashboard)
    │   ├── globals.css          # Estilos globales + directivas Tailwind
    │   ├── (auth)/              # Grupo de rutas sin layout del dashboard
    │   │   └── login/
    │   │       └── page.tsx     # Pantalla de login
    │   ├── (dashboard)/         # Grupo de rutas con layout del dashboard
    │   │   ├── layout.tsx       # Layout: sidebar + header de navegación
    │   │   ├── dashboard/       # Página de KPIs y estadísticas
    │   │   ├── inventario/      # Página de inventario multi-sucursal
    │   │   ├── sucursales/      # Página de gestión de sucursales
    │   │   └── ventas/          # Página de ventas e historial
    │   └── api/                 # Route Handlers de Next.js (proxy al API externo)
    ├── components/
    │   ├── layout/              # Sidebar, Header, NavigationMenu
    │   ├── forms/               # Formularios de todos los módulos
    │   └── ui/                  # Componentes reutilizables (modales, tablas, badges, etc.)
    ├── hooks/                   # Custom hooks (useFetch, useAuth, etc.)
    └── types/                   # Definiciones de tipos TypeScript
```

---

## Configuración de Variables de Entorno

Copia `.env.local.example` a `.env.local` y ajusta los valores:

```env
# URL pública del frontend (para redirecciones absolutas)
NEXT_PUBLIC_URL=http://localhost:3000

# URL del API backend (solo accesible desde el servidor Next.js)
API_URL=http://localhost:4000
```

> **Nota sobre `API_URL` en producción:** Esta variable solo se usa en el servidor de Next.js (en el middleware y en Server Components). Para conectividad desde el navegador del cliente, el `next.config.ts` ya configura el CSP para permitir `http://localhost:4000`.

---

## Instalación y Arranque

```bash
# 1. Asegurarse de que los servicios de backend están corriendo:
#    - repo-infra-db: docker compose up -d
#    - repo-api-service: npm run dev (puerto 4000)

# 2. Clonar e instalar dependencias
git clone <URL_DEL_REPOSITORIO> repo-web-client
cd repo-web-client
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Verificar que API_URL=http://localhost:4000

# 4. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en **`http://localhost:3000`**.

Al acceder a `http://localhost:3000`, serás redirigido automáticamente a `/login` si no tienes sesión activa.

### Credenciales de acceso

Usa las credenciales configuradas en `repo-infra-db/.env` al momento del seed:

```
Email:    valor de ADMIN_EMAIL
Password: valor de ADMIN_PASSWORD
```

---

## Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Pública | Redirección automática a `/dashboard` |
| `/login` | Pública | Formulario de inicio de sesión |
| `/dashboard` | 🔒 Autenticado | Panel principal con KPIs del negocio |
| `/inventario` | 🔒 Autenticado | Gestión de stock por sucursal |
| `/sucursales` | 🔒 Autenticado | Administración de puntos de venta |
| `/ventas` | 🔒 Autenticado | Registro e historial de transacciones |

> **Nota sobre productos:** La gestión del catálogo de productos (crear, editar, eliminar productos maestros y variantes) se realiza desde la sección de **Inventario** a través de modales y paneles contextuales. No existe una ruta `/productos` independiente.

### Protección de rutas

El middleware Edge (`src/middleware.ts`) intercepta todas las rutas bajo `/dashboard`, `/inventario`, `/sucursales` y `/ventas`. Para cada petición:

1. Lee la cookie `auth_token` del header `cookie`.
2. Hace una petición server-side a `GET /api/v1/auth/me` en el API.
3. Si la respuesta no es `200 OK`, redirige a `/login`.
4. Si es válida, permite el acceso a la ruta solicitada.

> Esta estrategia garantiza que la validación de sesión siempre ocurre en el servidor, no se puede evadir desde el cliente.

---

## Sistema de Autenticación en el Cliente

El flujo de login en el frontend soporta las dos etapas del sistema de autenticación:

### Flujo sin 2FA
```
Usuario ingresa email/password
    └── POST /api/v1/auth/login
        └── Respuesta 200 → Sesión establecida → Redirige a /dashboard
```

### Flujo con 2FA activo
```
Usuario ingresa email/password
    └── POST /api/v1/auth/login
        └── Respuesta 200 { requiresMfa: true }
            └── Muestra formulario de código TOTP
                └── POST /api/v1/auth/verify-totp
                    └── Respuesta 200 → Sesión establecida → Redirige a /dashboard
```

Las cookies son manejadas **automáticamente** por el navegador (httpOnly) — el frontend no manipula tokens directamente.

---

## Arquitectura de Componentes

### Grupos de Rutas (Route Groups)

Next.js App Router usa grupos de rutas (`(auth)` y `(dashboard)`) para aplicar layouts diferentes:

- **`(auth)/`** — Sin sidebar. Layout minimalista para la pantalla de login.
- **`(dashboard)/`** — Con sidebar de navegación y header. Requiere autenticación.

### Componentes Principales

| Componente | Ubicación | Descripción |
|---|---|---|
| `Sidebar` | `components/layout/` | Navegación lateral con enlaces a todos los módulos |
| `Header` | `components/layout/` | Barra superior con nombre de usuario y botón de logout |
| Tablas de datos | `components/ui/` | Tablas reutilizables con ordenamiento y filtrado |
| Modales de CRUD | `components/forms/` | Formularios de creación/edición en modales |
| Gráficos | `app/(dashboard)/dashboard/` | Componentes Recharts para visualizaciones |

### Llamadas al API

El frontend llama directamente al API desde los componentes (tanto Client Components via `fetch` del navegador como Server Components via `fetch` de Node.js). El patrón general:

```typescript
// Ejemplo de llamada al API desde un Client Component
// Usa el Route Handler de Next.js como proxy (/app/api/*) para proteger la URL del backend
const response = await fetch(`/api/inventario?sucursal_id=${id}`, {
  credentials: 'include', // Incluye cookies automáticamente
  cache: 'no-store',
});

// Desde un Server Component, se puede llamar directamente al API backend:
// const response = await fetch(`${process.env.API_URL}/api/v1/inventario?sucursal_id=${id}`, ...)
```

> **Importante:** `NEXT_PUBLIC_URL` apunta al propio frontend (`localhost:3000`). Las llamadas al **backend** desde Client Components deben pasar por los Route Handlers de `/app/api/` o usar `API_URL` en Server Components exclusivamente.

---

## Seguridad del Frontend

El `next.config.ts` configura headers HTTP de seguridad en **todas las rutas**:

| Header | Valor | Propósito |
|---|---|---|
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-Content-Type-Options` | `nosniff` | Previene MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla información de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desactiva APIs sensibles del navegador |
| `Content-Security-Policy` | Ver abajo | Política de contenido estricta |

**CSP configurada:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self' http://localhost:4000;
frame-ancestors 'none';
```

> **Nota sobre `unsafe-eval`:** Es requerido por Next.js en modo desarrollo para el hot-reload. En producción con `npm run build`, revisar si puede eliminarse según el comportamiento del runtime. `unsafe-inline` es requerido por el compilador de React para estilos en línea.

> En producción, el `connect-src` debe actualizarse a la URL real del API (`https://api.tudominio.com`).

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Next.js en modo desarrollo con HMR en `http://localhost:3000` |
| `npm run build` | Genera el bundle optimizado de producción |
| `npm start` | Inicia el servidor de producción (requiere `npm run build` previo) |
| `npm run lint` | Ejecuta ESLint con las reglas de `eslint-config-next` |

---

## Relación con otros Repositorios

| Repositorio | Relación |
|---|---|
| [`repo-infra-db`](../repo-infra-db/) | **Dependencia indirecta** — El frontend no se conecta a la DB directamente, pero la DB debe estar disponible para que el API funcione |
| [`repo-api-service`](../repo-api-service/) | **Dependencia directa** — Toda la lógica de negocio y datos se consume desde `API_URL`. El frontend es un thin client sobre el API |