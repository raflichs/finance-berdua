# 🚀 Panduan Deploy Finance Berdua

> Build: `npm run build` → `dist/` | Worker: `worker.js` + `wrangler.jsonc` | DB: `finance_berdua` @ `asia-southeast1`

## Yang Lo Butuhin
- Akun Google (Firebase)
- Akun Cloudflare (Worker) atau Netlify (alternatif)
- Node.js 18+

---

## LANGKAH 1 — Setup Firebase (±5 menit)

1. Buka **console.firebase.google.com** → **Add project** → nama misal `finance-berdua`
2. **Project Settings** → **Your apps** → `</>` Web → Register → copy `FIREBASE_CONFIG`
3. **Build → Realtime Database** → Create Database → lokasi **Singapore (asia-southeast1)** → **Start in test mode** → Enable
4. **Build → Authentication** → Sign-in method → enable **Anonymous**

### Rules (opsional, sudah ada `firebase.rules.json`)
```json
{ "rules": { "finance_berdua": { ".read": "auth != null", ".write": "auth != null" } } }
```

---

## LANGKAH 2 — Isi Config

1. Buka `src/config/firebase.js`:
```js
const FIREBASE_CONFIG = {
  apiKey: "GANTI_API_KEY",
  authDomain: "GANTI_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://GANTI_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "GANTI_PROJECT_ID",
  ...
};
```
2. Ganti `GANTI_...` dengan nilai dari Firebase Console → Save
3. Config otomatis ke-copy ke `dist/` pas `npm run build`

---

## LANGKAH 3 — Build (±1 menit)

```bash
npm install
npm run build
```

Output: `dist/` (app.js + tabs + config + icon + Finance_Tracker_Pro.xlsx + manifest.json)
- `dist/` sudah di-`.gitignore` — jangan commit manual, hasil `npm run build`
- Cek lokal: `npx serve dist` atau `python -m http.server 8765` → buka `http://localhost:8765/index.html`

---

## LANGKAH 4 — Deploy

### Opsi A — Cloudflare Workers (recommended, ada `/api/scan-struk` proxy)

```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
# paste key dari https://aistudio.google.com/app/apikey

npx wrangler deploy
```

- `wrangler.jsonc` sudah set `assets.directory = "dist"` + `not_found_handling = "single-page-application"` + `main = "worker.js"`
- Worker proxy: `POST /api/scan-struk` → Gemini 2.5 Flash (struk scan). Tanpa secret, scan akan `500 GEMINI_API_KEY not set`
- Dev lokal: `npm run dev` atau `npx wrangler dev --assets dist`

### Opsi B — Netlify (tanpa Worker scan)

1. Buka **app.netlify.com** → **Add new site → Deploy manually**
2. **Drag & drop folder `dist`** (bukan `finance-berdua/` atau root) → selesai
3. `app.netlify.com` kasih link `https://xxx.netlify.app` → optional rename `finance-kita.netlify.app`
4. Catatan: fitur Foto Struk (Gemini) tidak jalan tanpa Worker. Alternatif: deploy Worker terpisah untuk `/api/scan-struk`

---

## LANGKAH 5 — Flow Saldo Awal (biar balance M-banking)

1. Buka link → isi nama → login
2. **Set Saldo Awal** muncul (jika DB kosong): isi **QRIS** (M-banking) + **Cash** → Simpan. Atau Lewati kalau saldo 0
3. Dashboard `QRIS` = bandingkan dengan M-banking, `Total = QRIS + Cash`
4. **Atur Cash** (Input → Atur Cash): Tarik/Setor + isi **Biaya admin** opsional (otomatis jadi Pengeluaran Tagihan QRIS)
5. **Koreksi Saldo** (Dashboard → ⚖️ Koreksi Saldo): isi saldo M-banking sekarang → selisih auto jadi Penyesuaian Saldo

Test: Saldo awal 5jt QRIS → tarik 500k + admin 5k → QRIS 4.495.000 Cash 500k Total 4.995.000

---

## LANGKAH 6 — Share ke Pasangan

Kirim link deploy ke pasangan via WhatsApp. Buka link yang sama di 2 HP → login nama beda → data sync real-time + notifikasi.

**iPhone Add to Home Screen:** Safari → Share (kotak panah atas) → Add to Home Screen → Add

---

## ✅ Checklist

- [ ] `src/config/firebase.js` sudah diisi
- [ ] Realtime Database + Anonymous Auth enabled
- [ ] `npm run build` sukses, `dist/` ke-generate
- [ ] Deploy `dist` (Wrangler atau Netlify) bisa dibuka
- [ ] 2 HP login nama beda → input muncul real-time
- [ ] Saldo QRIS balance dengan M-banking

---

## ❓ Troubleshooting

**Data ga ke-sync?** → Cek Realtime Database rules `auth != null` dan Firebase config benar

**Scan struk 500?** → `wrangler secret put GEMINI_API_KEY` belum diisi

**Export Excel ga jalan?** → Upload dulu `Finance_Tracker_Pro.xlsx` di Dashboard (disimpan di IndexedDB) → Export lagi

**Build gagal `JSX`?** → `node scripts/build.js` pakai `esbuild --jsx=transform`. Pastikan `npm install` sudah
