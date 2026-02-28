# Project Architecture & AI Development Guide

โปรเจกต์นี้ใช้โครงสร้างสถาปัตยกรรม **Clean Architecture** ผสาน **Domain-Driven Design (DDD)** บน Next.js 15 App Router

---

## 1. Directory Structure Rule

การพัฒนาโค้ดใหม่จะต้องจัดกลุ่มตาม **"ฟีเจอร์ (Feature)"**  
ไม่ใช่ตาม **"ประเภทไฟล์"**

ศูนย์กลางของระบบจะอยู่ที่โฟลเดอร์ `src/features/`

```bash
src/
├── app/                  # Routing, Layouts, Page Metadata, Middleware
├── components/           # Global Shared UI (shadcn/ui, Layout wrappers)
├── lib/                  # Global Utilities, API Clients (Supabase, axios)
├── docs/                 # Internal Documentation (.md/.mdx)
└── features/             # Domain Layer (Feature-based Co-location)
    ├── [feature-name]/
    │   ├── components/   # UI เฉพาะของฟีเจอร์นี้
    │   ├── hooks/        # Custom React Hooks สำหรับฟีเจอร์นี้
    │   ├── services/     # Data Access Layer / Server Actions / API calls
    │   ├── store/        # Zustand slice สำหรับฟีเจอร์นี้
    │   └── types/        # TypeScript Interfaces
```

---

## 2. Guidelines for AI Agent (คำแนะนำในการขยายระบบ)

หาก AI จำเป็นต้องพัฒนาหรือแก้ไขส่วนใด  
ให้ยึดหลักการทำงานดังต่อไปนี้:

### Adding a New UI Component

- หากเป็นคอมโพเนนต์ที่ใช้ซ้ำได้ทั่วแอป → วางที่ `src/components/ui`
- หากเป็นคอมโพเนนต์เฉพาะทาง (เช่น `JiraBoard`) → วางที่  
  `src/features/[feature-name]/components/`

---

### Fetching Data / API Calls

- ต้องใช้ **TanStack Query** เสมอ เพื่อจัดการ:
  - Loading
  - Error
  - Caching
- ให้เรียกใช้ฟังก์ชัน **Server Actions**  
  ที่ประกาศไว้ในโฟลเดอร์ `services/` ของแต่ละฟีเจอร์

---

### Managing State

- หากเป็น **Client State ชั่วคราว**
  - เช่น Modal open/close
  - การจัดเรียงเลย์เอาต์
  - วันที่ที่เลือกบนปฏิทิน  
    → ให้ใช้ **Zustand**

- ❌ ห้ามใช้ Zustand เก็บแคชข้อมูลจาก API  
  (หน้าที่นี้เป็นของ TanStack Query เท่านั้น)

---

### Authentication & RBAC

- การเข้าถึงข้อมูลและการเรนเดอร์ UI  
  ต้องตรวจสอบ Session ผ่าน **Auth.js** เสมอ
- หากต้องสร้างเส้นทางหน้าใหม่สำหรับ Admin  
  ต้องเพิ่มการดักจับเส้นทางใน `src/middleware.ts` ทุกครั้ง

---

### Styling

- ใช้ **TailwindCSS เท่านั้น**
- ห้ามเขียน CSS ภายนอก
- หากเป็นแอนิเมชัน ให้ใช้ **Framer Motion** ครอบ Component

---

### Database Schema Changes

- หากต้องการเพิ่มตารางฐานข้อมูล:
  - ให้เขียนในรูปแบบ **Declarative Schema (`.sql`)** ของ Supabase
  - รันคำสั่ง Migration
- ❌ ห้ามสร้างตารางผ่าน UI ของ Supabase
