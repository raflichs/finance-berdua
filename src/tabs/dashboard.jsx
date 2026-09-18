function DashboardTab(props) {
  const {
    allMonths, dashData, dashMonth, debtForm, debtList, debtView, editDebtForm, filterJenis,
    filterMonth, form, handleAddDebt, handleDelete, handleDeleteDebt, handleEditDebt,
    handleExport, handleExportGSheet, handleMarkLunas, handleSavePayment, handleSubmit, handleTemplateUpload,
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
    setShowCatEdit, setShowDebtMenu, setShowDebtModal, setShowEditDebtModal, setShowGSheetModal, setShowOld,
    setShowWeddingEdit, setTab, setWeddingActiveSection, setWeddingEditForm, setEditingCats,
    showDebtMenu, showOld, showToast, showWeddingEdit, transactions, weddingActiveSection,
    weddingEditForm, weddingSettings
  } = props;
  return (

              <>
                {/* ── Dashboard Top (Reverted to Original) ── */}
                <div className="hdr" style={{paddingTop: "max(24px, env(safe-area-inset-top))"}}>
                  <div>
                    <div className="hdr-title" style={{fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)"}}>Finance Berdua 👩‍❤️‍👨</div>
                    <div style={{fontSize:24,fontWeight:800,marginTop:4}}>Halo, {myName}!</div>
                  </div>
                  <div className="hdr-right">
                    <div className={`badge ${online?"badge-on":"badge-off"}`}>
                      <div className={`dot ${online?"dot-on":"dot-off"}`}/>
                      {online?"Tersync":"Offline"}
                    </div>
                    {partnerOnline && <div className="badge badge-partner"><div className="dot dot-pur"/>{partnerName} online</div>}
                  </div>
                </div>

                <div className="scroll" style={{paddingBottom: 112}}>
                  {/* import/export banner */}
                  <div style={{margin:"12px 16px", padding:"16px", borderRadius:"24px", border:"1px dashed rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", gap:"16px", cursor:"pointer"}} onClick={()=>document.getElementById("file-upload").click()}>
                    <div style={{fontSize:"32px"}}>📁</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#e0e2ed",marginBottom:4}}>Upload template Excel lo</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:500}}>Tap → pilih Finance_Tracker_Pro.xlsx</div>
                    </div>
                  </div>
                  <input type="file" id="file-upload" accept=".xlsx, .xls" style={{display:"none"}} onChange={handleTemplateUpload}/>

                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"20px 16px 12px"}}>
                    <div style={{border:"1px solid #fff",borderRadius:"999px",padding:"6px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}} onClick={()=>setDashMonth(prompt("Format YYYY-MM:", dashMonth)||dashMonth)}>
                      Bulan ini
                    </div>
                  </div>

                  {/* Balance card */}
                  <div className="balance-card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div className="bal-label">Total Uang</div>
                      <span className="material-symbols-outlined" style={{opacity:0.5,fontSize:18,cursor:"pointer"}} onClick={()=>setHideBalance(!hideBalance)}>{hideBalance?"visibility_off":"visibility"}</span>
                    </div>
                    <div className="bal-amount">{hideBalance?"Rp ••••••••":fmtRp(dashData.wallet.total)}</div>
                    
                    <div className="bal-row">
                      <div className="mini-stat">
                        <div className="mini-label"><div className="mini-dot" style={{background:"#0a84ff"}}/>QRIS</div>
                        <div className="mini-val" style={{color:"#60a5fa"}}>{hideBalance?"Rp ••••":fmtRp(dashData.wallet.QRIS)}</div>
                      </div>
                      <div className="mini-stat">
                        <div className="mini-label"><div className="mini-dot" style={{background:"#fbbf24"}}/>CASH</div>
                        <div className="mini-val" style={{color:"#fbbf24"}}>{hideBalance?"Rp ••••":fmtRp(dashData.wallet.Cash)}</div>
                      </div>
                    </div>
                    <div className="bal-row" style={{marginTop:8}}>
                      <div className="mini-stat">
                        <div className="mini-label"><div className="mini-dot" style={{background:"#34c759"}}/>MASUK BULAN INI</div>
                        <div className="mini-val" style={{color:"#34c759"}}>{hideBalance?"Rp ••••":fmtRp(dashData.pemasukan)}</div>
                      </div>
                      <div className="mini-stat">
                        <div className="mini-label"><div className="mini-dot" style={{background:"#ff3b30"}}/>KELUAR BULAN INI</div>
                        <div className="mini-val" style={{color:"#ff3b30"}}>{hideBalance?"Rp ••••":fmtRp(dashData.pengeluaran)}</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Peringatan Hutang Jatuh Tempo ── */}
                  {(() => {
                    const todayStr = today();
                    const in7Days = new Date();
                    in7Days.setDate(in7Days.getDate() + 7);
                    const in7DaysStr = `${in7Days.getFullYear()}-${pad2(in7Days.getMonth()+1)}-${pad2(in7Days.getDate())}`;

                    const urgent = debtList.filter(d => {
                      if (!d.jatuhTempo) return false;
                      const sisa = d.total - d.paid;
                      if (sisa <= 0) return false; // already paid
                      return d.jatuhTempo <= in7DaysStr; // due within 7 days or overdue
                    }).sort((a, b) => a.jatuhTempo > b.jatuhTempo ? 1 : -1);

                    if (urgent.length === 0) return null;
                    return (
                      <section style={{margin:"0 16px", marginTop:16}}>
                        {/* Header */}
                        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
                          <span style={{fontSize:11, fontWeight:700, color:"#ff5252", textTransform:"uppercase", letterSpacing:"0.8px"}}>⚠️ Hutang Jatuh Tempo</span>
                          <div style={{flex:1, height:1, background:"rgba(255,82,82,0.2)"}}/>
                          <span style={{fontSize:10, fontWeight:700, color:"rgba(255,82,82,0.6)", background:"rgba(255,82,82,0.12)", border:"1px solid rgba(255,82,82,0.25)", borderRadius:999, padding:"2px 8px"}}>{urgent.length}</span>
                        </div>
                        {/* Cards */}
                        <div style={{display:"flex", flexDirection:"column", gap:8}}>
                          {urgent.map(d => {
                            const isOverdue = d.jatuhTempo < todayStr;
                            const sisa = d.total - d.paid;
                            const sisaTxt = sisa >= 1000000 ? `Rp ${(sisa/1000000).toFixed(1)}jt` : `Rp ${(sisa/1000).toFixed(0)}rb`;
                            const daysLeft = Math.ceil((new Date(d.jatuhTempo) - new Date(todayStr)) / 86400000);
                            const badgeLabel = isOverdue
                              ? `Telat ${Math.abs(daysLeft)} hari`
                              : daysLeft === 0 ? "Hari ini!" : `${daysLeft} hari lagi`;
                            const badgeBg = isOverdue ? "rgba(255,59,48,0.18)" : "rgba(251,146,60,0.18)";
                            const badgeBorder = isOverdue ? "rgba(255,59,48,0.4)" : "rgba(251,146,60,0.4)";
                            const badgeColor = isOverdue ? "#ff3b30" : "#fb923c";
                            const glowColor = isOverdue ? "rgba(255,59,48,0.15)" : "rgba(251,146,60,0.1)";

                            return (
                              <div
                                key={d.id}
                                onClick={() => { setSelectedDebtId(d.id); setDebtView("detail"); setTab("debt"); }}
                                style={{
                                  background: `linear-gradient(135deg, ${isOverdue ? "rgba(255,59,48,0.08)" : "rgba(251,146,60,0.07)"}, rgba(17,24,39,0.6))`,
                                  border: `1px solid ${isOverdue ? "rgba(255,59,48,0.3)" : "rgba(251,146,60,0.25)"}`,
                                  borderRadius:16,
                                  padding:"14px 16px",
                                  display:"flex",
                                  alignItems:"center",
                                  gap:12,
                                  cursor:"pointer",
                                  backdropFilter:"blur(12px)",
                                  boxShadow:`0 4px 20px ${glowColor}`,
                                  transition:"transform 0.15s ease, opacity 0.15s ease",
                                  WebkitTapHighlightColor:"transparent",
                                  userSelect:"none",
                                }}
                                onTouchStart={e => e.currentTarget.style.transform = "scale(0.97)"}
                                onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
                              >
                                {/* Icon */}
                                <div style={{
                                  width:40, height:40, borderRadius:12, flexShrink:0,
                                  background: isOverdue ? "rgba(255,59,48,0.15)" : "rgba(251,146,60,0.12)",
                                  border: `1px solid ${badgeBorder}`,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                  <span className="material-symbols-outlined" style={{color: badgeColor, fontSize:20, fontVariationSettings:"'FILL' 1"}}>
                                    {isOverdue ? "warning" : "schedule"}
                                  </span>
                                </div>
                                {/* Info */}
                                <div style={{flex:1, minWidth:0}}>
                                  <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                                    <p style={{fontWeight:700, fontSize:15, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:140}}>{d.name}</p>
                                    <span style={{
                                      fontSize:10, fontWeight:700, borderRadius:999, padding:"2px 8px",
                                      background: badgeBg, border:`1px solid ${badgeBorder}`, color: badgeColor,
                                      whiteSpace:"nowrap", flexShrink:0,
                                      ...(isOverdue ? {animation:"pulse 1.5s infinite"} : {})
                                    }}>{badgeLabel}</span>
                                  </div>
                                  <p style={{fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2}}>
                                    {d.type} · jatuh tempo {fmtDate(d.jatuhTempo)}
                                  </p>
                                </div>
                                {/* Nominal sisa */}
                                <div style={{textAlign:"right", flexShrink:0}}>
                                  <p style={{fontWeight:800, fontSize:16, color: isOverdue ? "#ff5252" : "#fb923c", letterSpacing:"-0.5px"}}>{sisaTxt}</p>
                                  <p style={{fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase", marginTop:1}}>Sisa</p>
                                </div>
                                {/* Arrow */}
                                <span className="material-symbols-outlined" style={{color:"rgba(255,255,255,0.2)", fontSize:18, flexShrink:0}}>chevron_right</span>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}

                  {/* Kategori Terboros */}
                  {dashData.katSorted.length > 0 && (
                    <section className="space-y-sm mt-lg">
                      <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest px-xs">KATEGORI TERBOROS — {monthLabel(dashMonth).toUpperCase()}</h3>
                      <div className="glass-card rounded-2xl p-lg flex items-center justify-between">
                        {/* Donut Chart */}
                        <SubtleDonutChart data={dashData.katSorted} total={dashData.pengeluaran} />
                        {/* Legend */}
                        <div className="flex-1 ml-lg space-y-2">
                          {dashData.katSorted.slice(0, 4).map(([kat, val]) => {
                            const pct = Math.round((val / dashData.pengeluaran) * 100);
                            const c = KAT_COLORS[kat] || "#a78bfa";
                            return (
                              <div key={kat} className="flex items-center justify-between">
                                <div className="flex items-center gap-xs">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }}></div>
                                  <span className="text-[14px]">{EMOJI[kat]}</span>
                                  <span className="text-body-sm font-medium">{kat}</span>
                                </div>
                                <span className="text-body-sm font-bold">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Push Screen Buttons */}
                  <section className="grid grid-cols-2 gap-md mt-lg px-margin-mobile">
                    <div onClick={() => setTab("savings")} className="glass-card rounded-2xl p-md flex items-center gap-md hover:bg-white/5 transition-colors cursor-pointer active:scale-95">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary-container">favorite</span>
                      </div>
                      <div>
                        <p className="font-body-lg text-[15px] font-semibold text-on-surface leading-tight">Dana Nikah</p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">Target</p>
                      </div>
                    </div>
                    
                    <div onClick={() => setTab("debt")} className="glass-card rounded-2xl p-md flex items-center gap-md hover:bg-white/5 transition-colors cursor-pointer active:scale-95">
                      <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-error-container text-xl" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
                      </div>
                      <div>
                        <p className="font-body-lg text-[15px] font-semibold text-on-surface leading-tight">Hutang</p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">Lihat list</p>
                      </div>
                    </div>
                  </section>

                  {/* Recent Transactions */}
                  <section className="space-y-sm mt-lg px-margin-mobile">
                    <div className="flex justify-between items-center px-xs">
                      <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">TRANSAKSI TERBARU</h3>
                      <div className="flex gap-4">
                        <button title="Setting G-Sheet" className="text-xs font-bold text-primary hover:underline flex items-center gap-1" onClick={() => setShowGSheetModal(true)}>
                          <span className="material-symbols-outlined" style={{fontSize:16}}>settings</span>
                        </button>
                        <button title="Export G-Sheet" className="text-xs font-bold text-tertiary hover:underline flex items-center gap-1" onClick={handleExportGSheet}>
                          <span className="material-symbols-outlined" style={{fontSize:16}}>cloud_upload</span>
                        </button>
                      </div>
                    </div>
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="divide-y divide-white/5">
                        {dashData.txs.slice(0, 5).map(t => (
                          <div key={t.id} className="flex items-center justify-between p-md hover:bg-white/5 transition-colors cursor-pointer" onClick={() => t.jenis !== "CashMove" && setEditTx({...t, nominal:t.nominal.toLocaleString("id-ID")})}>
                            <div className="flex items-center gap-md">
                              <div className="w-12 h-12 rounded-xl bg-on-surface-variant/10 flex items-center justify-center text-xl">
                                {t.jenis==="CashMove" ? "Cash" : EMOJI[t.kategori]}
                              </div>
                              <div>
                                <p className="font-body-lg text-body-lg font-medium">{t.deskripsi}</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">{fmtDate(t.tanggal)} • {t.jenis==="CashMove" ? `${t.fromAccount} ke ${t.toAccount}` : `${t.kategori} • ${t.account||"QRIS"}`}</p>
                              </div>
                            </div>
                            <p className={`font-body-lg text-body-lg font-bold ${t.jenis==="Pemasukan" ? "text-tertiary-fixed" : t.jenis==="CashMove" ? "text-primary" : "text-error"}`}>
                              {t.jenis==="CashMove" ? "" : t.jenis==="Pemasukan" ? "+" : "-"}{fmtRp(t.nominal)}
                            </p>
                          </div>
                        ))}
                        {dashData.txs.length === 0 && (
                          <div className="p-lg text-center text-on-surface-variant text-body-sm">Belum ada transaksi di bulan ini.</div>
                        )}
                        {dashData.txs.length > 5 && (
                          <div className="p-sm text-center text-primary text-body-sm font-semibold cursor-pointer hover:bg-white/5" onClick={() => setTab("history")}>
                            Lihat semua ({dashData.txs.length})
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </>
            
  );
}
