# Daily Tracking Dashboard

## Enterprise System Specification (v1.0)

---

# 1. Executive Summary

Daily Tracking Dashboard คือ Enterprise-grade Productivity Platform
ที่รวม Jira, Calendar, Daily Notes และ AI Reporting
ไว้ภายในระบบเดียว

ระบบถูกออกแบบภายใต้แนวคิด:

- Secure by Design
- Scalable by Architecture
- Observable by Default
- AI-Augmented Productivity

---

# 2. System Scope

## In Scope

- OAuth-based Authentication (Google)
- Role-Based Access Control (RBAC)
- Dashboard Layout Customization (Drag & Drop)
- Jira & Calendar Integration
- Rich Text Daily Notes + Revision History
- AI Assistant (Cross-widget Context)
- Excel Export
- Offline Resilience

## Out of Scope

- Public API Exposure
- Multi-tenant SaaS Billing
- Mobile Native App

---

# 3. Non-Functional Requirements

## 3.1 Performance

- First Load TTFB < 800ms
- Lighthouse Score ≥ 90
- Dashboard Widget Load < 1.2s

## 3.2 Scalability

- Horizontal scaling via Vercel Edge
- Stateless App Layer
- Supabase managed PostgreSQL

## 3.3 Security

- OAuth 2.0 via Auth.js
- RBAC Enforcement at:
  - Middleware Layer
  - Server Action Layer
- Row-Level Security (RLS) via Supabase
- No sensitive tokens stored in client

## 3.4 Observability

- Structured Logging
- Error Boundary Wrapping
- Query Error Monitoring

---

# 4. Architecture Overview

Frontend: Next.js 15 App Router (RSC + Server Actions)  
Backend: Supabase PostgreSQL  
Auth: Auth.js v5  
AI: Vercel AI SDK

---

# 5. Data Model Overview

## Core Tables

users
user_roles
user_settings
oauth_tokens
daily_notes
note_revisions

All tables must:

- Use UUID primary keys
- Enable Row-Level Security
- Enforce foreign key constraints

---

# 6. Role-Based Access Control

Roles:

- super_admin
- user

Enforcement Layers:

1. Middleware Route Protection
2. Server Action Guard
3. Supabase RLS Policy

---

# 7. Progressive Authorization Model

External APIs (Jira, Microsoft) require:

- Explicit Credential Input
- Token Encryption
- Consent Confirmation (PDPA)

Widget States:

- Disconnected
- Connected
- Error
- Loading

---

# 8. AI System Design

AI Assistant must:

- Access domain services only via Tool Calling
- Never directly query database
- Provide explainable summaries
- Operate within user scope (RBAC filtered)

---

# 9. Data Export Specification

Export Format: XLSX  
Library: SheetJS

Requirements:

- Daily Export
- Range Export
- Filename format:
  daily-report-YYYY-MM-DD.xlsx

---

# 10. Deployment Environment

Production:

- Vercel
- Supabase Managed DB

Environment Separation:

- Development
- Staging
- Production

Environment variables must be validated on boot.
