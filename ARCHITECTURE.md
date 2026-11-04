# Hand Portal — Architecture (Phase 1)

## Data flow ต่อหนึ่งเฟรม

```
getUserMedia → <video>
      │
      ├─► hand-tracking.js  (MediaPipe HandLandmarker, VIDEO mode, ≤2 มือ)
      │        └─► landmarks (normalized 0..1, พิกัดภาพดิบไม่กลับด้าน)
      │
      ├─► gesture.js  (open / fist / pinch + debounce + cooldown + latch)
      │        └─► events: toggleMode, nextFilter  + สถานะ portalOpen
      │
      ├─► portal.js   (เรขาคณิต Portal: จุดซ้าย/ขวา, ขนาด, smoothing, fade)
      │        └─► quad/วงรี ในพิกัดหน้าจอ (mirror แล้ว)
      │
      └─► renderer.js
               ├─ วาดภาพกล้องเต็มจอ (ปกติ)
               ├─ 2D: clip ด้วยรูปทรง Portal → วาดภาพที่ผ่าน filter
               └─ 3D: WebGL shader (perspective + depth) เฉพาะในรูปทรง Portal
```

## โมดูล

| ไฟล์ | หน้าที่ | สถานะ |
|---|---|---|
| `js/camera.js` | เปิด/ปิด/สลับกล้อง, จัดการ error, ปรับความละเอียด | Phase 3 ✅ |
| `js/ui.js` | ปุ่ม, สถานะ, แจ้งเตือน error | Phase 3 ✅ (ส่วนที่เกี่ยวกับกล้อง) |
| `js/main.js` | ประกอบโมดูล, render loop (rAF) | Phase 3 ✅ (แสดงภาพกล้อง) |
| `js/hand-tracking.js` | MediaPipe Hand Landmarker (CDN v0.10.21), mirror, จัดช่องซ้าย/ขวา | Phase 4 ✅ |
| `js/smoothing.js` | One Euro Filter ลดมือสั่น | Phase 4 ✅ |
| `js/gesture.js` | กางมือ/กำมือ/Pinch + debounce, latch, cooldown | Phase 5 ✅ (ทดสอบตรรกะด้วย `node --test tests/`) |
| `js/portal.js` | เรขาคณิต Portal | Phase 6 |
| `js/renderer.js` | Canvas 2D + WebGL | Phase 6, 8 |
| `js/filters.js` | Filter registry 11 แบบ | Phase 7 |
| `js/performance.js` | วัด FPS, ลดภาระอัตโนมัติ | Phase 10 |

## การตัดสินใจหลัก

- **Mirror**: คำนวณ landmark ทั้งหมดในพิกัดภาพดิบ แล้วกลับแกน X ครั้งเดียวตอนแปลงเป็นพิกัดหน้าจอ (เฉพาะกล้องหน้า) เพื่อกันมือซ้าย/ขวาสลับ
- **ซ้าย/ขวาของ Portal**: ตัดสินจากตำแหน่ง X บนหน้าจอของปลายนิ้วชี้ ไม่พึ่งป้ายกำกับ Left/Right ของ MediaPipe (ป้ายสลับได้เมื่อกลับภาพ)
- **Filter Engine**: registry แบบ `{ id, name, apply }` — เพิ่มฟิลเตอร์ = เพิ่มรายการเดียว
- **3D**: WebGL shader จริง (perspective + depth) ไม่ใช่แค่ขยาย/หมุนภาพ
- **MediaPipe**: โหลดจาก CDN ตอนใช้งาน (ต้องใช้อินเทอร์เน็ต)
- **Deploy**: static ล้วน, relative path, GitHub Pages (HTTPS)

## ข้อจำกัดที่ต้องรู้ตั้งแต่ต้น

- กล้องใช้ได้เฉพาะ HTTPS หรือ `localhost`
- ยังไม่ได้ทดสอบบนอุปกรณ์จริง — จะระบุในสรุปส่งมอบ
- iOS Safari: ต้องเปิดกล้องจากการกดปุ่ม และใช้ `playsinline`
- สลับกล้องหน้า/หลัง ทำได้เฉพาะอุปกรณ์ที่มีหลายกล้อง
