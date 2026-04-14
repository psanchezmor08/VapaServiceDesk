# Vapa Service Desk

Sistema de gestión empresarial completo con service desk, clientes, proyectos, trabajadores, facturas y balance financiero.

## Stack
- **Backend:** FastAPI + MongoDB
- **Frontend:** React + Tailwind CSS
- **Deploy:** Docker + Cloudflare Tunnel

## Módulos
- 🎫 **Tickets** — Gestión de incidencias con prioridades, estados y comentarios
- 👥 **Clientes** — Base de datos de clientes
- 📁 **Proyectos** — Proyectos por cliente con tareas
- 👷 **Trabajadores** — Gestión de empleados y departamentos
- 📄 **Facturas** — Facturación con alertas de vencimiento
- 💰 **Balance** — Ingresos, gastos y pagos programados
- ⚙️ **Usuarios** — Gestión de usuarios y roles

## Instalación

1. Copia `.env.example` a `.env` y configura las variables
2. Instala dependencias del frontend:
```bash
cd frontend && npm install --legacy-peer-deps
```
3. Construye y levanta:
```bash
docker-compose build --no-cache
docker-compose up -d
```

## URLs
- Frontend: http://localhost:7001
- Backend API: http://localhost:8002
- API Docs: http://localhost:8002/docs

## Roles
- **admin** — Control total
- **manager** — Gestión de equipos y proyectos
- **agent** — Gestión de tickets
- **client** — Solo lectura de sus tickets
