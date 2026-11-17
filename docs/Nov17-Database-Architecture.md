# LedgerGuard – Dynamic Multi-Tenant Database Architecture

## 1. Multi-Tenant Architecture
Multi-tenancy allows multiple organizations to use the same application while keeping their data isolated.

## 2. Database Architecture
LedgerGuard follows a separate database per tenant approach.

Example:
- Tenant A – ledgerguard_tenant_a
- Tenant B – ledgerguard_tenant_b
- Tenant C – ledgerguard_tenant_c

## 3. Dynamic MongoDB Connections
Dynamic database connections allow the application to select the appropriate MongoDB database based on the authenticated tenant.

Mongoose method: createConnection()

## 4. Connection Pooling
Connection pooling reuses existing database connections instead of creating a new connection for every request.

Benefits:
- Reduces repeated connections.
- Saves database resources.
- Improves application efficiency.

## 5. Security
Tenant information must be obtained from a verified JWT and validated against the Tenant collection. Client-provided database names must never be trusted directly.

## Project Objective
Implement secure, reusable MongoDB connections for individual LedgerGuard tenants.