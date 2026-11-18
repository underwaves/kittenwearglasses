# 🎀 เว็บไซต์ Portfolio @kittenwearglasses (ร้านรับตัดต่อวิดีโอ)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![SQLite / D1](https://img.shields.io/badge/Cloudflare-D1%20SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2%20Storage-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2/)

เว็บไซต์ Portfolio & Booking Studio สไตล์ Coquette Aesthetic สำหรับร้านรับตัดต่อวิดีโอ **@kittenwearglasses** พัฒนาด้วยสถาปัตยกรรมโมเดิร์น Full-stack Serverless บน Cloudflare 100% ตอบโจทย์ทั้งความสวยงาม ประสบการณ์ผู้ใช้ และความปลอดภัยระดับ Enterprise

🌐 **URL เว็บไซต์จริง (Production):** [https://kittenwearglasses.wo-nad.workers.dev](https://kittenwearglasses.wo-nad.workers.dev)  
🔐 **ทางเข้าระบบหลังบ้าน (Admin Dashboard):** [https://kittenwearglasses.wo-nad.workers.dev/admin](https://kittenwearglasses.wo-nad.workers.dev/admin)  
🔑 **รหัสผ่านแอดมิน:** กำหนดผ่าน Cloudflare Worker Secret (`ADMIN_PASSWORD`) และคีย์เซสชัน (`SESSION_SECRET`) ไม่มีการฮาร์ดโค้ดหรือเก็บใน source code

---

## ✨ ไฮไลต์ฟีเจอร์เด่น (Key Features)

### 🎀 ประสบการณ์ผู้ใช้และดีไซน์ (Frontend & Coquette Aesthetic)
- **Coquette Aesthetic UI:** ดีไซน์ธีมหวานละมุน สีชมพูกุหลาบและครีม พร้อมเส้นสายโบว์ริบบิ้น ประกายดาว และการ์ดลูกไม้สุดคิ้วท์
- **แถบไอคอนลอยแนวตั้งด้านขวา (Floating Icon Navigation Rail):** ลอยตรึงด้านขวา เข้าถึง 8 เมนูหลักได้ทันทีจากทุกหน้า พร้อมเอฟเฟกต์ Tooltip เด้งซ้ายนุ่มนวล
- **เครื่องเล่นเพลงพื้นหลัง (Background Music Player):** เล่นเพลงบรรเลงน่ารักคลอเบาๆ จาก YouTube IFrame API พร้อมแผ่นไวนิลหมุน ควบคุม เล่น/หยุด/ปิดเสียง ได้ที่มุมซ้ายล่าง และสลับเพลงได้ผ่านระบบหลังบ้าน
- **เอฟเฟกต์อุ้งเท้าน้องแมว (Cat Paws Interaction):**
  - **Falling Paws (3D Layering):** อุ้งเท้าแมวลอยตกแต่ง โดย ~70% ลอยอยู่หลังการ์ด และ ~30% สุ่มลอยผ่านหน้าการ์ดอย่างเป็นธรรมชาติ
  - **Paw Trail:** รอยเท้าแมวน่ารักเดินตามเคอร์เซอร์เมาส์ (ปิดอัตโนมัติเมื่ออุปกรณ์เปิด `prefers-reduced-motion`)
- **Video Modal Player:** รองรับการเปิดคลิปวิดีโอทันที (YouTube, Shorts, TikTok, Google Drive) ด้วย Modal สัดส่วน 9:16 และ 16:9 อัตโนมัติ พร้อมปุ่มคัดลอกลิงก์ตรงและแชร์
- **เครื่องคิดราคา & ออกใบเสนอราคา (Price Calculator):** คิดราคางานตัดต่อตามแพ็กเกจ บริการเสริม (ซับไตเติล/ไฟล์ SRT/พากย์เสียง) งานด่วน คำนวณมัดจำ และสร้างสรุปบรีฟกดส่งเข้า LINE OA ได้ทันทีในคลิกเดียว

### 🛡️ สถาปัตยกรรมและความปลอดภัย (Backend & Security)
- **Serverless 100% on Cloudflare Workers:** รวม Frontend SPA และ REST API ไว้ใน Worker เดียว ทำงานเร็ว เสิร์ฟจาก Edge ทั่วโลก
- **Cloudflare D1 (SQLite Edge DB):** ฐานข้อมูลไร้เซิร์ฟเวอร์ จัดเก็บผลงาน บริการ ราคา คิวงาน ประกาศ รีวิว คำถามที่พบบ่อย และการตั้งค่า
- **Cloudflare R2 Object Storage:** จัดเก็บรูปภาพปกผลงานและรีวิวลูกค้า ย่อและแปลงเป็น WebP ตั้งแต่ฝั่งไคลเอนต์เพื่อประหยัด bandwidth
- **Enterprise-grade Auth & Security:**
  - รหัสผ่านเปรียบเทียบด้วย Constant-time (`crypto.subtle.timingSafeEqual`) ป้องกัน Timing Attack
  - HMAC-SHA256 Signed Session Token เก็บใน Cookie ชนิด `HttpOnly`, `Secure`, `SameSite=Lax` อายุ 7 วัน
  - ตรวจสอบ Origin/CSRF อย่างเข้มงวด และ Rate Limiting บันทึกลง D1 ป้องกัน Brute-force (ผิดเกิน 5 ครั้ง ล็อก 15 นาที)
  - File Upload Validation ตรวจสอบ Magic Bytes จริงใน Buffer ป้องกันการปลอมแปลง MIME Type
  - XSS Protection ทำ Sanitize ลิงก์ URL และข้อความทั้งหมด

---

## 🛠️ Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + React Router
- **Backend / API:** Cloudflare Workers + Hono (TypeScript) เสิร์ฟทั้ง static SPA assets และ REST API ใน Worker เดียวกัน
- **Database:** Cloudflare D1 (SQLite Edge Database)
- **Object Storage:** Cloudflare R2 (สำหรับจัดเก็บรูปภาพปกผลงานและแบนเนอร์โปรโมชั่นโดยเฉพาะ ไม่เก็บไฟล์วิดีโอ)
- **Security & Auth:** HMAC-SHA256 Signed Cookie (HttpOnly, Secure, SameSite=Lax, อายุ 7 วัน) + Rate Limiting 5 ครั้ง/15 นาที + CSRF Origin Checking

---

## 🎀 โครงสร้างหน้าเว็บ (Public Pages)

1. **หน้าแรก (`/`)**
   - Hero Section แนะนำร้าน ปุ่มทางลัดไปยังผลงาน เรทราคา และไลน์
   - แถบโปรโมชั่นพิเศษที่กำลังใช้งาน (Active Promo)
   - แสดงผลงานเด่นล่าสุด 6 รายการ พร้อมเปิดดูคลิปทันที
   - ตัวอย่างแพ็กเกจบริการ 3 ระดับ พร้อมป้ายราคาทรงดาว
   - สรุปขั้นตอนสั่งตัดต่อ 4 ขั้นตอน
2. **หน้าผลงาน (`/portfolio`)**
   - แกลเลอรีผลงานแบบ Grid แยกสัดส่วนอัตโนมัติตามแนวคลิป (แนวตั้ง 9:16 / แนวนอน 16:9)
   - ตัวกรอง: ทั้งหมด / แนวตั้ง / แนวนอน และหมวดหมู่ (Shorts/Reels/TikTok, Vlog, อื่น ๆ)
   - กดที่การ์ดแล้ว **เปิดเล่นวิดีโอผ่าน Modal ทันที** (มีระบบ Focus Trap, ปิดด้วย ESC หรือคลิกด้านนอก, สัดส่วน responsive ตามแนวคลิป)
3. **บริการและราคา (`/services`)**
   - เรทราคาตัดต่อ (คลิปไม่เกิน 1 นาที 300.- / 1–3 นาที 400–800.- / 3–5 นาที 900–1,000.-)
   - บริการเสริม (Add-on): ซับไตเติลไทย (+100/150/200, มีไฟล์ SRT +50), พากย์เสียงบรรยาย (+150/200/250)
   - Accordion ขั้นตอนสั่งงาน 4 ขั้น และเงื่อนไขการรับงานอย่างละเอียด
4. **โปรโมชั่น (`/promotions`)**
   - การ์ดโปรโมชั่น แบนเนอร์ วันที่เริ่ม-หมดอายุ และปุ่มทักสอบถามทาง LINE
5. **ติดต่อเรา (`/contact`)**
   - ปุ่มลัดเปิดแชท LINE OA `@882xaxoy` และ TikTok `@kittenwearglasses`
   - ปุ่มคัดลอกไอดี LINE พร้อมการแจ้งเตือน
   - **ปุ่มลอย LINE (Floating Action Button)** ที่มุมขวาล่างทุกหน้าเว็บ

---

## 👑 คู่มือการใช้งานระบบหลังบ้าน (Admin Guide)

### 1. การเข้าสู่ระบบ
- ไปที่ `/admin` หรือคลิกลิงก์ **"ระบบหลังบ้าน (Admin)"** ที่ด้านล่างสุดของเว็บ
- ใส่รหัสผ่านแอดมิน (หากกรอกผิดเกิน 5 ครั้ง ระบบจะระงับการลองใหม่เป็นเวลา 15 นาที เพื่อความปลอดภัย)

### 2. การเพิ่มและจัดการผลงาน (Works)
- **วางลิงก์วิดีโอช่องเดียว:** ระบบจะตรวจจับและแปลงลิงก์ embed ให้อัตโนมัติ:
  - **YouTube:** รองรับ `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...` (ระบบจะดึงภาพปกความละเอียดสูงให้อัตโนมัติ หรือเลือกอัปโหลดเองได้)
  - **TikTok:** ต้องใช้ลิงก์เต็มในรูปแบบ `https://www.tiktok.com/@username/video/เลขไอดี` *(หากมีลิงก์แบบย่อ เช่น vm.tiktok.com ให้เปิดในเบราว์เซอร์แล้วคัดลอก URL เต็มมาวาง)* และจำเป็นต้องอัปโหลดภาพปก
  - **Google Drive:** รองรับ `drive.google.com/file/d/รหัสไฟล์/view` และจำเป็นต้องอัปโหลดภาพปก
- **การอัปโหลดภาพปก:**
  - ระบบจะทำการ**ย่อขนาดภาพ (ไม่เกิน 1280px) และแปลงเป็นไฟล์ WebP คุณภาพสูงให้ทันทีบนเครื่องของคุณ** ก่อนส่งขึ้น Cloudflare R2 ทำให้โหลดไวและประหยัดพื้นที่
  - เมื่อคุณลบผลงานหรือเปลี่ยนรูป ระบบจะลบไฟล์เก่าใน R2 ให้อัตโนมัติ ไม่เปลืองพื้นที่
- **การเรียงลำดับผลงาน:** กดปุ่ม **เลื่อนขึ้น (↑)** หรือ **เลื่อนลง (↓)** ในตารางเพื่อจัดลำดับผลงานตามต้องการ

> ⚠️ **คำเตือนเรื่องการตั้งค่าสิทธิ์วิดีโอ:**
> - วิดีโอบน **YouTube** ต้องตั้งสถานะเป็น **สาธารณะ (Public)** หรือ **ไม่เป็นสาธารณะ (Unlisted)** เพื่อให้ผู้เข้าชมสามารถเล่นวิดีโอบนหน้าเว็บได้
> - วิดีโอบน **TikTok** ต้องเป็นคลิปสาธารณะ
> - ไฟล์บน **Google Drive** ต้องตั้งค่าการแชร์เป็น **"ทุกคนที่มีลิงก์ (Anyone with the link)"** สามารถดูได้

### 3. การจัดการบริการ เรทราคา และเงื่อนไข
- สามารถแก้ไขราคา, คำอธิบาย, จุดเด่นในแต่ละแพ็กเกจ
- ปรับเปลี่ยนเรทราคาบริการเสริม (ซับไทย, พากย์เสียง)
- ปรับปรุงขั้นตอนการทำงานและเงื่อนไขการรับงาน

### 4. การจัดการโปรโมชั่น
- เพิ่มโปรโมชั่นใหม่ ใส่แบนเนอร์ วันเริ่มต้น-สิ้นสุด
- เมื่อโปรโมชั่นหมดอายุ ระบบจะซ่อนออกจากหน้าเว็บให้อัตโนมัติ

### 5. การตั้งค่าเว็บไซต์ (Settings) & ฟังก์ชันเสริม Phase 2
- **จัดการสถานะคิวงาน (`/admin/queue` หรือในหน้า `/admin/settings`):**
  - กดเลือกสถานะคิวด้วยคลิกเดียว (`เปิดรับงาน` สีเขียวพาสเทล / `คิวเริ่มเต็ม` สีเหลือง / `ปิดรับชั่วคราว` สีชมพู) พร้อมกรอกข้อความเสริม เช่น `"คิวถัดไปว่างวันที่ 25"`
  - หากตั้งเป็น `"ปิดรับชั่วคราว"` หน้าเครื่องคิดราคา (`/calculator`) จะแสดงแถบแจ้งเตือนและเปลี่ยนปุ่มส่งออเดอร์เป็น `"สอบถามคิวทาง LINE"` อัตโนมัติ
- **เครื่องคิดราคา (`/calculator`):**
  - ดึงราคาแพ็กเกจและบริการเสริมจากตาราง `services` และ `addons` ใน D1 โดยตรง (แก้ไขเรทราคาที่เมนู `บริการและราคา` แล้วเครื่องคิดราคาจะอัปเดตตามทันที)
  - ตั้งค่า % งานด่วน, % มัดจำ และเรท `.SRT` ได้ที่หน้า `ตั้งค่าเว็บไซต์`
- **จัดการแถบประกาศด้านบนเว็บ (`/admin/announcements`):**
  - สร้าง/แก้ไขประกาศ กำหนดลิงก์ วันเริ่ม–วันหมดอายุ และลำดับความสำคัญ (ระบบจะแสดงประกาศที่เปิดใช้งานและมีลำดับสูงสุดเพียงอันเดียว ลูกค้ากดปิดชั่วคราวได้ต่อ session)
- **จัดการรีวิวจากลูกค้า (`/admin/reviews`):**
  - รองรับการเลือกอัปโหลดภาพแคปรีวิว**หลายภาพพร้อมกัน** (ระบบย่อและแปลงเป็น WebP ฝั่ง client อัตโนมัติ จำกัด 5 MB/ภาพ)
  - เรียงลำดับขึ้น/ลง แก้ไขคำบรรยาย (ใช้เป็น `alt` text) ซ่อน หรือลบรีวิว (เมื่อลบจะลบไฟล์ใน R2 อัตโนมัติ)
- **จัดการคำถามที่พบบ่อย (`/admin/faqs`):**
  - เพิ่ม/แก้ไข/ลบ/เรียงลำดับคำถาม-คำตอบที่แสดงในหน้า `/faq`
- **ลิงก์ตรงผลงานรายชิ้น (`/portfolio/:id`):**
  - กดปุ่ม `"คัดลอกลิงก์"` ในหน้าต่างเล่นวิดีโอเพื่อแชร์ลิงก์ตรงไปยังผลงานชิ้นนั้น พร้อมรองรับ Dynamic Open Graph / Twitter Preview ผ่าน Cloudflare `HTMLRewriter`

---

## 🔐 วิธีเปลี่ยนรหัสผ่านแอดมิน (Change Admin Password)

รหัสผ่านแอดมินถูกเก็บไว้อย่างปลอดภัยใน **Cloudflare Worker Secrets** ไม่ได้ฝังไว้ในโค้ด คุณสามารถเปลี่ยนรหัสผ่านได้ทุกเมื่อด้วยคำสั่ง:

```bash
npx wrangler secret put ADMIN_PASSWORD
```
พิมพ์รหัสผ่านใหม่ที่ต้องการ แล้วกด `Enter`

---

## 💻 คำสั่งสำหรับนักพัฒนา (Developer Commands)

### ติดตั้ง Dependencies
```bash
npm install
```

### รันในเครื่อง (Local Development)
```bash
# 1. รัน D1 migration ในเครื่อง
npm run d1:migrate:local

# 2. เริ่มต้น dev server (Vite + Wrangler Dev)
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend Worker API: `http://127.0.0.1:8787`

### บิลด์และ Deploy ขึ้น Cloudflare
```bash
# บิลด์ Frontend + Deploy Worker ไปยัง Cloudflare
npm run deploy
```

---

🎀 พัฒนาด้วยความประณีตสำหรับร้าน **@kittenwearglasses**
