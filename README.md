# Vapa Service Desk

Plataforma multiempresa de service desk para `servicedesk.vapa.es`, siguiendo la misma línea técnica y visual que `vapa.es`.

## Stack
- Backend: Java 21 + Spring Boot 3
- Frontend: React 18 + Vite + TypeScript
- Base de datos: PostgreSQL
- Auth/SSO: OAuth2/OIDC (Google, Apple, Microsoft) mediante Keycloak o Auth0/WorkOS
- Infra: Docker Compose + Nginx

## Características principales
- Multi-tenant con aislamiento estricto por empresa
- Registro self-service de empresas
- Alta de usuarios mediante SSO
- Portal de tickets por empresa
- Roles: owner, admin, agent, requester
- SLA, comentarios, adjuntos, auditoría y notificaciones

## Estructura
- `backend/`: API REST y dominio multi-tenant
- `frontend/`: aplicación React
- `infra/`: docker-compose, nginx y variables de despliegue
- `docs/`: arquitectura y decisiones
