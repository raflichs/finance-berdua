# 🚀 Panduan Deploy Finance Berdua

## Yang Lo Butuhin
- Akun Google (buat Firebase)
- Akun Netlify — gratis di netlify.com

---

## LANGKAH 1 — Setup Firebase (±5 menit)

1. Buka **console.firebase.google.com**
2. Klik **"Add project"** → kasih nama (misal: "finance-berdua") → klik Continue sampai selesai
3. Di sidebar kiri, klik ⚙️ **Project Settings**
4. Scroll ke bawah ke **"Your apps"** → klik ikon **`</>`** (Web)
5. Kasih nama app (misal: "finance-web") → klik **Register app**
6. **Copy semua nilai config** yang muncul (apiKey, authDomain, dll) — lo butuh ini nanti

### Setup Database:
7. Di sidebar kiri, klik **Build → Realtime Database**
8. Klik **"Create Database"**
9. Pilih lokasi **Singapore (asia-southeast1)** → klik Next
10. Pilih **"Start in test mode"** → klik Enable

---

## LANGKAH 2 — Isi Config ke File

1. Buka file **`index.html`** dengan Notepad (Windows) atau TextEdit (Mac)
2. Cari bagian ini di baris ~24:

```
const FIREBASE_CONFIG = {
  apiKey:            "GANTI_API_KEY_LO",
  authDomain:        "GANTI_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://GANTI_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  ...
};
```

3. Ganti setiap nilai `"GANTI_..."` dengan nilai dari config Firebase lo
4. **Save** file-nya

---

## LANGKAH 3 — Deploy ke Netlify (±2 menit)

1. Buka **app.netlify.com** → Login dengan Google
2. Klik **"Add new site" → "Deploy manually"**
3. **Drag & drop folder `finance-berdua`** ke area yang muncul
4. Tunggu sebentar... ✅ **Selesai!**
5. Netlify kasih link otomatis, contoh: `https://spontaneous-mochi-abc123.netlify.app`

### Kasih nama yang lebih gampang (opsional):
- Di dashboard Netlify → **Site configuration → Change site name**
- Ganti jadi misalnya `finance-kita` → linknya jadi `finance-kita.netlify.app`

---

## LANGKAH 4 — Share ke Pasangan

Kirim link Netlify ke pasangan lo lewat WhatsApp.

**Di iPhone (biar kayak app beneran):**
1. Buka link di **Safari**
2. Tap ikon **Share** (kotak dengan panah ke atas)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

Sekarang ikonnya muncul di home screen iPhone, tinggal tap langsung buka! 🎉

---

## ✅ Checklist Sebelum Pakai

- [ ] Firebase config sudah diisi di index.html
- [ ] Realtime Database sudah di-enable di Firebase Console
- [ ] App sudah bisa dibuka di browser
- [ ] Lo dan pasangan bisa login dengan nama masing-masing
- [ ] Coba input transaksi → cek apakah muncul di HP pasangan (real-time!)

---

## ❓ Troubleshooting

**Data ga ke-sync?**
→ Pastikan Realtime Database sudah di-enable dan rules-nya "test mode"

**App ga bisa dibuka?**
→ Pastikan semua nilai FIREBASE_CONFIG sudah diisi dengan benar (tidak ada yang masih "GANTI_...")

**Export Excel ga jalan?**
→ Upload dulu file Finance_Tracker_Pro.xlsx di halaman Dashboard
