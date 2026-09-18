function SavingsTab(props) {
  const {
    allMonths, dashData, dashMonth, debtForm, debtList, debtView, editDebtForm, filterJenis,
    filterMonth, form, handleAddDebt, handleDelete, handleDeleteDebt, handleEditDebt,
    handleExport, handleMarkLunas, handleSavePayment, handleSubmit, handleTemplateUpload,
    setEditTx, syncing, showDebtModal, showEditDebtModal, showCatEdit,
    hideBalance, histFiltered, histGrouped, histPemasukan, histPengeluaran, inputSubTab,
    isSearching, jenisKat, myName, oldMonthMin, oldTxCount, online, partnerName,
    partnerOnline, paymentCatatan, paymentNominal, paymentTanggal, sbAddFriend, sbAddItem,
    sbAllPeople, sbAssigned, sbExportToFinance, sbExported, sbFileRef, sbFriendInput,
    sbFriends, sbGetColor, sbInputMode, sbItemName, sbItemPrice, sbItems, sbMyTotal,
    sbPaidMap, sbReset, sbScanProgress, sbScanReceipt, sbScanning, sbSelectedFor, sbStep,
    sbToggleAssign, sbTotals, sbUnassigned, search, selectedDebt, selectedDebtId,
    setDashMonth, setDebtForm, setDebtView, setEditDebtForm, setFilterJenis, setFilterMonth,
    setForm, setHideBalance, setInputSubTab, setPaymentCatatan, setPaymentNominal,
    setPaymentTanggal, setSbAssigned, setSbExported, setSbFriendInput,
    setSbFriends, setSbInputMode, setSbItemName, setSbItemPrice, setSbItems, setSbPaidMap,
    setSbScanning, setSbScanProgress, setSbSelectedFor, setSbStep, setSearch, setSelectedDebtId,
    setShowCatEdit, setShowDebtMenu, setShowDebtModal, setShowEditDebtModal, setShowOld,
    setShowWeddingEdit, setTab, setWeddingActiveSection, setWeddingEditForm, setEditingCats,
    showDebtMenu, showOld, showToast, showWeddingEdit, transactions, weddingActiveSection,
    weddingEditForm, weddingSettings
  } = props;

              const wTotal   = weddingSettings.target || 50000000;
              const wDate    = weddingSettings.tanggal || "";
              const wCats    = Array.isArray(weddingSettings.categories) && weddingSettings.categories.length > 0 ? weddingSettings.categories : DEFAULT_WEDDING_CATS;
              const tabTxs   = transactions.filter(t => t.jenis === "Pengeluaran" && t.kategori === "Tabungan");
              const terkumpul = tabTxs.reduce((s,t) => s + t.nominal, 0);
              const pct      = Math.min(100, Math.round((terkumpul / wTotal) * 100));
              const sisa     = Math.max(0, wTotal - terkumpul);
              const myTabungan      = tabTxs.filter(t=>t.addedBy===myName).reduce((s,t)=>s+t.nominal,0);
              const partnerTabungan = tabTxs.filter(t=>t.addedBy!==myName).reduce((s,t)=>s+t.nominal,0);

              let daysLeft = null;
              let monthsLeft = null;
              if (wDate) {
                const msLeft = new Date(wDate) - new Date();
                daysLeft  = Math.max(0, Math.ceil(msLeft / 86400000));
                monthsLeft = Math.max(1, Math.ceil(msLeft / (30*86400000)));
              }
              const perBulan = monthsLeft ? Math.ceil(sisa / monthsLeft) : null;

              const MILESTONES = [
                { label: "DP Venue",            amount: Math.round(wTotal * 0.15), icon: "🏛️" },
                { label: "Baju & Dokumentasi",  amount: Math.round(wTotal * 0.25), icon: "👗" },
                { label: "Setengah Perjalanan", amount: Math.round(wTotal * 0.50), icon: "🎯" },
                { label: "Catering & Dekorasi", amount: Math.round(wTotal * 0.75), icon: "🍽️" },
                { label: "Lunas! 🎉",            amount: wTotal,                   icon: "💍" },
              ];

              const saveWeddingSettings = async (extra = {}) => {
                const t = parseMoney(weddingEditForm.target) || wTotal;
                const d = weddingEditForm.tanggal || wDate;
                const updated = { target: t, tanggal: d, categories: wCats, ...extra };
                await db.ref(`${DB_PATH}/wedding_settings`).set(updated);
                setWeddingSettings(updated);
                setShowWeddingEdit(false);
                showToast("Pengaturan tersimpan! 💍");
              };

              const saveCats = async () => {
                const cleanCats = editingCats.map(c => ({ id:c.id, nama:c.nama, icon:c.icon, target:c.target||0, warna:c.warna }));
                const updated = { target: wTotal, tanggal: wDate, categories: cleanCats };
                await db.ref(`${DB_PATH}/wedding_settings`).set(updated);
                setWeddingSettings(updated);
                setShowCatEdit(false);
                showToast("Alokasi disimpan! 🎯");
              };

              const totalCatTarget = wCats.reduce((s,c) => s+c.target, 0);

              // circular arc helpers
              const r = 68, sw = 10, sz = 160, cx = sz/2;
              const circ = 2*Math.PI*r;
              const filled = (pct/100)*circ;

              // Format tanggal nikah untuk display
              const fmtWeddingDate = (dateStr) => {
                if (!dateStr) return null;
                const d = new Date(dateStr + "T00:00:00");
                const days = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
                return `${days[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
              };

              return (<>
              <div className="hdr">
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>setTab("dashboard")} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",backdropFilter:"blur(12px)"}} aria-label="Kembali ke Dashboard"><span className="material-symbols-outlined" style={{fontSize:18}}>arrow_back_ios_new</span></button>
                  <div>
                    <div className="hdr-sub">Impian berdua</div>
                    <div className="hdr-title">Dana Nikah</div>
                  </div>
                </div>
                <button className="pill" onClick={()=>{ setWeddingEditForm({ target: wTotal.toLocaleString("id-ID"), tanggal: wDate }); setShowWeddingEdit(true); }}>
                  <span className="material-symbols-outlined" style={{fontSize:14,marginRight:6}}>tune</span>Edit target
                </button>
              </div>
              <div className="scroll">

                {/* ── Deadline Banner ── */}
                {wDate ? (
                  <div style={{background:"linear-gradient(135deg,rgba(219,39,119,.18),rgba(167,139,250,.12))",border:"1px solid rgba(219,39,119,.35)",borderRadius:20,padding:"16px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:16,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-30,right:-20,width:120,height:120,background:"radial-gradient(circle,rgba(219,39,119,.2) 0%,transparent 70%)",pointerEvents:"none"}}/>
                    <div style={{fontSize:32,flexShrink:0}}>📅</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>Hari H Pernikahan</div>
                      <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:-.3}}>{fmtWeddingDate(wDate)}</div>
                      {daysLeft !== null && (
                        <div style={{marginTop:4,display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:22,fontWeight:900,color:"#f9a8d4",letterSpacing:-1}}>{daysLeft.toLocaleString("id-ID")}</span>
                          <span style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:600}}>hari lagi 💕</span>
                          {perBulan && <span style={{fontSize:11,color:"#c084fc",fontWeight:700,background:"rgba(192,132,252,.12)",borderRadius:999,padding:"2px 8px",border:"1px solid rgba(192,132,252,.2)"}}>~{fmtRp(perBulan)}/bln</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div onClick={()=>{ setWeddingEditForm({ target: wTotal.toLocaleString("id-ID"), tanggal: "" }); setShowWeddingEdit(true); }}
                    className="card-glass" style={{borderStyle:"dashed",padding:"14px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                    <span className="material-symbols-outlined" style={{fontSize:28,opacity:.6}}>calendar_today</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>Kapan hari H? Set tanggal biar kehitung nabung per bulan.</div>
                    </div>
                    <span className="material-symbols-outlined" style={{marginLeft:"auto",opacity:.5}}>chevron_right</span>
                  </div>
                )}

                {/* ── Section Tabs ── */}
                <div style={{display:"flex",background:"rgba(0,0,0,.35)",borderRadius:14,padding:3,border:"1px solid rgba(255,255,255,.05)",marginBottom:16}}>
                  <button onClick={()=>setWeddingActiveSection("overview")}
                    style={{flex:1,padding:"10px",borderRadius:11,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .2s",
                      background:weddingActiveSection==="overview"?"rgba(219,39,119,.18)":"none",
                      color:weddingActiveSection==="overview"?"#f9a8d4":"rgba(255,255,255,.3)"}}>
                    📊 Overview
                  </button>
                  <button onClick={()=>setWeddingActiveSection("alokasi")}
                    style={{flex:1,padding:"10px",borderRadius:11,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .2s",
                      background:weddingActiveSection==="alokasi"?"rgba(219,39,119,.18)":"none",
                      color:weddingActiveSection==="alokasi"?"#f9a8d4":"rgba(255,255,255,.3)"}}>
                    🎯 Alokasi
                  </button>
                </div>

                {/* ══ SECTION: OVERVIEW ══ */}
                {weddingActiveSection==="overview" && <>

                  {/* ── Progress Ring Card ── */}
                  <div className="card-glass--hero" style={{padding:"24px 20px",marginBottom:16,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-50,right:-30,width:160,height:160,background:"radial-gradient(circle,rgba(219,39,119,.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:24}}>
                      {/* Donut Ring */}
                      <div style={{position:"relative",flexShrink:0}}>
                        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{transform:"rotate(-90deg)"}}>
                          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={sw}/>
                          <circle cx={cx} cy={cx} r={r} fill="none"
                            stroke="url(#wGrad)" strokeWidth={sw}
                            strokeDasharray={circ}
                            strokeDashoffset={circ - filled}
                            strokeLinecap="round"
                            style={{transition:"stroke-dashoffset 1s ease"}}/>
                          <defs>
                            <linearGradient id="wGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#db2777"/>
                              <stop offset="100%" stopColor="#a78bfa"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:26,fontWeight:800,color:"#fff",letterSpacing:-1}}>{pct}%</span>
                          <span style={{fontSize:9,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Terkumpul</span>
                        </div>
                      </div>
                      {/* Stats */}
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                        <div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Terkumpul</div>
                          <div style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:-.4,marginTop:2}}>{fmtRp(terkumpul)}</div>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Target</div>
                          <div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,.55)",letterSpacing:-.3,marginTop:2}}>{fmtRp(wTotal)}</div>
                        </div>
                        <div style={{height:1,background:"rgba(255,255,255,.06)"}}/>
                        <div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Sisa Target</div>
                          <div style={{fontSize:15,fontWeight:800,color:sisa>0?"#fb7185":"#34d399",letterSpacing:-.3,marginTop:2}}>{sisa>0?fmtRp(sisa):"Lunas! 🎉"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Kontribusi ── */}
                  <div className="sec-title">Kontribusi Tabungan</div>
                  <div style={{display:"flex",gap:10,marginBottom:20}}>
                    {[{name:myName, val:myTabungan, color:"#a78bfa", bg:"rgba(88,86,214,.12)"}, {name:partnerName||"Pasangan", val:partnerTabungan, color:"#f9a8d4", bg:"rgba(219,39,119,.1)"}].map(({name,val,color,bg}) => {
                      const gpct = terkumpul > 0 ? Math.round((val/terkumpul)*100) : 0;
                      return (
                        <div key={name} style={{flex:1,background:bg,border:`1px solid ${color}33`,borderRadius:18,padding:"14px 14px"}}>
                          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",marginBottom:4}}>{name}</div>
                          <div style={{fontSize:16,fontWeight:800,color,letterSpacing:-.3}}>{fmtRp(val)}</div>
                          <div style={{marginTop:8,background:"rgba(255,255,255,.06)",borderRadius:999,height:3}}>
                            <div style={{width:`${gpct}%`,height:"100%",borderRadius:999,background:color,transition:"width .8s ease"}}/>
                          </div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",fontWeight:700,marginTop:4}}>{gpct}%</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Milestones ── */}
                  <div className="sec-title">Milestone 🎯</div>
                  <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:"4px 16px",marginBottom:24}}>
                    {MILESTONES.map((ms,i) => {
                      const reached = terkumpul >= ms.amount;
                      const isNext  = !reached && MILESTONES.slice(0,i).every(m=>terkumpul>=m.amount);
                      const kurang  = ms.amount - terkumpul;
                      return (
                        <div key={ms.label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:i<MILESTONES.length-1?".5px solid rgba(255,255,255,.04)":"none"}}>
                          <div style={{width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:reached?"rgba(52,211,153,.1)":isNext?"rgba(167,139,250,.1)":"rgba(255,255,255,.04)",border:`1px solid ${reached?"rgba(52,211,153,.3)":isNext?"rgba(167,139,250,.3)":"rgba(255,255,255,.06)"}`}}>{ms.icon}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600,color:reached?"#fff":"rgba(255,255,255,.5)"}}>{ms.label}</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{fmtRp(ms.amount)}</div>
                          </div>
                          {reached
                            ? <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.3)",color:"#34d399"}}>✅ Tercapai</span>
                            : isNext
                              ? <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.3)",color:"#a78bfa"}}>{fmtRp(kurang)} lagi</span>
                              : <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,background:"rgba(255,255,255,.04)",border:".5px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.2)"}}>Belum</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </>}

                {/* ══ SECTION: ALOKASI ══ */}
                {weddingActiveSection==="alokasi" && <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div className="sec-title" style={{margin:0}}>Alokasi Dana Nikah</div>
                    <button onClick={()=>{ setEditingCats(wCats.map(c=>({...c}))); setShowCatEdit(true); }}
                      style={{background:"rgba(219,39,119,.12)",border:"1px solid rgba(219,39,119,.3)",borderRadius:999,padding:"5px 12px",color:"#f9a8d4",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      ✏️ Edit
                    </button>
                  </div>

                  {/* Total alokasi vs target */}
                  <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Total Alokasi</div>
                      <div style={{fontSize:17,fontWeight:800,color: totalCatTarget > wTotal ? "#fb7185" : "#34d399",marginTop:2}}>{fmtRp(totalCatTarget)}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Target Total</div>
                      <div style={{fontSize:17,fontWeight:800,color:"rgba(255,255,255,.55)",marginTop:2}}>{fmtRp(wTotal)}</div>
                    </div>
                  </div>
                  {totalCatTarget !== wTotal && (
                    <div style={{background: totalCatTarget > wTotal ? "rgba(255,59,48,.08)" : "rgba(255,149,0,.08)", border:`1px solid ${totalCatTarget > wTotal ? "rgba(255,59,48,.25)" : "rgba(255,149,0,.25)"}`, borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color: totalCatTarget > wTotal ? "#ff6b6b" : "#ffb347",fontWeight:600}}>
                      {totalCatTarget > wTotal
                        ? `⚠️ Alokasi melebihi target sebesar ${fmtRp(totalCatTarget - wTotal)}`
                        : `💡 Ada sisa ${fmtRp(wTotal - totalCatTarget)} yang belum dialokasikan`}
                    </div>
                  )}

                  {/* Category cards */}
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                    {wCats.map((cat) => {
                      const catPct = Math.min(100, wTotal > 0 ? Math.round((cat.target/wTotal)*100) : 0);
                      return (
                        <div key={cat.id} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${cat.warna}22`,borderRadius:18,padding:"16px 16px",position:"relative",overflow:"hidden"}}>
                          <div style={{position:"absolute",top:0,left:0,width:`${catPct}%`,height:"100%",background:`${cat.warna}08`,pointerEvents:"none",transition:"width .6s ease"}}/>
                          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,position:"relative"}}>
                            <div style={{width:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,background:`${cat.warna}18`,border:`1px solid ${cat.warna}44`,flexShrink:0}}>{cat.icon}</div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{cat.nama}</div>
                              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{catPct}% dari total target</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:15,fontWeight:800,color:cat.warna,letterSpacing:-.3}}>{fmtRp(cat.target)}</div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div style={{position:"relative",background:"rgba(255,255,255,.06)",borderRadius:999,height:5}}>
                            <div style={{position:"absolute",top:0,left:0,width:`${catPct}%`,height:"100%",borderRadius:999,background:`${cat.warna}55`}}/>
                            <div style={{position:"absolute",top:0,left:0,width:`${Math.min(catPct,pct)}%`,height:"100%",borderRadius:999,background:cat.warna,transition:"width .8s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}

              </div>

              {/* ── Wedding Edit Modal ── */}
              {showWeddingEdit && (
                <div className="modal-overlay" onClick={()=>setShowWeddingEdit(false)}>
                  <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
                    <div style={{fontSize:36,marginBottom:8,textAlign:"center"}}>💍</div>
                    <div className="modal-title">Edit Target Dana Nikah</div>
                    <div className="modal-sub">Setting tersinkronisasi real-time ke pasangan lo</div>
                    <div className="field-label">Target Dana (Rp)</div>
                    <input className="inp" inputMode="numeric" placeholder="50.000.000"
                      value={weddingEditForm.target}
                      onChange={e=>{ const r=e.target.value.replace(/\D/g,""); setWeddingEditForm(f=>({...f,target:r?parseInt(r).toLocaleString("id-ID"):""})); }}/>
                    <div className="field-label">Tanggal Hari H</div>
                    <input className="inp" type="date" value={weddingEditForm.tanggal}
                      onChange={e=>setWeddingEditForm(f=>({...f,tanggal:e.target.value}))}/>
                    <button className="submit-btn" style={{background:"linear-gradient(135deg,#db2777,#a78bfa)",marginBottom:10}} onClick={()=>saveWeddingSettings()}>
                      💾 Simpan
                    </button>
                    <button className="modal-close" onClick={()=>setShowWeddingEdit(false)}>Batal</button>
                  </div>
                </div>
              )}

              {/* ── Category Edit Modal ── */}
              {showCatEdit && (
                <div className="modal-overlay" onClick={()=>setShowCatEdit(false)}>
                  <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:"85vh",overflowY:"auto",paddingBottom:32}}>
                    <div style={{fontSize:36,marginBottom:8,textAlign:"center"}}>🎯</div>
                    <div className="modal-title">Edit Alokasi Kategori</div>
                    <div className="modal-sub">Atur berapa target dana untuk tiap kebutuhan nikah</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                      {editingCats.map((cat, idx) => (
                        <div key={cat.id} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${cat.warna}33`,borderRadius:16,padding:"14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                            <span style={{fontSize:20}}>{cat.icon}</span>
                            <input
                              value={cat.nama}
                              onChange={e=>{ const c=[...editingCats]; c[idx]={...c[idx],nama:e.target.value}; setEditingCats(c); }}
                              style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"8px 12px",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,outline:"none"}}/>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",fontWeight:700,flexShrink:0}}>Target Rp</div>
                            <input
                              inputMode="numeric"
                              value={typeof cat.target === "number" && !isNaN(cat.target) ? cat.target.toLocaleString("id-ID") : ""}
                              onChange={e=>{ const raw=e.target.value.replace(/\D/g,""); const c=[...editingCats]; c[idx]={...c[idx],target:raw?parseInt(raw):0}; setEditingCats(c); }}
                              style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"8px 12px",color:cat.warna,fontFamily:"inherit",fontSize:14,fontWeight:800,outline:"none"}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:600}}>Total alokasi</div>
                      <div style={{fontSize:14,fontWeight:800,color:editingCats.reduce((s,c)=>s+c.target,0) > wTotal?"#ff6b6b":"#34d399"}}>{fmtRp(editingCats.reduce((s,c)=>s+c.target,0))}</div>
                    </div>
                    <button className="submit-btn" style={{background:"linear-gradient(135deg,#db2777,#a78bfa)",marginBottom:10}} onClick={saveCats}>
                      💾 Simpan Alokasi
                    </button>
                    <button className="modal-close" onClick={()=>setShowCatEdit(false)}>Batal</button>
                  </div>
                </div>
              )}
              </>);
            }
