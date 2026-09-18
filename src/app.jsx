const { useState, useEffect, useRef } = React;

const DB_PATH = "finance_berdua";
const KATEGORI = {
  Pemasukan: ["Gaji", "Bonus", "Lainnya"],
  Pengeluaran: ["Makan", "Transport", "Belanja", "Tagihan", "Nongkrong", "Hiburan", "Tabungan", "Pulsa/Kuota", "Lainnya"],
};
const EMOJI = {
  Gaji: "💼", Bonus: "🎁", Makan: "🍜", Transport: "🚗",
  Belanja: "🛍️", Tagihan: "📋", Nongkrong: "☕", Hiburan: "🎮",
  Tabungan: "🐷", "Pulsa/Kuota": "📱", Lainnya: "📦",
};
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const pad2 = n => String(n).padStart(2, "0");
const toLocalDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const toLocalMonthKey = (date = new Date()) => toLocalDateKey(date).slice(0, 7);
const fmtRp = n => "Rp " + Math.abs(Math.round(Number(n) || 0)).toLocaleString("id-ID");
const accountLabel = account => account === "Cash" ? "Cash" : "QRIS";
const txAccount = t => accountLabel(t.account || t.paymentMethod || "QRIS");
const txSign = t => t.jenis === "Pemasukan" ? 1 : t.jenis === "Pengeluaran" ? -1 : 0;
const parseMoney = val => {
  if (typeof val === "number") return Number.isFinite(val) ? Math.round(val) : 0;
  const digits = String(val ?? "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};
const today = () => toLocalDateKey();
const fmtDate = s => { if (!s) return ""; const [, m, d] = s.split("-"); return `${d} ${BULAN[+m - 1]}`; };
const monthLabel = key => { const [y, m] = key.split("-"); return `${BULAN[+m - 1]} ${y}`; };
const txMonth = t => (t && t.tanggal) ? t.tanggal.slice(0, 7) : '';
const THREE_MONTHS_AGO = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return toLocalMonthKey(d); })();
const GEMINI_API_KEY = "AIzaSyBZMc-FwSso4QFgDR60zuYuJieDWc67Q6g";

// ── IndexedDB untuk simpan template binary ──
const IDB = {
  open: () => new Promise((res, rej) => {
    const r = indexedDB.open("finance_berdua_db", 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore("tpl");
    r.onsuccess = e => res(e.target.result);
    r.onerror = () => rej();
  }),
  save: async (name, buffer) => {
    try { const d = await IDB.open(); d.transaction("tpl", "readwrite").objectStore("tpl").put({ name, buffer }, "k"); } catch { }
  },
  load: async () => {
    try {
      const d = await IDB.open();
      return await new Promise((res, rej) => {
        const r = d.transaction("tpl", "readonly").objectStore("tpl").get("k");
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => rej(null);
      });
    } catch { return null; }
  },
};

// ── Parse tanggal dari Excel ──
const excelDateToStr = val => {
  if (!val) return null;
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return null;
  }
  if (typeof val === "number") {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return null;
};

// ── Download helper (iOS Safari compatible) ──
const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@media (hover: none) {
  ::-webkit-scrollbar{display:none;}
}
body{background:#060608; overflow-x: hidden;}

/* ── Layout ── */
.app{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#060608;min-height:100dvh;color:#fff;max-width:430px;margin:0 auto;display:flex;flex-direction:column;position:relative;}
.screen{flex:1;display:flex;flex-direction:column;}
.scroll{flex:1;overflow-y:auto;padding:0 16px calc(112px + env(safe-area-inset-bottom));}

/* ── Header ── */
.hdr{padding:calc(48px + env(safe-area-inset-top)) 16px 8px;display:flex;justify-content:space-between;align-items:flex-end;}
.hdr-sub{font-size:13px;color:rgba(255,255,255,.35);font-weight:600;letter-spacing:-.1px;}
.hdr-title{font-size:28px;font-weight:700;color:#fff;margin-top:2px;letter-spacing:-.6px;}
.hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px;}

/* ── Status badges ── */
.badge{display:flex;align-items:center;gap:4px;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:-.1px;}
.badge-on{background:rgba(52,199,89,.12);border:.5px solid rgba(52,199,89,.3);color:#34c759;}
.badge-off{background:rgba(255,59,48,.1);border:.5px solid rgba(255,59,48,.25);color:#ff3b30;}
.badge-partner{background:rgba(88,86,214,.15);border:.5px solid rgba(88,86,214,.4);color:#a78bfa;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.75);}}
.dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.dot-on{background:#34c759;animation:pulse 2s infinite;}
.dot-off{background:#ff3b30;}
.dot-pur{background:#a78bfa;animation:pulse 2s infinite;}

/* ── Premium Glass Styles ── */
.premium-glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.raised-card {
    background: #111114;
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
}
.raised-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 70%);
    pointer-events: none;
}
.glow-text-error {
    text-shadow: 0 0 15px rgba(255, 90, 95, 0.3);
}
.glow-text-tertiary {
    text-shadow: 0 0 15px rgba(71, 226, 102, 0.3);
}

/* ── Balance card — glowing glass + indigo tint ── */
.balance-card{margin:12px 16px 20px;background:linear-gradient(135deg, rgba(88,86,214,.12), rgba(167,139,250,.04));border-radius:24px;padding:22px;border:1px solid rgba(88,86,214,.25);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);position:relative;overflow:hidden;box-shadow:0 12px 32px -8px rgba(88,86,214,.2), inset 0 1px 1px rgba(255,255,255,0.1);}
.balance-card::before{content:'';position:absolute;top:-60px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(88,86,214,.22) 0%,transparent 70%);pointer-events:none;}
.bal-label{font-size:12px;color:rgba(255,255,255,.45);font-weight:600;letter-spacing:-.1px;}
.bal-amount{font-size:38px;font-weight:700;color:#fff;margin:6px 0 18px;letter-spacing:-1.5px;text-shadow:0 2px 10px rgba(0,0,0,0.3);}
.bal-row{display:flex;gap:8px;}
.mini-stat{flex:1;background:rgba(255,255,255,.04);border-radius:16px;padding:12px 14px;border:1px solid rgba(255,255,255,.06);backdrop-filter:blur(10px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);}
.mini-label{font-size:10px;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:.5px;text-transform:uppercase;display:flex;align-items:center;gap:4px;}
.mini-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.mini-val{font-size:15px;font-weight:700;margin-top:5px;letter-spacing:-.4px;}

/* ── Section title ── */
.sec-title{font-size:11px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}

/* ── Category bars ── */
.cat-bar-wrap{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.cat-bar-bg{flex:1;background:rgba(255,255,255,.06);border-radius:999px;height:4px;}
.cat-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#5856d6,#a78bfa);}

/* ── Transaction items ── */
.tx-item{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:.5px solid rgba(255,255,255,.05);transition:background .2s;}
.tx-icon{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);}
.tx-info{flex:1;min-width:0;}
.tx-desc{font-size:15px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.2px;}
.tx-meta{font-size:12px;color:rgba(255,255,255,.35);margin-top:2px;font-weight:400;}
.who-badge{font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;display:inline-block;margin-top:4px;letter-spacing:-.1px;}
.tx-amount{font-size:15px;font-weight:700;flex-shrink:0;letter-spacing:-.3px;}
.del-btn{background:none;border:none;cursor:pointer;font-size:14px;opacity:.3;padding:4px;line-height:1;transition:opacity .15s;}
.del-btn:hover{opacity:0.8;}

/* ── Form card — glass ── */
.form-card{background:rgba(20,20,25,.55);border-radius:24px;border:1px solid rgba(255,255,255,.07);padding:22px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 12px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,0.05);}
.toggle-row{display:flex;background:rgba(0,0,0,.35);border-radius:14px;padding:3px;margin-bottom:20px;border:1px solid rgba(255,255,255,.05);}
.tog-btn{flex:1;padding:11px;border-radius:11px;border:none;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;background:none;color:rgba(255,255,255,.35);letter-spacing:-.2px;}
.tog-in{background:rgba(52,199,89,.15)!important;color:#34c759!important;}
.tog-out{background:rgba(255,59,48,.12)!important;color:#ff3b30!important;}
.field-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.35);margin-bottom:8px;}
.inp{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 16px;color:#fff;font-family:inherit;font-size:16px;outline:none;margin-bottom:16px;transition:all .2s;-webkit-appearance:none;letter-spacing:-.2px;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}
.inp:focus{border-color:rgba(88,86,214,.6);background:rgba(255,255,255,.06);box-shadow:0 0 12px rgba(88,86,214,0.15);}
.inp::placeholder{color:rgba(255,255,255,.2);}
.kat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
.kat-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:12px 6px;text-align:center;font-size:11px;font-weight:600;color:rgba(255,255,255,.45);cursor:pointer;line-height:1.4;letter-spacing:-.1px;transition:all .15s;}
.kat-item.sel{border-color:rgba(88,86,214,.5);background:rgba(88,86,214,.15);color:#a78bfa;box-shadow:0 0 12px rgba(88,86,214,0.12);}

/* ── Submit button — indigo accent ── */
.submit-btn{width:100%;padding:15px;border-radius:16px;border:none;background:linear-gradient(135deg,#5856d6,#7c7aff);color:#fff;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;letter-spacing:-.2px;transition:opacity .15s, transform 0.1s;box-shadow:0 4px 16px rgba(88,86,214,0.3);}
.submit-btn:disabled{opacity:.3;cursor:not-allowed;box-shadow:none;}
.submit-btn:active{opacity:.85;transform:scale(0.98);}

/* ── Filters ── */
.filter-row{display:flex;gap:6px;overflow-x:auto;margin:0 -16px;padding:0 16px 12px;scrollbar-width:none;}
.filter-pill{flex-shrink:0;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:999px;padding:8px 16px;font-size:12px;font-weight:600;color:rgba(255,255,255,.4);cursor:pointer;white-space:nowrap;letter-spacing:-.1px;transition:all .2s;}
.filter-pill.sel{background:rgba(88,86,214,.18);border-color:rgba(88,86,214,.5);color:#a78bfa;box-shadow:0 0 8px rgba(88,86,214,0.12);}
.export-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:7px 14px;font-family:inherit;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);cursor:pointer;display:flex;align-items:center;gap:5px;letter-spacing:-.1px;transition:all .2s;}
.export-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,0.12);}

/* ── Toast ── */
.toast{position:fixed;top:calc(16px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(28,28,30,.92);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:10px 20px;font-size:13px;font-weight:600;color:#fff;z-index:9999;white-space:nowrap;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);animation:toastIn .2s ease;letter-spacing:-.2px;box-shadow:0 8px 24px rgba(0,0,0,0.5);}
.toast.err{background:rgba(40,10,10,.92);border-color:rgba(255,59,48,.25);color:#ff3b30;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-6px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* ── Sync bar ── */
.sync-bar{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#7c7aff,transparent);background-size:200%;animation:syncAnim 1.2s ease-in-out infinite;z-index:9999;}
@keyframes syncAnim{0%{background-position:-100%}100%{background-position:300%;}}

/* ── Floating Bottom Nav — Premium Glassmorphism ── */
.bnav{position:fixed;bottom:calc(16px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:398px;height:72px;background:rgba(15,15,18,.75);border:1px solid rgba(255,255,255,.08);border-radius:24px;display:flex;align-items:center;justify-content:space-around;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 12px 40px rgba(0,0,0,.6);z-index:999;padding:0 8px;}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:16px;cursor:pointer;border:none;background:none;transition:all .2s;color:rgba(255,255,255,.4);position:relative;}
.nav-btn.act{color:#a78bfa;background:rgba(88,86,214,.12);box-shadow:inset 0 0 12px rgba(88,86,214,.08);}
.nav-btn.act::after{content:'';position:absolute;bottom:4px;width:4px;height:4px;border-radius:50%;background:#a78bfa;box-shadow:0 0 8px #a78bfa;}
.nav-icon{font-size:20px;line-height:1;margin-bottom:2px;}
.nav-label{font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:currentColor;}

/* ── Empty states ── */
.empty{text-align:center;padding:52px 20px;}
.empty-icon{font-size:44px;margin-bottom:10px;}
.empty-text{font-size:15px;font-weight:500;color:rgba(255,255,255,.3);letter-spacing:-.2px;}
.empty-sub{font-size:13px;margin-top:5px;color:rgba(255,255,255,.18);}

/* ── Modal — layered glass ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:1000;display:flex;align-items:flex-end;justify-content:center;}
.modal-sheet{background:rgba(20,20,24,.98);border-radius:26px 26px 0 0;border:1px solid rgba(255,255,255,.1);padding:28px 20px 44px;width:100%;max-width:430px;animation:slideUp .3s cubic-bezier(.32,0,.67,0);box-shadow:0 -10px 40px rgba(0,0,0,0.5);}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
.modal-title{font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;text-align:center;letter-spacing:-.4px;}
.modal-sub{font-size:14px;color:rgba(255,255,255,.4);margin-bottom:20px;line-height:1.5;text-align:center;letter-spacing:-.1px;}
.modal-close{width:100%;padding:14px;border-radius:15px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;margin-top:10px;letter-spacing:-.2px;}

/* Debt screens */
.debt-bg{background:#111827;background-image:radial-gradient(at 0% 0%, rgba(15,23,42,.95) 0, transparent 50%),radial-gradient(at 50% 0%, rgba(31,41,55,.55) 0, transparent 52%),radial-gradient(at 100% 0%, rgba(15,23,42,.9) 0, transparent 50%);}
.debt-card{background:rgba(17,24,39,.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 48px rgba(0,0,0,.28);width:100%;max-width:430px;margin-left:auto;margin-right:auto;}
.debt-input{background:rgba(255,255,255,.05);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);}
.debt-muted-btn{background:#4b5563;border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.debt-pill{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#d1d5db;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;}
.debt-pill-active{background:#3a2a4c;color:#f1b6ff;border-color:rgba(115,51,133,.5);}
.debt-label{font-size:11px;line-height:14px;letter-spacing:1px;font-weight:700;text-transform:uppercase;color:#9ca3af;}
.debt-progress{box-shadow:0 0 15px rgba(71,226,102,.4);}

@media (min-width: 900px) {
  .app{width:min(100% - 48px, 1180px);max-width:1180px;}
  .screen{width:100%;}
  .hdr,.scroll{width:min(100%, 960px);margin-left:auto;margin-right:auto;}
  .hdr{padding-left:24px;padding-right:24px;}
  .scroll{padding-left:24px;padding-right:24px;padding-bottom:128px;}
  .balance-card{margin-left:0;margin-right:0;}
  .form-card{max-width:720px;margin-left:auto;margin-right:auto;}
  .kat-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
  .filter-row{flex-wrap:wrap;overflow-x:visible;margin-left:0;margin-right:0;padding-left:0;padding-right:0;}
  .modal-overlay{align-items:center;padding:24px;}
  .modal-sheet{max-width:560px;border-radius:26px;padding:28px 28px 32px;}
  nav.fixed.bottom-0{width:min(100% - 48px, 960px);max-width:960px;left:50%;border-radius:24px 24px 0 0;}
  .debt-card{max-width:860px;}
  .app .max-w-lg,.app .max-w-2xl{max-width:860px;}
}
`;

const KAT_COLORS = {
  Makan: "#f87171",
  Transport: "#60a5fa",
  Belanja: "#f472b6",
  Tagihan: "#fb923c",
  Nongkrong: "#fb7185",
  Hiburan: "#c084fc",
  Tabungan: "#34d399",
  "Pulsa/Kuota": "#38bdf8",
  Lainnya: "#9ca3af",
  Gaji: "#34d399",
  Bonus: "#fbbf24",
};

function SubtleDonutChart({ data, total }) {
  const radius = 26;
  const strokeWidth = 5;
  const size = 76;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius; // ~163.36
  let currentOffset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {data.map(([kat, val], idx) => {
          const pct = val / total;
          const strokeLength = pct * circumference;
          const strokeOffset = circumference - strokeLength + currentOffset;
          currentOffset -= strokeLength;

          return (
            <circle
              key={kat}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={KAT_COLORS[kat] || "#a78bfa"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          );
        })}
      </svg>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none"
      }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Total</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 1 }}>
          {total > 1000000 ? `${(total / 1000000).toFixed(1)}jt` : total > 1000 ? `${(total / 1000).toFixed(0)}rb` : total}
        </span>
      </div>
    </div>
  );
}

const DEFAULT_WEDDING_CATS = [
  { id: 1, nama: "Venue & Gedung", icon: "🏛️", target: 15000000, warna: "#f472b6" },
  { id: 2, nama: "Catering", icon: "🍽️", target: 12000000, warna: "#fb923c" },
  { id: 3, nama: "Baju & MUA", icon: "👗", target: 8000000, warna: "#a78bfa" },
  { id: 4, nama: "Dokumentasi", icon: "📸", target: 5000000, warna: "#60a5fa" },
  { id: 5, nama: "Dekorasi", icon: "💐", target: 5000000, warna: "#34d399" },
  { id: 6, nama: "Undangan & Lainnya", icon: "💌", target: 5000000, warna: "#fbbf24" },
];

function App() {
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [myName, setMyName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [toast, setToast] = useState(null);
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterMonth, setFilterMonth] = useState("");
  const [dashMonth, setDashMonth] = useState(() => toLocalMonthKey());
  const [search, setSearch] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(null);
  const [form, setForm] = useState({ tanggal: today(), jenis: "Pengeluaran", kategori: "Makan", deskripsi: "", nominal: "", account: "QRIS" });
  const [cashForm, setCashForm] = useState({ tanggal: today(), mode: "withdraw", deskripsi: "Tarik cash", nominal: "" });
  const [sheetUrl, setSheetUrl] = useState("");
  const [showGSheetModal, setShowGSheetModal] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── Input sub-tab ──
  const [inputSubTab, setInputSubTab] = useState("normal"); // "normal" | "split"

  // ── Debt sub-tabs ──
  const [debtView, setDebtView] = useState("list");
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [debtList, setDebtList] = useState([]);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [debtForm, setDebtForm] = useState({ name: "", type: "Hutang", total: "", paid: "", keterangan: "", kategori: "", jatuhTempo: "" });
  // Edit debt
  const [showEditDebtModal, setShowEditDebtModal] = useState(false);
  const [editDebtForm, setEditDebtForm] = useState(null);
  // Payment form
  const [paymentNominal, setPaymentNominal] = useState("");
  const [paymentTanggal, setPaymentTanggal] = useState(today());
  const [paymentCatatan, setPaymentCatatan] = useState("");
  // More menu
  const [showDebtMenu, setShowDebtMenu] = useState(false);
  const debtListRef = React.useRef([]);

  // ── selectedDebt is always derived from debtList (never stale) ──
  const selectedDebt = debtList.find(d => d.id === selectedDebtId) || null;

  // ── Save debtList ke Firebase ──
  const saveDebtList = async (list) => {
    try {
      const obj = {};
      list.forEach(d => { obj[d.id] = d; });
      await db.ref(`${DB_PATH}/debts`).set(obj);
    } catch (e) { showToast("Gagal sync hutang!", "err"); }
  };

  const handleAddDebt = async () => {
    const total = parseMoney(debtForm.total);
    if (!debtForm.name.trim() || !total) { showToast("Nama dan total harus diisi!", "err"); return; }
    const keterangan = debtForm.keterangan.trim() || debtForm.kategori || "-";
    const newDebt = { id: Date.now(), name: debtForm.name.trim(), type: debtForm.type, total, paid: 0, keterangan, jatuhTempo: debtForm.jatuhTempo, cicilan: [] };
    const updatedList = [newDebt, ...debtListRef.current];
    debtListRef.current = updatedList;
    setDebtList(updatedList);
    setShowDebtModal(false);
    setDebtForm({ name: "", type: "Hutang", total: "", paid: "", keterangan: "", kategori: "", jatuhTempo: "" });
    await saveDebtList(updatedList);
    showToast(`${newDebt.type} ${newDebt.name} berhasil dicatat! ✅`);
  };

  const handleSavePayment = async () => {
    const nominal = parseMoney(paymentNominal);
    if (!nominal || nominal <= 0) { showToast("Nominal harus diisi!", "err"); return; }
    if (!selectedDebt) return;
    const sisa = selectedDebt.total - selectedDebt.paid;
    const bayar = Math.min(nominal, sisa);
    const cicilanId = Date.now();
    const txId = cicilanId + 1;
    const newCicilan = { id: cicilanId, nominal: bayar, tanggal: paymentTanggal, catatan: paymentCatatan.trim() || "", txId };
    const updatedDebt = {
      ...selectedDebt,
      paid: selectedDebt.paid + bayar,
      cicilan: [...(selectedDebt.cicilan || []), newCicilan],
    };
    const debtTx = {
      id: txId,
      tanggal: paymentTanggal,
      jenis: selectedDebt.type === "Hutang" ? "Pengeluaran" : "Pemasukan",
      kategori: selectedDebt.type === "Hutang" ? "Tagihan" : "Lainnya",
      deskripsi: `${selectedDebt.type === "Hutang" ? "Bayar hutang" : "Terima pembayaran piutang"} - ${selectedDebt.name}`,
      nominal: bayar,
      account: "QRIS",
      addedBy: myName,
      source: "debt_payment",
      debtId: selectedDebt.id,
      cicilanId,
    };
    const updatedList = debtListRef.current.map(d => d.id === selectedDebt.id ? updatedDebt : d);
    const updatedTxs = [debtTx, ...txsRef.current];
    debtListRef.current = updatedList;
    setDebtList(updatedList);
    txsRef.current = updatedTxs;
    setTransactions(updatedTxs);
    await Promise.all([saveDebtList(updatedList), saveTx(updatedTxs)]);
    setPaymentNominal(""); setPaymentCatatan(""); setPaymentTanggal(today());
    setDebtView("detail");
    const lunas = updatedDebt.paid >= updatedDebt.total;
    showToast(lunas ? `${selectedDebt.name} lunas & masuk riwayat! 🎉` : `Cicilan Rp${bayar.toLocaleString("id-ID")} masuk riwayat! ✅`);
  };

  const handleMarkLunas = async () => {
    if (!selectedDebt) return;
    const sisa = selectedDebt.total - selectedDebt.paid;
    if (sisa <= 0) { showToast("Sudah lunas!"); return; }
    const cicilanId = Date.now();
    const txId = cicilanId + 1;
    const payDate = today();
    const newCicilan = { id: cicilanId, nominal: sisa, tanggal: payDate, catatan: "Dilunasi sekaligus", txId };
    const updatedDebt = {
      ...selectedDebt,
      paid: selectedDebt.total,
      cicilan: [...(selectedDebt.cicilan || []), newCicilan],
    };
    const debtTx = {
      id: txId,
      tanggal: payDate,
      jenis: selectedDebt.type === "Hutang" ? "Pengeluaran" : "Pemasukan",
      kategori: selectedDebt.type === "Hutang" ? "Tagihan" : "Lainnya",
      deskripsi: `${selectedDebt.type === "Hutang" ? "Lunasi hutang" : "Terima pelunasan piutang"} - ${selectedDebt.name}`,
      nominal: sisa,
      account: "QRIS",
      addedBy: myName,
      source: "debt_payment",
      debtId: selectedDebt.id,
      cicilanId,
    };
    const updatedList = debtListRef.current.map(d => d.id === selectedDebt.id ? updatedDebt : d);
    const updatedTxs = [debtTx, ...txsRef.current];
    debtListRef.current = updatedList;
    setDebtList(updatedList);
    txsRef.current = updatedTxs;
    setTransactions(updatedTxs);
    await Promise.all([saveDebtList(updatedList), saveTx(updatedTxs)]);
    showToast(`${selectedDebt.name} lunas & masuk riwayat! 🎉`);
  };

  const handleDeleteDebt = async (id) => {
    const updated = debtListRef.current.filter(d => d.id !== id);
    debtListRef.current = updated;
    setDebtList(updated);
    setDebtView("list");
    setSelectedDebtId(null);
    setShowEditDebtModal(false);
    await saveDebtList(updated);
    showToast("Entri dihapus 🗑️", "err");
  };

  const handleEditDebt = async () => {
    if (!editDebtForm) return;
    if (!editDebtForm.name.trim() || !editDebtForm.total) { showToast("Nama dan total harus diisi!", "err"); return; }
    const updatedDebt = {
      ...editDebtForm,
      total: parseMoney(editDebtForm.total) || editDebtForm.total,
      keterangan: editDebtForm.keterangan.trim() || "-",
    };
    const updatedList = debtListRef.current.map(d => d.id === updatedDebt.id ? updatedDebt : d);
    debtListRef.current = updatedList;
    setDebtList(updatedList);
    setShowEditDebtModal(false);
    await saveDebtList(updatedList);
    showToast("Hutang berhasil diedit! ✅");
  };

  // ── Auto-fallback: if selectedDebt disappears (deleted from other device), go back to list ──
  useEffect(() => {
    if ((debtView === "detail" || debtView === "payment") && selectedDebtId && !selectedDebt) {
      setDebtView("list");
      setSelectedDebtId(null);
      showToast("Entri dihapus dari perangkat lain 🔄");
    }
  }, [debtList, selectedDebtId, debtView]);

  // ── Dana Nikah State ──
  const [weddingSettings, setWeddingSettings] = useState({ target: 50000000, tanggal: "", categories: DEFAULT_WEDDING_CATS });
  const [showWeddingEdit, setShowWeddingEdit] = useState(false);
  const [weddingEditForm, setWeddingEditForm] = useState({ target: "", tanggal: "" });
  const [showCatEdit, setShowCatEdit] = useState(false);
  const [editingCats, setEditingCats] = useState([]);
  const [weddingActiveSection, setWeddingActiveSection] = useState("overview"); // "overview" | "alokasi"

  // ── Split Bill State ──
  const [sbStep, setSbStep] = useState(0); // 0=temen, 1=pilih mode, 2=assign, 3=summary
  const [sbInputMode, setSbInputMode] = useState(null); // null=pilih, "scan", "manual"
  const [sbFriends, setSbFriends] = useState([]);
  const [sbItems, setSbItems] = useState([]);
  const [sbAssigned, setSbAssigned] = useState({}); // {itemId: [names]}
  const [sbFriendInput, setSbFriendInput] = useState("");
  const [sbItemName, setSbItemName] = useState("");
  const [sbItemPrice, setSbItemPrice] = useState("");
  const [sbSelectedFor, setSbSelectedFor] = useState(["Gue"]);
  const [sbPaidMap, setSbPaidMap] = useState({});
  const [sbExported, setSbExported] = useState(false);
  const [sbScanning, setSbScanning] = useState(false);
  const [sbScanProgress, setSbScanProgress] = useState(0);
  const sbFileRef = useRef(null);

  const nameRef = useRef("");
  const writingRef = useRef(false);
  const txsRef = useRef([]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (typeof auth === "undefined") {
      setAuthError("Firebase Auth belum ke-load. Cek script firebase-auth di index.html.");
      return;
    }

    let cancelled = false;
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!cancelled && user) {
        setAuthReady(true);
        setAuthError("");
      }
    });

    auth.signInAnonymously().catch(err => {
      if (cancelled) return;
      setAuthReady(false);
      setAuthError(
        err && err.code === "auth/operation-not-allowed"
          ? "Anonymous Auth belum aktif di Firebase Console."
          : `Gagal login anonim ke Firebase${err && err.code ? ` (${err.code})` : ""}.`
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Load template dari IndexedDB saat buka app
  useEffect(() => {
    IDB.load().then(saved => {
      if (saved) { setTemplateData(saved.buffer); setTemplateName(saved.name); }
    });
  }, []);

  // ── Minta izin notifikasi & setup listener ──
  const setupNotif = async (name) => {
    if (!("Notification" in window)) return;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      // Listen ke notif yang ditujukan ke user ini di Firebase
      db.ref(`finance_berdua/notifs/${name}`).on("child_added", snap => {
        const n = snap.val();
        if (!n) return;
        // Tampilkan notifikasi browser
        if (document.visibilityState === "hidden" || document.visibilityState === "visible") {
          new Notification(n.title, {
            body: n.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200],
          });
        }
        // Hapus notif dari DB setelah ditampilkan
        snap.ref.remove();
      });
    } catch (e) { console.log("Notif setup failed:", e); }
  };

  // ── Kirim notifikasi ke user lain via Firebase DB ──
  const sendNotif = async (title, body) => {
    try {
      // Ambil semua nama user kecuali sendiri
      const snap = await db.ref("finance_berdua/heartbeats").get();
      const users = snap.val() || {};
      const others = Object.keys(users).filter(n => n !== nameRef.current);
      if (others.length === 0) return;
      const now = Date.now();
      await Promise.all(others.map(name =>
        db.ref(`finance_berdua/notifs/${name}`).push({ title, body, ts: now })
      ));
    } catch (e) { console.log("Send notif failed:", e); }
  };

  // Firebase listener
  useEffect(() => {
    if (!nameSet || !authReady) return;
    nameRef.current = myName;
    setupNotif(myName);

    const txRef = db.ref(`${DB_PATH}/transactions`);
    const txListener = (snap) => {
      if (writingRef.current) return;
      const data = snap.val();
      const list = data ? Object.values(data).sort((a, b) => b.id - a.id) : [];
      txsRef.current = list;
      setTransactions(list);
      setOnline(true);
    };
    txRef.on("value", txListener, () => setOnline(false));

    const sendHB = () => db.ref(`${DB_PATH}/heartbeats/${myName}`).set(Date.now()).catch(() => { });
    sendHB();
    const hbInt = setInterval(sendHB, 5000);

    const hbRef = db.ref(`${DB_PATH}/heartbeats`);
    const hbListener = (snap) => {
      const hbs = snap.val() || {};
      const now = Date.now();
      const partners = Object.entries(hbs).filter(([n, ts]) => n !== myName && (now - ts) < 12000);
      setPartnerOnline(partners.length > 0);
      if (partners.length > 0) setPartnerName(partners[0][0]);
    };
    hbRef.on("value", hbListener);

    // ── Wedding Settings Listener ──
    const weddingRef = db.ref(`${DB_PATH}/wedding_settings`);
    const weddingListener = (snap) => {
      const val = snap.val();
      if (!val) return;
      // Firebase RTDB converts arrays to objects {0:{...},1:{...}} — convert back
      let cats = DEFAULT_WEDDING_CATS;
      if (val.categories) {
        if (Array.isArray(val.categories)) {
          cats = val.categories;
        } else if (typeof val.categories === "object") {
          cats = Object.values(val.categories);
        }
      }
      setWeddingSettings({ target: val.target || 50000000, tanggal: val.tanggal || "", categories: cats });
    };
    weddingRef.on("value", weddingListener);

    // ── Debt List Listener ──
    const debtRef = db.ref(`${DB_PATH}/debts`);
    const debtListener = (snap) => {
      const val = snap.val();
      const list = val ? Object.values(val).sort((a, b) => b.id - a.id).map(d => ({
        ...d,
        cicilan: d.cicilan
          ? (Array.isArray(d.cicilan) ? d.cicilan : Object.values(d.cicilan))
          : [],
      })) : [];
      debtListRef.current = list;
      setDebtList(list);
    };
    debtRef.on("value", debtListener);

    // ── Sheet URL Listener ──
    const urlRef = db.ref(`${DB_PATH}/sheetUrl`);
    const urlListener = snap => setSheetUrl(snap.val() || "");
    urlRef.on("value", urlListener);

    return () => {
      txRef.off("value", txListener);
      hbRef.off("value", hbListener);
      weddingRef.off("value", weddingListener);
      debtRef.off("value", debtListener);
      urlRef.off("value", urlListener);
      clearInterval(hbInt);
      db.ref(`${DB_PATH}/heartbeats/${myName}`).remove();
    };
  }, [nameSet, myName, authReady]);

  // Save ke Firebase
  const saveTx = async list => {
    writingRef.current = true;
    setSyncing(true);
    try {
      const obj = {};
      list.forEach(t => { obj[t.id] = t; });
      await db.ref(`${DB_PATH}/transactions`).set(obj);
      setOnline(true);
    } catch { setOnline(false); showToast("Gagal sync, cek koneksi!", "err"); }
    finally {
      writingRef.current = false;
      setSyncing(false);
    }
  };

  // ── Split Bill Helpers ──
  const FRIEND_COLORS = ["#f59e0b", "#34c759", "#ff3b30", "#38bdf8", "#fb923c"];
  const SB_PERSON_COLORS = {
    "Gue": { bg: "rgba(255,255,255,.08)", color: "#fff" },
    "Pasangan": { bg: "rgba(175,82,222,.12)", color: "#af52de" },
  };
  const sbGetColor = (name) => {
    if (SB_PERSON_COLORS[name]) return SB_PERSON_COLORS[name];
    const idx = sbFriends.indexOf(name);
    const c = FRIEND_COLORS[idx % FRIEND_COLORS.length];
    return { bg: c + "22", color: c };
  };
  const sbAllPeople = ["Gue", "Pasangan", ...sbFriends];

  // Totals computed from sbAssigned (for scan mode) or item.for (manual mode)
  const sbTotals = (() => {
    const t = {};
    sbAllPeople.forEach(p => { t[p] = 0; });
    sbItems.forEach(item => {
      const assignees = sbInputMode === "scan"
        ? (sbAssigned[item.id] || [])
        : (item.for || []);
      if (assignees.length === 0) return;
      const share = item.price / assignees.length;
      assignees.forEach(p => { t[p] = (t[p] || 0) + share; });
    });
    return t;
  })();
  const sbMyTotal = (sbTotals["Gue"] || 0) + (sbTotals["Pasangan"] || 0);
  const parseRp = parseMoney;
  const sbUnassigned = sbInputMode === "scan"
    ? sbItems.filter(item => (sbAssigned[item.id] || []).length === 0).length
    : 0;

  const sbToggleAssign = (itemId, name) => {
    setSbAssigned(prev => {
      const curr = prev[itemId] || [];
      const next = curr.includes(name) ? curr.filter(x => x !== name) : [...curr, name];
      return { ...prev, [itemId]: next };
    });
  };

  const sbAddFriend = () => {
    const name = sbFriendInput.trim();
    if (!name || sbFriends.includes(name)) return;
    setSbFriends(f => [...f, name]);
    setSbFriendInput("");
  };

  const sbAddItem = () => {
    if (!sbItemName.trim() || !sbItemPrice || sbSelectedFor.length === 0) return;
    const price = parseRp(sbItemPrice);
    if (price <= 0) return;
    setSbItems(items => [...items, { id: Date.now(), name: sbItemName.trim(), price, for: [...sbSelectedFor] }]);
    setSbItemName(""); setSbItemPrice(""); setSbSelectedFor(["Gue"]);
  };

  // ── Scan receipt via Gemini API ──
  const sbScanReceipt = async (file) => {
    setSbScanning(true); setSbScanProgress(10);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      setSbScanProgress(35);
      const mediaType = file.type || "image/jpeg";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mediaType, data: base64 } },
                { text: 'Baca struk/nota ini dan ekstrak semua item beserta harganya. Balas HANYA dengan JSON array seperti ini, tanpa teks lain, tanpa markdown: [{"name": "nama item", "price": 12000}, ...]. Gunakan harga satuan (bukan subtotal). Jika ada qty lebih dari 1, sertakan di nama item.' }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          }),
        }
      );
      setSbScanProgress(80);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

      // Robust JSON extraction
      let clean = text;
      const startIdx = text.indexOf("[");
      const endIdx = text.lastIndexOf("]");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        clean = text.slice(startIdx, endIdx + 1);
      }

      const items = JSON.parse(clean);
      const parsed = items
        .filter(i => i.name && Number(i.price) > 0)
        .map(i => ({ id: Date.now() + Math.random(), name: String(i.name), price: Number(i.price) }));
      if (parsed.length === 0) throw new Error("No items detected");
      setSbItems(parsed);
      setSbScanProgress(100);
      setTimeout(() => { setSbScanning(false); setSbStep(2); }, 400);
      showToast(`${parsed.length} item berhasil dibaca! ✅`);
    } catch (err) {
      console.error(err);
      setSbScanning(false); setSbScanProgress(0);
      showToast("Gagal baca struk, coba foto ulang!", "err");
    }
  };

  const sbExportToFinance = async () => {
    if (sbMyTotal <= 0) return;
    const newTx = {
      tanggal: today(), jenis: "Pengeluaran", kategori: "Nongkrong",
      deskripsi: "Split bill nongkrong", nominal: Math.round(sbMyTotal),
      account: "QRIS", id: Date.now(), addedBy: myName,
    };
    const updated = [newTx, ...txsRef.current];
    txsRef.current = updated; setTransactions(updated);
    await saveTx(updated); setSbExported(true);
    showToast("Rp " + Math.round(sbMyTotal).toLocaleString("id-ID") + " dicatat! ✅");
  };

  const sbReset = () => {
    setSbStep(0); setSbInputMode(null); setSbFriends([]); setSbItems([]);
    setSbAssigned({}); setSbFriendInput(""); setSbItemName(""); setSbItemPrice("");
    setSbSelectedFor(["Gue"]); setSbPaidMap({}); setSbExported(false);
    setSbScanning(false); setSbScanProgress(0);
  };

  // ── Save edited transaction ──
  const handleEditSave = async () => {
    if (!editTx.nominal || !editTx.deskripsi.trim()) { showToast("Lengkapi semua field!", "err"); return; }
    const rawNominal = parseMoney(editTx.nominal);
    if (rawNominal <= 0) { showToast("Nominal harus valid!", "err"); return; }
    const updated = txsRef.current.map(t =>
      t.id === editTx.id ? { ...t, ...editTx, account: txAccount(editTx), nominal: rawNominal } : t
    );
    txsRef.current = updated;
    setTransactions(updated);
    await saveTx(updated);
    setEditTx(null);
    showToast("Transaksi berhasil diupdate! ✅");
  };

  const handleSubmit = async () => {
    const _nom = parseMoney(form.nominal);
    if (!form.nominal || _nom <= 0) { showToast("Nominal harus diisi dan valid!", "err"); return; }
    if (!form.deskripsi.trim()) { showToast("Deskripsi harus diisi!", "err"); return; }
    const rawNominal = _nom;
    const newTx = { ...form, account: txAccount(form), nominal: rawNominal, id: Date.now(), addedBy: myName };
    const updated = [newTx, ...txsRef.current];
    txsRef.current = updated;
    setTransactions(updated);
    await saveTx(updated);
    // Kirim notifikasi ke pasangan
    const jenisLabel = form.jenis === "Pemasukan" ? "pemasukan" : "pengeluaran";
    sendNotif(
      `💰 ${myName} catat ${jenisLabel}`,
      `${form.deskripsi} — ${fmtRp(rawNominal)}`
    );
    setForm({ tanggal: today(), jenis: "Pengeluaran", kategori: "Makan", deskripsi: "", nominal: "", account: "QRIS" });
    showToast("Transaksi tersimpan! ✅");
    setTab("history");
  };

  const handleCashMove = async () => {
    const nominal = parseMoney(cashForm.nominal);
    if (!cashForm.nominal || nominal <= 0) { showToast("Nominal cash harus valid!", "err"); return; }
    if (!cashForm.deskripsi.trim()) { showToast("Deskripsi harus diisi!", "err"); return; }
    const isWithdraw = cashForm.mode === "withdraw";
    const newTx = {
      tanggal: cashForm.tanggal,
      jenis: "CashMove",
      kategori: "Atur Cash",
      deskripsi: cashForm.deskripsi.trim(),
      nominal,
      fromAccount: isWithdraw ? "QRIS" : "Cash",
      toAccount: isWithdraw ? "Cash" : "QRIS",
      id: Date.now(),
      addedBy: myName,
    };
    const updated = [newTx, ...txsRef.current];
    txsRef.current = updated;
    setTransactions(updated);
    await saveTx(updated);
    sendNotif(`Atur cash ${myName}`, `${newTx.deskripsi} - ${fmtRp(nominal)}`);
    setCashForm({ tanggal: today(), mode: "withdraw", deskripsi: "Tarik cash", nominal: "" });
    showToast("Cash berhasil diatur!");
    setTab("history");
  };

  const handleDelete = async id => {
    const updated = txsRef.current.filter(t => t.id !== id);
    txsRef.current = updated;
    setTransactions(updated);
    await saveTx(updated);
    showToast("Transaksi dihapus 🗑️", "err");
  };

  // Upload template + parse data lama
  const handleTemplateUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const buffer = ev.target.result;
      setTemplateData(buffer);
      setTemplateName(file.name);
      IDB.save(file.name, buffer);

      try {
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const parsed = [];
        BULAN.forEach(bulan => {
          if (!wb.SheetNames.includes(bulan)) return;
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[bulan], { header: 1, defval: "" });
          for (let i = 1; i < rows.length; i++) {
            const [tanggalRaw, jenisRaw, kategori, deskripsi, nominalRaw] = rows[i];
            if (!tanggalRaw && !deskripsi) continue;
            if (String(deskripsi).toUpperCase().includes("SUMMARY")) break;
            const tanggal = excelDateToStr(tanggalRaw);
            if (!tanggal) continue;
            const nominal = parseMoney(nominalRaw);
            if (!nominal || isNaN(nominal)) continue;
            const jenis = String(jenisRaw).toLowerCase() === "masuk" ? "Pemasukan" : "Pengeluaran";
            const allKat = [...KATEGORI.Pemasukan, ...KATEGORI.Pengeluaran];
            parsed.push({
              id: parseInt(tanggal.replace(/-/g, "")) * 1000 + i,
              tanggal, jenis,
              kategori: allKat.includes(kategori) ? kategori : "Lainnya",
              deskripsi: String(deskripsi) || "-",
              nominal,
              account: "QRIS",
              addedBy: "Excel Import",
            });
          }
        });
        if (parsed.length > 0) setImportModal({ count: parsed.length, txs: parsed });
        else showToast("Template tersimpan! Belum ada data. 📂");
      } catch (err) {
        console.error(err);
        showToast("Template tersimpan! 📂");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleConfirmImport = async txs => {
    setImportModal(null);
    const existing = txsRef.current.filter(t => t.addedBy !== "Excel Import");
    const merged = [...txs, ...existing].sort((a, b) => b.id - a.id);
    txsRef.current = merged;
    setTransactions(merged);
    await saveTx(merged);
    showToast(`${txs.length} transaksi berhasil diimport! ✅`);
  };

  const handleExport = () => {
    if (!templateData) { showToast("Upload dulu file Excel lo di dashboard!", "err"); return; }
    try {
      const wb = XLSX.read(new Uint8Array(templateData), { type: "array" });
      const byMonth = {};
      [...transactions]
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
        .forEach(t => {
          const key = BULAN[+t.tanggal.split("-")[1] - 1];
          if (!byMonth[key]) byMonth[key] = [];
          byMonth[key].push(t);
        });

      BULAN.forEach(bulan => {
        if (!wb.SheetNames.includes(bulan)) return;
        const txs = byMonth[bulan] || [];
        const ws = wb.Sheets[bulan];
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1:I200");
        // Hapus data lama (baris 2 ke bawah, col A-F)
        for (let r = 1; r <= range.e.r; r++)
          for (let c = 0; c <= 5; c++) {
            const ref = XLSX.utils.encode_cell({ r, c });
            if (ws[ref]) delete ws[ref];
          }
        // Tulis data baru
        let saldo = 0;
        txs.forEach((t, i) => {
          const row = i + 1;
          saldo += txSign(t) * t.nominal;
          [
            { v: Math.floor((new Date(t.tanggal + "T00:00:00") - new Date(Date.UTC(1899, 11, 30))) / 86400000), t: "n", z: "DD/MM/YYYY" },
            { v: t.jenis === "Pemasukan" ? "masuk" : t.jenis === "Pengeluaran" ? "keluar" : "pindah", t: "s" },
            { v: t.kategori, t: "s" },
            { v: t.deskripsi, t: "s" },
            { v: t.nominal, t: "n" },
            { v: saldo, t: "n" },
          ].forEach((cell, c) => { ws[XLSX.utils.encode_cell({ r: row, c })] = cell; });
        });
        if (txs.length > 0) {
          const nr = XLSX.utils.decode_range(ws["!ref"] || "A1:I1");
          nr.e.r = Math.max(nr.e.r, txs.length);
          ws["!ref"] = XLSX.utils.encode_range(nr);
        }
      });

      const arr = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      downloadBlob(blob, templateName || "Finance_Tracker_Pro.xlsx");
      setExportModal(true);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export gagal: " + err.message, "err");
    }
  };

  const handleExportGSheet = async () => {
    if (!sheetUrl) {
      setShowGSheetModal(true);
      return;
    }
    setSyncing(true);
    try {
      const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ transactions }),
        headers: { 'Content-Type': 'text/plain' }
      });
      const result = await response.json();
      if (result.success) {
        showToast("Export ke Google Sheets berhasil! 🎉");
      } else {
        showToast("Export gagal: " + result.error, "err");
      }
    } catch (error) {
      console.error(error);
      showToast("Koneksi gagal! Pastikan URL benar.", "err");
    }
    setSyncing(false);
  };

  // ── Dashboard: filter by selected month ──
  const walletData = (() => {
    return transactions.reduce((acc, t) => {
      const nominal = Number(t.nominal) || 0;
      if (t.jenis === "Pemasukan") acc[txAccount(t)] += nominal;
      if (t.jenis === "Pengeluaran") acc[txAccount(t)] -= nominal;
      if (t.jenis === "CashMove") {
        acc[accountLabel(t.fromAccount)] -= nominal;
        acc[accountLabel(t.toAccount)] += nominal;
      }
      acc.total = acc.QRIS + acc.Cash;
      return acc;
    }, { QRIS: 0, Cash: 0, total: 0 });
  })();

  const dashData = (() => {
    const txs = transactions.filter(t => txMonth(t) === dashMonth);
    const p = txs.filter(t => t.jenis === "Pemasukan").reduce((s, t) => s + t.nominal, 0);
    const q = txs.filter(t => t.jenis === "Pengeluaran").reduce((s, t) => s + t.nominal, 0);
    const byKat = {};
    txs.filter(t => t.jenis === "Pengeluaran").forEach(t => { byKat[t.kategori] = (byKat[t.kategori] || 0) + t.nominal; });
    return { txs, pemasukan: p, pengeluaran: q, saldo: p - q, wallet: walletData, katSorted: Object.entries(byKat).sort((a, b) => b[1] - a[1]) };
  })();

  // Keep summary for backward compat (all-time, used nowhere critical)
  const summary = dashData;

  // ── History: search + filter + 3-month hide ──
  const allMonths = [...new Set(transactions.map(txMonth))].sort().reverse();
  const isSearching = search.trim().length > 0;

  const histFiltered = (() => {
    let result = [...transactions];
    // Hide old unless searching or showOld
    if (!isSearching && !showOld) result = result.filter(t => txMonth(t) >= THREE_MONTHS_AGO);
    // Filter by month pill
    if (filterMonth) result = result.filter(t => txMonth(t) === filterMonth);
    // Filter by jenis/kategori
    if (filterJenis !== "Semua") result = result.filter(t => t.jenis === filterJenis || t.kategori === filterJenis || txAccount(t) === filterJenis);
    // Search across ALL transactions (override hide)
    if (isSearching) {
      const q = search.toLowerCase();
      result = transactions.filter(t =>
        t.deskripsi.toLowerCase().includes(q) ||
        t.kategori.toLowerCase().includes(q) ||
        txAccount(t).toLowerCase().includes(q) ||
        (t.jenis === "CashMove" && "atur cash tarik setor".includes(q)) ||
        (t.addedBy || "").toLowerCase().includes(q)
      );
    }
    return result;
  })();

  const histGrouped = (() => {
    const g = {};
    histFiltered.forEach(t => { const k = txMonth(t); if (!g[k]) g[k] = []; g[k].push(t); });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  })();

  const histPemasukan = histFiltered.filter(t => t.jenis === "Pemasukan").reduce((s, t) => s + t.nominal, 0);
  const histPengeluaran = histFiltered.filter(t => t.jenis === "Pengeluaran").reduce((s, t) => s + t.nominal, 0);
  const oldTxCount = transactions.filter(t => txMonth(t) < THREE_MONTHS_AGO).length;
  const oldMonthMin = transactions.filter(t => txMonth(t) < THREE_MONTHS_AGO).map(txMonth).sort()[0];

  const filteredTx = histFiltered; // keep compat

  const enterApp = () => {
    if (!nameInput.trim() || !authReady) return;
    setMyName(nameInput.trim());
    setNameSet(true);
  };

  // ── Name setup ──
  if (!nameSet) return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#000", minHeight: "100dvh", color: "#fff", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
      <style>{CSS}</style>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>💑</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Finance Berdua</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 8, lineHeight: 1.5 }}>Tracking keuangan bareng pasangan<br />sync otomatis & real-time</div>
      </div>
      <div className="form-card">
        <div className="field-label">Nama lo siapa?</div>
        <input className="inp" placeholder="Contoh: Reza atau Dea..." value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") enterApp(); }}
          autoFocus />
        <button className="submit-btn" disabled={!nameInput.trim() || !authReady} onClick={enterApp}>
          Masuk 🚀
        </button>
        {authError && (
          <div style={{ fontSize: 12, color: "#ff3b30", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            {authError}
          </div>
        )}
        {!authReady && !authError && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            Nyambung ke Firebase...
          </div>
        )}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
          💡 Buka link yang sama di HP pasangan lo<br />data otomatis ke-share & real-time
        </div>
      </div>
    </div>
  );

  const jenisKat = KATEGORI[form.jenis];
  const tabProps = {
    allMonths, cashForm, dashData, dashMonth, debtForm, debtList, debtView, editDebtForm, filterJenis,
    filterMonth, form, handleAddDebt, handleDelete, handleDeleteDebt, handleEditDebt,
    handleCashMove, handleExport, handleExportGSheet, handleMarkLunas, handleSavePayment, handleSubmit, handleTemplateUpload,
    setEditTx, syncing, showDebtModal, showEditDebtModal, showCatEdit,
    hideBalance, histFiltered, histGrouped, histPemasukan, histPengeluaran, inputSubTab,
    isSearching, jenisKat, myName, oldMonthMin, oldTxCount, online, partnerName,
    partnerOnline, paymentCatatan, paymentNominal, paymentTanggal, sbAddFriend, sbAddItem,
    sbAllPeople, sbAssigned, sbExportToFinance, sbExported, sbFileRef, sbFriendInput,
    sbFriends, sbGetColor, sbInputMode, sbItemName, sbItemPrice, sbItems, sbMyTotal,
    sbPaidMap, sbReset, sbScanProgress, sbScanReceipt, sbScanning, sbSelectedFor, sbStep,
    sbToggleAssign, sbTotals, sbUnassigned, search, selectedDebt, selectedDebtId,
    setCashForm, setDashMonth, setDebtForm, setDebtView, setEditDebtForm, setFilterJenis, setFilterMonth,
    setForm, setHideBalance, setInputSubTab, setPaymentCatatan, setPaymentNominal,
    setPaymentTanggal, setSbAssigned, setSbExported, setSbFriendInput,
    setSbFriends, setSbInputMode, setSbItemName, setSbItemPrice, setSbItems, setSbPaidMap,
    setSbScanning, setSbScanProgress, setSbSelectedFor, setSbStep, setSearch, setSelectedDebtId,
    setShowCatEdit, setShowDebtMenu, setShowDebtModal, setShowEditDebtModal, setShowGSheetModal, setShowOld,
    setShowWeddingEdit, setTab, setWeddingActiveSection, setWeddingEditForm, setEditingCats,
    showDebtMenu, showOld, showToast, showWeddingEdit, transactions, weddingActiveSection,
    weddingEditForm, weddingSettings
  };

  return (
    <div className="app">
      <style>{CSS}</style>
      {syncing && <div className="sync-bar" />}
      {toast && <div className={`toast ${toast.type === "err" ? "err" : ""}`}>{toast.msg}</div>}

      <div className="screen">

        {/* ─── DASHBOARD ─── */}
        {tab === "dashboard" && <DashboardTab {...tabProps} />}

        {/* ─── DEBT (FEATURE) ─── */}
        {tab === "debt" && <DebtTab {...tabProps} />}

        {/* ─── INPUT (handled below with split bill merge) ─── */}

        {/* HISTORY */}
        {tab === "history" && <HistoryTab {...tabProps} />}

        {/* DANA NIKAH */}
        {tab === "savings" && <SavingsTab {...tabProps} />}

        {/* INPUT (Catat Biasa + Split Bill) */}
        {tab === "input" && <InputTab {...tabProps} />}

        {/* ─── EDIT TRANSACTION MODAL ─── */}
        {editTx && (
          <div className="modal-overlay" onClick={() => setEditTx(null)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 36, marginBottom: 8, textAlign: "center" }}>✏️</div>
              <div className="modal-title">Edit Transaksi</div>
              <div className="modal-sub">Hanya lo yang bisa edit transaksi ini</div>

              {/* Jenis toggle */}
              <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 4, marginBottom: 16, border: ".5px solid rgba(255,255,255,.08)" }}>
                <button style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: editTx.jenis === "Pemasukan" ? "rgba(52,199,89,.12)" : "none", color: editTx.jenis === "Pemasukan" ? "#34c759" : "rgba(255,255,255,.25)" }}
                  onClick={() => setEditTx(e => ({ ...e, jenis: "Pemasukan", kategori: "Gaji" }))}>⬆ Pemasukan</button>
                <button style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: editTx.jenis === "Pengeluaran" ? "rgba(255,59,48,.1)" : "none", color: editTx.jenis === "Pengeluaran" ? "#ff3b30" : "rgba(255,255,255,.25)" }}
                  onClick={() => setEditTx(e => ({ ...e, jenis: "Pengeluaran", kategori: "Makan" }))}>⬇ Pengeluaran</button>
              </div>

              {/* Nominal */}
              <div className="field-label">Nominal (Rp)</div>
              <input className="inp" inputMode="numeric" placeholder="0"
                value={editTx.nominal}
                onChange={e => { const raw = e.target.value.replace(/\D/g, ""); setEditTx(t => ({ ...t, nominal: raw ? parseInt(raw).toLocaleString("id-ID") : "" })); }} />

              {/* Tanggal */}
              <div className="field-label">Tanggal</div>
              <input className="inp" type="date" value={editTx.tanggal}
                onChange={e => setEditTx(t => ({ ...t, tanggal: e.target.value }))} />

              <div className="field-label">{editTx.jenis === "Pemasukan" ? "Masuk ke" : "Bayar pakai"}</div>
              <div className="toggle-row">
                <button className={"tog-btn " + (txAccount(editTx) === "QRIS" ? "tog-in" : "")}
                  onClick={() => setEditTx(e => ({ ...e, account: "QRIS" }))}>QRIS</button>
                <button className={"tog-btn " + (txAccount(editTx) === "Cash" ? "tog-in" : "")}
                  onClick={() => setEditTx(e => ({ ...e, account: "Cash" }))}>Cash</button>
              </div>

              {/* Kategori */}
              <div className="field-label">Kategori</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                {KATEGORI[editTx.jenis].map(k => (
                  <div key={k}
                    onClick={() => setEditTx(t => ({ ...t, kategori: k }))}
                    style={{ background: editTx.kategori === k ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.04)", border: `1.5px solid ${editTx.kategori === k ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.08)"}`, borderRadius: 12, padding: "10px 6px", textAlign: "center", fontSize: 11, fontWeight: 700, color: editTx.kategori === k ? "#fff" : "rgba(255,255,255,.3)", cursor: "pointer", lineHeight: 1.4 }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{EMOJI[k]}</div>{k}
                  </div>
                ))}
              </div>

              {/* Deskripsi */}
              <div className="field-label">Deskripsi</div>
              <input className="inp" placeholder="Deskripsi transaksi..."
                value={editTx.deskripsi}
                onChange={e => setEditTx(t => ({ ...t, deskripsi: e.target.value }))} />

              <button className="submit-btn" onClick={handleEditSave} style={{ marginBottom: 10 }}>
                💾 Simpan Perubahan
              </button>
              <button className="modal-close" onClick={() => setEditTx(null)}>Batal</button>
            </div>
          </div>
        )}

        {importModal && (
          <div className="modal-overlay" onClick={() => setImportModal(null)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 52, marginBottom: 12, textAlign: "center" }}>📊</div>
              <div className="modal-title">Data Excel ditemukan!</div>
              <div className="modal-sub">Gua nemu <b style={{ color: "#fff" }}>{importModal.count} transaksi</b> di file Excel lo. Mau diimport semuanya ke app?</div>
              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: ".5px solid rgba(255,255,255,.07)" }}>
                {["Data lama dari Excel masuk ke riwayat app", "Data yang udah ada di app tetap aman", "Ga perlu input ulang dari awal 🎉"].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 10 : 0 }}>
                    <span>✅</span><span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.4 }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="submit-btn" style={{ marginBottom: 10 }} onClick={() => handleConfirmImport(importModal.txs)}>
                Import {importModal.count} transaksi
              </button>
              <button className="modal-close" onClick={() => { setImportModal(null); showToast("Template tersimpan tanpa import 📂"); }}>
                Lewatin, simpan template aja
              </button>
            </div>
          </div>
        )}

        {/* ─── EXPORT MODAL ─── */}
        {exportModal && (
          <div className="modal-overlay" onClick={() => setExportModal(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 52, marginBottom: 12, textAlign: "center" }}>📥</div>
              <div className="modal-title">Export berhasil!</div>
              <div className="modal-sub">File <b style={{ color: "#fff" }}>{templateName || "Finance_Tracker_Pro.xlsx"}</b> udah ke-download dengan semua transaksi terbaru 🎉</div>
              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: ".5px solid rgba(255,255,255,.07)" }}>
                {["Data masuk ke sheet bulan yang sesuai", "Summary & Dashboard otomatis ke-update", "File siap dibuka di Excel / Google Sheets"].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 10 : 0 }}>
                    <span>✅</span><span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.4 }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="modal-close" onClick={() => setExportModal(false)}>Oke, mantap! 👍</button>
            </div>
          </div>
        )}

        {/* ─── G-SHEET SETTINGS MODAL ─── */}
        {showGSheetModal && (
          <div className="modal-overlay" onClick={() => setShowGSheetModal(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 52, marginBottom: 12, textAlign: "center" }}>🔗</div>
              <div className="modal-title">Setting Google Sheets</div>
              <div className="modal-sub">Paste URL Web App Google Apps Script lo di bawah ini supaya bisa export otomatis.</div>

              <div className="field-label">URL Web App</div>
              <input className="inp" placeholder="https://script.google.com/macros/s/..." value={sheetUrl}
                onChange={e => {
                  const val = e.target.value;
                  setSheetUrl(val);
                  if (nameSet) db.ref(`${DB_PATH}/sheetUrl`).set(val);
                }}
              />

              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: ".5px solid rgba(255,255,255,.07)", fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>
                Belum punya script-nya? Copy kode dari `apps_script.md` dan paste ke Apps Script di Google Sheet lo!
              </div>

              <button className="submit-btn" style={{ marginBottom: 10 }} onClick={() => {
                setShowGSheetModal(false);
                if (sheetUrl) showToast("URL G-Sheet berhasil disimpan! ✅");
              }}>Simpan URL</button>
            </div>
          </div>
        )}

        {/* ─── BOTTOM NAV ─── */}
        {["dashboard", "input", "history"].includes(tab) && (
          <nav className="fixed bottom-0 w-full max-w-[430px] left-1/2 -translate-x-1/2 z-50 flex justify-around items-center px-4 py-3 pb-6 bg-surface-container/80 dark:bg-surface-container/80 rounded-t-xl backdrop-blur-xl border-t border-white/10" style={{ WebkitBackdropFilter: "blur(24px) saturate(180%)" }}>
            <button className={`flex flex-col items-center justify-center transition-all ${tab === "dashboard" ? "text-primary font-bold scale-95" : "text-on-surface-variant hover:bg-white/5 active:scale-90 rounded-lg p-1"}`} onClick={() => setTab("dashboard")}>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: tab === "dashboard" ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
              <span className="font-label-caps text-label-caps">Dashboard</span>
              {tab === "dashboard" && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
            </button>
            <button className={`flex flex-col items-center justify-center transition-all ${tab === "input" ? "text-primary font-bold scale-95" : "text-on-surface-variant hover:bg-white/5 active:scale-90 rounded-lg p-1"}`} onClick={() => setTab("input")}>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: tab === "input" ? "'FILL' 1" : "'FILL' 0" }}>add</span>
              <span className="font-label-caps text-label-caps">Input</span>
              {tab === "input" && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
            </button>
            <button className={`flex flex-col items-center justify-center transition-all ${tab === "history" ? "text-primary font-bold scale-95" : "text-on-surface-variant hover:bg-white/5 active:scale-90 rounded-lg p-1"}`} onClick={() => setTab("history")}>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: tab === "history" ? "'FILL' 1" : "'FILL' 0" }}>history</span>
              <span className="font-label-caps text-label-caps">History</span>
              {tab === "history" && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
