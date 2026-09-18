function DebtTab(props) {
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
  return (

              <>
                {debtView === "list" && (
                  <div className="flex flex-col h-full absolute inset-0 bg-background z-40 pb-24">
                    <header className="bg-background/80 backdrop-blur-lg border-b border-white/10 flex justify-between items-center px-margin-mobile h-16 w-full max-w-lg mx-auto flex-shrink-0" style={{position:"relative"}}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setTab("dashboard")} className="active-scale flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5">
                          <span className="material-symbols-outlined text-on-surface">arrow_back_ios_new</span>
                        </button>
                        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Daftar Hutang</h1>
                      </div>
                    </header>

                    <main className="flex-1 px-margin-mobile py-lg space-y-lg pb-36 max-w-lg mx-auto w-full overflow-y-auto">
                      {/* Summary Cards */}
                      {(() => {
                        const totalHutang = debtList.filter(d => d.type === "Hutang").reduce((s, d) => s + (d.total - d.paid), 0);
                        const totalPiutang = debtList.filter(d => d.type === "Piutang").reduce((s, d) => s + (d.total - d.paid), 0);
                        const maxH = Math.max(totalHutang, 1);
                        const maxP = Math.max(totalPiutang, 1);
                        return (
                          <section className="grid grid-cols-2 gap-md">
                            <div className="premium-glass rounded-xl p-md flex flex-col space-y-xs relative overflow-hidden">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase opacity-60">SAYA BERHUTANG</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-error font-bold text-headline-md glow-text-error">{totalHutang >= 1000000 ? `Rp ${(totalHutang/1000000).toFixed(1)}jt` : `Rp ${(totalHutang/1000).toFixed(0)}rb`}</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-error/60 shadow-[0_0_8px_rgba(255,90,95,0.4)]" style={{width: `${Math.min(100, (totalHutang/maxH)*100)}%`}}></div>
                              </div>
                            </div>
                            <div className="premium-glass rounded-xl p-md flex flex-col space-y-xs relative overflow-hidden">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase opacity-60">PIUTANG SAYA</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-tertiary font-bold text-headline-md glow-text-tertiary">{totalPiutang >= 1000000 ? `Rp ${(totalPiutang/1000000).toFixed(1)}jt` : `Rp ${(totalPiutang/1000).toFixed(0)}rb`}</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-tertiary/60 shadow-[0_0_8px_rgba(71,226,102,0.4)]" style={{width: `${Math.min(100, (totalPiutang/maxP)*100)}%`}}></div>
                              </div>
                            </div>
                          </section>
                        );
                      })()}

                      {/* Daftar Hutang */}
                      <section className="space-y-md">
                        <div className="flex justify-between items-end mb-1">
                          <h2 className="font-headline-md text-headline-md text-on-surface">Hutang Aktif</h2>
                          <span className="font-label-caps text-label-caps text-primary uppercase cursor-pointer hover:underline" onClick={() => { showToast("Belum ada fitur filter"); }}>Lihat Semua</span>
                        </div>
                        <div className="premium-glass rounded-xl overflow-hidden divide-y divide-white/[0.03]">
                          {debtList.length === 0 && (
                            <div className="p-lg text-center text-on-surface-variant text-body-sm">Belum ada hutang tercatat.</div>
                          )}
                          {debtList.map((d, i) => {
                            const isHutang = d.type === "Hutang";
                            const sisa = Math.max(0, d.total - d.paid);
                            const isLunasItem = sisa <= 0;
                            const colorClass = isHutang ? "text-error" : "text-tertiary";
                            const glowClass = isHutang ? "glow-text-error" : "glow-text-tertiary";
                            const sisTxt = isLunasItem ? "Lunas" : (sisa >= 1000000 ? `${isHutang?"-":"+"}Rp${(sisa/1000000).toFixed(1)}jt` : `${isHutang?"-":"+"}${(sisa/1000).toFixed(0)}rb`);
                            
                            return (
                              <div
                                key={d.id}
                                onClick={() => { setSelectedDebtId(d.id); setDebtView("detail"); }}
                                className="p-md flex items-center gap-md hover:bg-white/[0.02] transition-colors cursor-pointer"
                              >
                                <div className="w-12 h-12 rounded-full bg-surface-variant border border-white/5 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-on-surface-variant" style={{fontVariationSettings:"'FILL' 1"}}>{isLunasItem ? "check_circle" : "person"}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-body-lg text-on-surface truncate">{d.name}</p>
                                  <p className={`font-body-sm ${d.jatuhTempo && !isLunasItem ? colorClass+"/90" : "text-on-surface-variant/70"}`}>
                                    {isLunasItem ? "Lunas" : (d.jatuhTempo ? `Jatuh tempo: ${fmtDate(d.jatuhTempo) || d.jatuhTempo}` : (d.keterangan || "Belum lunas"))}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`font-headline-md ${isLunasItem ? "text-tertiary glow-text-tertiary" : `${colorClass} ${glowClass}`}`}>{sisTxt}</p>
                                  <p className="font-label-caps text-on-surface-variant uppercase opacity-40">{d.type}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Insights / Empty State Illustration */}
                      <section className="flex flex-col items-center justify-center py-xl">
                        <div className="w-32 h-32 mb-lg relative">
                          <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full"></div>
                          <img alt="Finance Illustration" className="w-full h-full object-contain relative z-10 opacity-70 mix-blend-lighten" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp9PH7xbe4qnnDrrwkfD0WIAbxUBiEX4Guiog_jVRkLHndQjj7PrFUWOkIgvpei82VVFeQHmqV1etNkxVhtOUHmYICTBAKBKqKLQEmuAcH7cjkcH-KGFJYRysXgGvUv38dKZHBwDuJP-ay3TEwBt-JDtzgeu-wH-fgpNMOkW9cellbRtSxs9a7HLVEF9I-Zsj1X5wed224jUwSuk2nSR2h3Hg62PZszQjTSin-17w8uNTvWHRE0-RFNR7taNLFEMT1w2TDbOjuCek"/>
                        </div>
                        <p className="font-body-sm text-center px-lg text-on-surface-variant max-w-[280px] leading-relaxed opacity-70">Kelola pengeluaran Anda dengan bijak agar keuangan tetap stabil.</p>
                      </section>
                    </main>

                    {/* FAB Catat Hutang Baru */}
                    <div className="absolute bottom-28 inset-x-0 z-50 flex justify-end px-6 max-w-lg mx-auto w-full pointer-events-none">
                      <button onClick={() => setShowDebtModal(true)} className="pointer-events-auto active-scale flex items-center gap-2 bg-[#4B5563] text-white border border-white/10 px-lg py-md rounded-full shadow-lg shadow-black/50 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
                        <span className="font-bold text-sm tracking-wide">Catat hutang baru</span>
                      </button>
                    </div>
                    {/* Modal Tambah Hutang */}
                    {showDebtModal && (
                      <div className="absolute inset-0 z-[100] debt-bg text-on-surface overflow-y-auto">
                        <header className="sticky top-0 z-10 bg-[#111827]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-margin-mobile h-16 max-w-2xl mx-auto w-full">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setShowDebtModal(false)} className="active:scale-[0.98] transition-transform duration-200 p-1">
                              <span className="material-symbols-outlined text-primary">arrow_back_ios</span>
                            </button>
                            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Catat Hutang Baru</h1>
                          </div>
                        </header>
                        <main className="mt-4 px-margin-mobile max-w-2xl mx-auto space-y-6 pb-32">
                          <div className="debt-input p-1 rounded-xl flex">
                            {["Hutang","Piutang"].map(t => (
                              <button key={t} onClick={() => setDebtForm(f=>({...f, type:t}))}
                                style={{fontWeight:700,fontSize:12,letterSpacing:"0.5px"}}
                                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 ${debtForm.type===t ? "bg-primary/20 text-primary border border-primary/30" : "text-on-surface-variant/60"}`}>
                                {t === "Hutang" ? "SAYA BERHUTANG" : "PIUTANG SAYA"}
                              </button>
                            ))}
                          </div>

                          <section className="space-y-2">
                            <label className="debt-label ml-1">NOMINAL</label>
                            <div className="debt-card p-6 rounded-2xl flex items-center gap-3">
                              <span style={{fontSize:28,fontWeight:800,color:"rgba(170,199,255,0.8)",letterSpacing:-0.5,flexShrink:0}}>Rp</span>
                              <input
                                className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-white/10 focus:ring-0 outline-none"
                                style={{fontSize:32,fontWeight:800,letterSpacing:-0.5}}
                                placeholder="0" inputMode="numeric" value={debtForm.total}
                                onChange={e => setDebtForm(f=>({...f, total:e.target.value}))}/>
                            </div>
                          </section>

                          <div className="debt-card rounded-2xl overflow-hidden">
                            <div className="p-4 space-y-2">
                              <label className="debt-label">NAMA KONTAK</label>
                              <div className="flex items-center gap-3 debt-input rounded-xl px-4 py-3">
                                <span className="material-symbols-outlined" style={{color:"rgba(255,255,255,0.3)",fontSize:20}}>person_search</span>
                                <input className="flex-1 bg-transparent border-none p-0 text-on-surface focus:ring-0 outline-none"
                                  style={{fontSize:16}} placeholder="Cari atau tambah kontak..." value={debtForm.name}
                                  onChange={e => setDebtForm(f=>({...f, name:e.target.value}))}/>
                              </div>
                            </div>
                            <div style={{height:1,background:"rgba(255,255,255,.06)",marginLeft:16}}/>
                            <div className="p-4 space-y-2">
                              <label className="debt-label">JATUH TEMPO</label>
                              <div className="flex items-center gap-3 debt-input rounded-xl px-4 py-3">
                                <span className="material-symbols-outlined" style={{color:"rgba(255,255,255,0.3)",fontSize:20}}>calendar_today</span>
                                <input className="flex-1 bg-transparent border-none p-0 text-on-surface appearance-none focus:ring-0 outline-none"
                                  style={{colorScheme:"dark",fontSize:16}} type="date" value={debtForm.jatuhTempo || ""}
                                  onChange={e => setDebtForm(f=>({...f, jatuhTempo:e.target.value}))}/>
                              </div>
                            </div>
                          </div>

                          <section className="space-y-3">
                            <label className="debt-label ml-1">KATEGORI</label>
                            <div className="flex flex-wrap gap-2">
                              {["Makanan","Sosial","Tagihan","Transportasi","Lainnya"].map(cat => (
                                <button key={cat} onClick={() => setDebtForm(f=>({...f, kategori: f.kategori===cat ? "" : cat}))}
                                  className={`active:scale-95 transition-transform ${debtForm.kategori===cat ? "debt-pill debt-pill-active" : "debt-pill"}`}>
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </section>

                          <section className="space-y-2">
                            <label className="debt-label ml-1">CATATAN (OPSIONAL)</label>
                            <textarea
                              className="w-full debt-input rounded-xl p-4 text-on-surface resize-none focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                              style={{fontSize:15,lineHeight:"22px"}}
                              placeholder="Tambahkan keterangan di sini..." rows={3}
                              value={debtForm.keterangan}
                              onChange={e => setDebtForm(f=>({...f, keterangan:e.target.value}))}/>
                          </section>

                          <button onClick={handleAddDebt}
                            className="w-full py-4 rounded-2xl font-bold border border-white/10 shadow-lg active:scale-[0.98] transition-all mt-2 text-white debt-muted-btn"
                            style={{fontSize:16}}>
                            Simpan Hutang Baru
                          </button>
                        </main>
                      </div>
                    )}
                   </div>
                )}

                {debtView === "detail" && selectedDebt && (() => {
                  const cikilans = (selectedDebt.cicilan || []).slice().sort((a,b) => b.id - a.id);
                  const isLunas = selectedDebt.paid >= selectedDebt.total;
                  const progressPct = Math.min(100, selectedDebt.total > 0 ? Math.round((selectedDebt.paid / selectedDebt.total) * 100) : 0);
                  const detailColor = selectedDebt.type === "Hutang" ? "text-error" : "text-tertiary";
                  return (
                  <div className="flex flex-col h-full absolute inset-0 z-50 debt-bg text-on-surface overflow-y-auto">
                    {/* Edit Debt Modal */}
                    {showEditDebtModal && editDebtForm && (
                      <div className="absolute inset-0 z-[110] flex items-end justify-center" style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}} onClick={e => { if(e.target===e.currentTarget) setShowEditDebtModal(false); }}>
                        <div className="w-full max-w-lg rounded-t-3xl p-lg pb-10 space-y-md" style={{background:"#1a1d24"}}>
                          <div className="flex justify-between items-center mb-sm">
                            <h2 className="text-on-surface font-bold" style={{fontSize:18}}>Edit {editDebtForm.type}</h2>
                            <button onClick={() => setShowEditDebtModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.1)"}}>
                              <span className="material-symbols-outlined" style={{fontSize:18}}>close</span>
                            </button>
                          </div>
                          <div>
                            <label style={{fontSize:10,letterSpacing:"0.8px",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:700,display:"block",marginBottom:4}}>NAMA</label>
                            <input type="text" value={editDebtForm.name} onChange={e => setEditDebtForm(f=>({...f,name:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"10px 14px",color:"#fff",fontSize:15,outline:"none"}}/>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                            <div>
                              <label style={{fontSize:10,letterSpacing:"0.8px",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:700,display:"block",marginBottom:4}}>TOTAL (Rp)</label>
                              <input type="number" value={editDebtForm.total} onChange={e => setEditDebtForm(f=>({...f,total:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"10px 14px",color:"#fff",fontSize:15,outline:"none"}}/>
                            </div>
                            <div>
                              <label style={{fontSize:10,letterSpacing:"0.8px",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:700,display:"block",marginBottom:4}}>JATUH TEMPO</label>
                              <input type="date" value={editDebtForm.jatuhTempo || ""} onChange={e => setEditDebtForm(f=>({...f,jatuhTempo:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"10px 14px",color:"#fff",fontSize:15,outline:"none",colorScheme:"dark"}}/>
                            </div>
                          </div>
                          <div>
                            <label style={{fontSize:10,letterSpacing:"0.8px",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:700,display:"block",marginBottom:4}}>KETERANGAN</label>
                            <input type="text" value={editDebtForm.keterangan} onChange={e => setEditDebtForm(f=>({...f,keterangan:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"10px 14px",color:"#fff",fontSize:15,outline:"none"}}/>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={() => handleDeleteDebt(editDebtForm.id)} style={{flex:1,padding:"14px",borderRadius:"16px",border:"1px solid rgba(255,59,48,0.3)",background:"rgba(255,59,48,0.1)",color:"#ff3b30",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                              Hapus
                            </button>
                            <button onClick={handleEditDebt} style={{flex:2,padding:"14px",borderRadius:"16px",border:"none",background:"#6366f1",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                              Simpan perubahan
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Header ── */}
                    <header className="px-margin-mobile pt-8 pb-4 space-y-2 max-w-lg mx-auto w-full">
                      <button onClick={() => { setDebtView("list"); setSelectedDebtId(null); }} className="flex items-center text-primary font-semibold text-sm gap-1 mb-2 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined" style={{fontSize:18}}>arrow_back</span>
                        Daftar Hutang
                      </button>
                      <div className="flex justify-between items-start">
                        <div>
                          <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>
                            {selectedDebt.keterangan} {selectedDebt.type === "Hutang" ? "💸" : "💰"}
                          </p>
                          <h1 style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:-0.5,marginTop:4,lineHeight:1.2}}>{selectedDebt.type}: {selectedDebt.name}</h1>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                          {isLunas && <span style={{background:"rgba(52,199,89,0.15)",border:"1px solid rgba(52,199,89,0.3)",color:"#34c759",borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:700}}>✅ LUNAS</span>}
                          <button
                            onClick={() => { if(window.confirm(`Hapus ${selectedDebt.name}?`)) handleDeleteDebt(selectedDebt.id); }}
                            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors"
                            style={{background:"rgba(220,38,38,0.15)",border:"1px solid rgba(239,68,68,0.3)"}}
                          >
                            <span className="material-symbols-outlined" style={{color:"#ef4444",fontSize:20,fontVariationSettings:"'wght' 300"}}>delete</span>
                          </button>
                        </div>
                      </div>
                    </header>

                    <main className="flex-1 px-margin-mobile pb-32 max-w-lg mx-auto w-full space-y-lg">
                      {/* ── Summary Card ── */}
                      <section className="debt-card rounded-2xl p-6 relative overflow-hidden" style={{boxShadow:"0 20px 48px rgba(0,0,0,0.3)"}}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{background:"rgba(99,102,241,0.12)",filter:"blur(50px)",pointerEvents:"none"}}/>
                        <div className="relative z-10 space-y-6">
                          <div>
                            <p className="debt-label mb-2">TOTAL {selectedDebt.type.toUpperCase()}</p>
                            <p style={{fontSize:32,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{fmtRp(selectedDebt.total)}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="debt-label mb-1">DIBAYAR</p>
                              <p className="font-headline-md text-tertiary">{fmtRp(selectedDebt.paid)}</p>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <p className="debt-label mb-1">SISA</p>
                              <p className={`font-headline-md ${detailColor}`}>{fmtRp(Math.max(0, selectedDebt.total - selectedDebt.paid))}</p>
                            </div>
                          </div>
                          {/* Progress */}
                          <div className="space-y-3 pt-1">
                            <div className="flex justify-between items-end">
                              <div className="flex items-baseline gap-2">
                                <span style={{fontSize:24,fontWeight:800,color:"#fff"}}>{progressPct}%</span>
                                <span style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:600}}>lunas</span>
                              </div>
                              {selectedDebt.jatuhTempo && <span style={{fontSize:11,fontWeight:700,color:"#ff5252"}}>⏰ {fmtDate(selectedDebt.jatuhTempo) || selectedDebt.jatuhTempo}</span>}
                            </div>
                            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                              <div className="h-full rounded-full debt-progress" style={{width:`${progressPct}%`,background:"#47e266",transition:"width 0.6s ease"}}/>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* ── Riwayat Cicilan ── */}
                      <section>
                        <h2 className="debt-label mb-4">RIWAYAT CICILAN 🎯 ({cikilans.length})</h2>
                        <div className="debt-card rounded-2xl overflow-hidden" style={{boxShadow:"0 20px 48px rgba(0,0,0,0.28)"}}>
                          {cikilans.length === 0 && (
                            <div className="p-6 text-center" style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Belum ada cicilan tercatat.</div>
                          )}
                          {cikilans.map((c, i) => (
                            <div key={c.id} className={`flex justify-between items-center p-5 ${i < cikilans.length-1 ? "border-b border-white/5" : ""}`}>
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>
                                  <span className="material-symbols-outlined" style={{color:"rgba(255,255,255,0.7)",fontSize:20}}>payments</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-on-surface">{fmtRp(c.nominal)}</p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">{fmtDate(c.tanggal) || c.tanggal}{c.catatan ? " · " + c.catatan : ""}</p>
                                </div>
                              </div>
                              <span style={{fontSize:11,fontWeight:700,color:"#47e266",background:"rgba(71,226,102,0.1)",border:"1px solid rgba(71,226,102,0.25)",borderRadius:999,padding:"3px 10px"}}>✓ Bayar</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ── Action Buttons ── */}
                      <div className="space-y-4 pb-8">
                        {!isLunas && (
                          <button onClick={() => { setPaymentNominal(""); setPaymentTanggal(today()); setPaymentCatatan(""); setDebtView("payment"); }}
                            className="w-full h-14 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg debt-muted-btn">
                            <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>add_card</span>
                            Catat Pembayaran
                          </button>
                        )}
                        <div className={`grid gap-3 ${isLunas ? "grid-cols-1" : "grid-cols-2"} w-full`}>
                          {!isLunas && (
                            <button
                              onClick={() => { if(window.confirm(`Tandai ${selectedDebt.name} lunas sekaligus?`)) handleMarkLunas(); }}
                              className="h-12 font-bold rounded-2xl active:scale-[0.98] transition-all w-full"
                              style={{color:"#47e266",border:"1px solid rgba(71,226,102,0.3)",background:"rgba(71,226,102,0.08)"}}
                            >
                              ✅ Lunas semua
                            </button>
                          )}
                          <button onClick={() => { setEditDebtForm({...selectedDebt}); setShowEditDebtModal(true); }}
                            className="h-12 font-bold rounded-2xl active:scale-[0.98] transition-all debt-muted-btn w-full">
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                    </main>
                  </div>
                  );
                })()}

                {debtView === "payment" && selectedDebt && (() => {
                  const sisa = selectedDebt.total - selectedDebt.paid;
                  const nominalParsed = parseMoney(paymentNominal) || 0;
                  const sisaSetelah = Math.max(0, sisa - nominalParsed);
                  const quickAmounts = [
                    { label: "50rb",  val: 50000 },
                    { label: "100rb", val: 100000 },
                    { label: "200rb", val: 200000 },
                    { label: "500rb", val: 500000 },
                    { label: "Lunas", val: sisa },
                  ];
                  return (
                  <div className="flex flex-col h-full absolute inset-0 debt-bg z-[60] text-on-surface">
                    {/* Header */}
                    <header className="sticky top-0 z-10 border-b border-white/10 flex justify-between items-center px-margin-mobile h-16 max-w-lg mx-auto w-full" style={{background:"rgba(17,24,39,0.85)",backdropFilter:"blur(20px)"}}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDebtView("detail")} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-primary">arrow_back</span>
                        </button>
                        <div>
                          <h1 className="font-bold text-on-surface" style={{fontSize:17}}>Catat Pembayaran</h1>
                          <p className="debt-label" style={{marginTop:1}}>{selectedDebt.name} · sisa {fmtRp(sisa)}</p>
                        </div>
                      </div>
                    </header>

                    <main className="max-w-lg mx-auto px-margin-mobile pt-lg pb-32 overflow-y-auto flex-1 w-full">
                      {/* Nominal */}
                      <section className="mb-lg">
                        <label className="debt-label mb-2 block ml-1">NOMINAL PEMBAYARAN</label>
                        <div className="debt-card rounded-2xl p-lg mb-md" style={{boxShadow:"0 20px 48px rgba(0,0,0,0.3)"}}>
                          <div className="flex items-baseline gap-2 mb-lg">
                            <span className="font-headline-md text-headline-md text-on-surface" style={{opacity:0.7}}>Rp</span>
                            <input
                              className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full outline-none"
                              style={{fontSize:32,fontWeight:800,letterSpacing:-0.5}}
                              placeholder="0"
                              type="number"
                              inputMode="numeric"
                              value={paymentNominal}
                              onChange={e => setPaymentNominal(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {quickAmounts.map(q => (
                              <button
                                key={q.label}
                                onClick={() => setPaymentNominal(String(q.val))}
                                className="active:scale-95 transition-all"
                                style={{
                                  padding:"6px 16px", borderRadius:999, fontSize:13, fontWeight:600,
                                  background: nominalParsed === q.val
                                    ? (q.label === "Lunas" ? "rgba(71,226,102,0.15)" : "rgba(99,102,241,0.2)")
                                    : "rgba(255,255,255,0.05)",
                                  border: nominalParsed === q.val
                                    ? (q.label === "Lunas" ? "1px solid rgba(71,226,102,0.4)" : "1px solid rgba(99,102,241,0.4)")
                                    : "1px solid rgba(255,255,255,0.08)",
                                  color: nominalParsed === q.val
                                    ? (q.label === "Lunas" ? "#47e266" : "#aac7ff")
                                    : (q.label === "Lunas" ? "#47e266" : "#d1d5db"),
                                }}
                              >{q.label}</button>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Tanggal & Catatan */}
                      <section className="mb-lg space-y-md">
                        <div>
                          <label className="debt-label mb-2 block ml-1">TANGGAL</label>
                          <div className="debt-input rounded-xl flex items-center justify-between p-md" style={{cursor:"pointer"}}>
                            <span style={{fontSize:15,color:"#fff"}}>{paymentTanggal ? fmtDate(paymentTanggal) + ", " + paymentTanggal.slice(0,4) : "Pilih tanggal"}</span>
                            <input
                              type="date"
                              value={paymentTanggal}
                              onChange={e => setPaymentTanggal(e.target.value)}
                              style={{position:"absolute",opacity:0,width:1,height:1,pointerEvents:"none"}}
                              id="payment-date-input"
                            />
                            <span className="material-symbols-outlined" style={{color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer"}} onClick={() => document.getElementById("payment-date-input").showPicker?.()}>calendar_today</span>
                          </div>
                        </div>
                        <div>
                          <label className="debt-label mb-2 block ml-1">CATATAN (OPSIONAL)</label>
                          <div className="debt-input rounded-xl p-md">
                            <textarea
                              className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full resize-none outline-none"
                              style={{fontSize:15,lineHeight:"22px"}}
                              placeholder="Tambahkan keterangan (opsional)..."
                              rows={3}
                              value={paymentCatatan}
                              onChange={e => setPaymentCatatan(e.target.value)}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Sisa preview */}
                      <section className="mb-xl">
                        <div className="debt-card rounded-2xl p-lg flex justify-between items-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{background:"rgba(115,51,133,0.15)",filter:"blur(30px)",pointerEvents:"none"}}/>
                          <div className="relative z-10">
                            <p className="debt-label mb-1">SISA SETELAH BAYAR</p>
                            <p style={{fontSize:28,fontWeight:800,color:nominalParsed > 0 ? "#fff" : "rgba(255,255,255,0.3)",letterSpacing:-0.5}}>
                              {nominalParsed > 0 ? fmtRp(sisaSetelah) : "—"}
                            </p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10" style={{background:"rgba(115,51,133,0.2)",border:"1px solid rgba(115,51,133,0.4)"}}>
                            <span className="material-symbols-outlined" style={{color:"#c084fc",fontVariationSettings:"'FILL' 1"}}>account_balance_wallet</span>
                          </div>
                        </div>
                      </section>

                      <div className="absolute bottom-0 inset-x-0 pb-8 pt-4 px-margin-mobile max-w-lg mx-auto w-full flex justify-center z-40" style={{background:"linear-gradient(to top, #111827 60%, transparent)"}}>
                        <button
                          onClick={handleSavePayment}
                          disabled={nominalParsed <= 0}
                          className="w-full font-bold py-4 rounded-2xl active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed debt-muted-btn"
                          style={{fontSize:16,letterSpacing:0.5}}
                        >
                          Simpan Pembayaran
                        </button>
                      </div>
                    </main>
                  </div>
                  );
                })()}
              </>
            
  );
}
