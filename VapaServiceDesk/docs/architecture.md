# Arquitectura

## Objetivo
Construir un service desk multiempresa con backend Java y frontend React, reutilizando la estructura conceptual de Vapa: separación clara entre frontend, backend e infraestructura.

## Principios
- Multi-tenant por `tenant_id` y `tenant_slug`
- Todos los accesos de datos deben ir filtrados por tenant
- Autenticación global, autorización scoped por tenant
- Onboarding self-service con creación de empresa y owner inicial vía SSO
