# Development Workflow for Daily Tracking Dashboard

คุณคือ AI Software Engineer ที่เชี่ยวชาญด้าน Next.js, Clean Architecture และระบบ Enterprise  
ให้สร้างโปรเจกต์ตามสเตปดังต่อไปนี้อย่างเคร่งครัด:

---

## Phase 1: Initial Setup & Base Architecture

- สร้าง Next.js 15 App Router project พร้อม TypeScript และ TailwindCSS
- ติดตั้งและตั้งค่า shadcn/ui เบื้องต้น (components.json)
- สร้างโครงสร้างโฟลเดอร์แบบ Clean Architecture / DDD  
  โดยสร้างโฟลเดอร์ `src/features/` และแบ่งย่อยเป็น:
  - auth
  - dashboard
  - external-apis
  - daily-notes
  - ai-chatbot
  - members
  - user-profile
- ติดตั้ง Zustand และ TanStack Query พร้อมสร้าง Global Provider ห่อหุ้มระบบ

---

## Phase 2: Supabase DB & PDPA Consent

- เขียนไฟล์ Declarative Schemas (SQL) สำหรับ Supabase  
  สร้างตาราง:
  - users
  - user_roles
  - user_settings
  - oauth_tokens
  - daily_notes
  - note_revisions
- สร้างหน้า UI สำหรับแสดง PDPA Privacy Policy  
  และ Consent Checkbox เมื่อผู้ใช้ล็อกอินครั้งแรก

---

## Phase 3: Authentication & RBAC Middleware

- ติดตั้ง Auth.js v5 (NextAuth) และสร้าง Google OAuth Provider
- สร้าง `src/middleware.ts` เพื่อป้องกันหน้า Dashboard โดยต้องมี Session
- เพิ่มลอจิก RBAC ใน Middleware:
  - ตรวจสอบ Custom Claims หรือ Role จาก DB
  - หาก Role เป็น `user` ห้ามเข้าถึง `/dashboard/members` เด็ดขาด

---

## Phase 4: Core Layout & Drag-and-Drop

- สร้าง Base Layout ด้วย CSS Grid (Bento Grid) ให้รองรับ Mobile-first
- ติดตั้ง dnd-kit ลงในโดเมน `features/dashboard`  
  เพื่อทำให้ Widget แต่ละตัวสามารถลากสลับตำแหน่งได้
- สร้าง Zustand Store เพื่อจัดการ Array Order ของ Widget  
  และซิงค์กับ Supabase `user_settings`

---

## Phase 5: Progressive Auth & External APIs

- สร้าง Dialog Modal (shadcn) สำหรับรับ API Keys / Credentials ของ Jira และ Microsoft
- พัฒนา Server Actions ร่วมกับ TanStack Query:
  - ดึงข้อมูล Jira Active Sprint
  - ดึงข้อมูล Google / Microsoft Calendar
- จัดการ Fallback UI State:
  - หาก Widget ไหนยังไม่มี Credentials ให้แสดงปุ่ม `"Connect"`

---

## Phase 6: Daily Notes & File Export

- ติดตั้ง Tiptap Editor ใน `features/daily-notes`
- ผูกข้อมูลเข้ากับ Supabase `daily_notes` table
- สร้าง Route Handler (`/api/export`)  
  โดยใช้ไลบรารี `xlsx` (SheetJS) เพื่อ:
  - ดึงข้อมูลรายวัน
  - แปลงเป็น Excel buffer
  - ให้ผู้ใช้ดาวน์โหลดไฟล์

---

## Phase 7: User Profile & Member Management

### User Profile

- พัฒนา `features/user-profile`
- ติดตั้ง `react-easy-crop`
- สร้าง UI ครอบตัดรูปภาพ
- อัปโหลดไฟล์ไปยัง Supabase Storage

### Member Management (เฉพาะ super_admin)

- พัฒนา `features/members`
- สร้าง DataTable (shadcn)
- ลิสต์รายชื่อผู้ใช้
- เปลี่ยน Role ได้

---

## Phase 8: AI Chatbot & Tool Calling

- ติดตั้ง Vercel AI SDK ใน `features/ai-chatbot`
- สร้างฟังก์ชัน Tool Calling  
  เพื่อให้ LLM สามารถดึงข้อมูลจาก:
  - `fetchJiraTasks`
  - `fetchCalendar`
  - `fetchNotes`
- ให้ตอบผู้ใช้แบบเรียลไทม์

---

## Phase 9: UX Polish & Offline Resilience

- เพิ่ม Framer Motion
  - ผูก `layoutId` กับ Modal และ Cards
  - ทำ Shared Element Transition
- สร้าง Hook ดักจับสถานะออฟไลน์
  - แจ้งเตือนผ่าน `sonner` Toast
  - จัดการหยุดการส่งข้อมูลชั่วคราว
