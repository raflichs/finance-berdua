function DebtRow({ d, onOpen, onEdit, onDelete }) {
  let sx = 0, sy = 0, dx = 0, locked = null, t0 = 0;
  const isHutang = d.type === "Hutang";
  const sisa = Math.max(0, d.total - d.paid);
  const isLunasItem = sisa <= 0;
  const sisTxt = isLunasItem ? "Lunas" : (sisa >= 1000000 ? `${isHutang?"-":"+"}Rp${(sisa/1000000).toFixed(1)}jt` : `${isHutang?"-":"+"}${(sisa/1000).toFixed(0)}rb`);
  return (
    <div className="swipe-wrap">
      <div className="swipe-actions">
        <button className="act-edit" onClick={(e)=>{e.stopPropagation();onEdit(d);}}><span className="material-symbols-outlined" style={{fontSize:18}}>edit</span>Edit</button>
        <button className="act-del" onClick={(e)=>{e.stopPropagation();onDelete(d.id);}}><span className="material-symbols-outlined" style={{fontSize:18}}>delete</span>Hapus</button>
      </div>
      <div className="swipe-content list-item" data-swipe
        onTouchStart={e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;dx=0;locked=null;t0=Date.now();e.currentTarget.style.transition="none";}}
        onTouchMove={e=>{const t=e.touches[0];const ddx=t.clientX-sx;const dy=t.clientY-sy;if(!locked){if(Math.abs(ddx)<8&&Math.abs(dy)<8)return;locked=Math.abs(ddx)>Math.abs(dy)?"h":"v";}if(locked!=="h")return;e.preventDefault();dx=ddx;let tx=Math.min(0,Math.max(-168,dx));if(dx<-168)tx=-168+(dx+168)*0.3;e.currentTarget.style.transform=`translateX(${tx}px)`;}}
        onTouchEnd={e=>{if(locked!=="h")return;const el=e.currentTarget;el.style.transition="transform 300ms cubic-bezier(.32,0,.67,0)";const dt=Date.now()-t0;const v=Math.abs(dx)/Math.max(1,dt);if(dx<-60||(dx<-20&&v>0.35)){el.style.transform="translateX(-168px)";try{navigator.vibrate&&navigator.vibrate(10)}catch{}}else{el.style.transform="translateX(0px)";}}}
        onClick={onOpen}>
        <div className="tx-icon"><span className="material-symbols-outlined" style={{fontSize:18,opacity:.7}}>{isLunasItem?"check_circle":"person"}</span></div>
        <div className="tx-info"><div className="tx-desc">{d.name}</div><div className="tx-meta">{isLunasItem?"Lunas":(d.jatuhTempo?`Jatuh tempo ${fmtDate(d.jatuhTempo)}`:(d.keterangan||"Belum lunas"))}</div></div>
        <div style={{textAlign:"right",flexShrink:0}}><div className="tx-amount" style={{color:isLunasItem?"#34c759":isHutang?"#ff3b30":"#34d399"}}>{sisTxt}</div><div className="tx-meta">{d.type}</div></div>
      </div>
    </div>
  );
}
function DebtTab(props) {
  const {
    debtForm, debtList, debtView, editDebtForm, handleAddDebt, handleDeleteDebt, handleEditDebt,
    handleMarkLunas, handleSavePayment, myName,
    paymentCatatan, paymentNominal, paymentTanggal,
    selectedDebt, selectedDebtId,
    setDebtForm, setDebtView, setEditDebtForm, setSelectedDebtId,
    setShowDebtModal, setShowEditDebtModal, setTab,
    showDebtModal, showEditDebtModal, showToast
  } = props;
  if (debtView === "detail" && selectedDebt) {
    const cikilans = (selectedDebt.cicilan || []).slice().sort((a,b) => b.id - a.id);
    const isLunas = selectedDebt.paid >= selectedDebt.total;
    const progressPct = Math.min(100, selectedDebt.total > 0 ? Math.round((selectedDebt.paid / selectedDebt.total) * 100) : 0);
    return (
      <div className="screen">
        <header className="hdr"><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={() => { setDebtView("list"); setSelectedDebtId(null); }} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",backdropFilter:"blur(12px)"}} aria-label="Kembali ke Daftar Hutang"><span className="material-symbols-outlined" style={{fontSize:18}}>arrow_back_ios_new</span></button><div><div className="hdr-sub">{selectedDebt.keterangan||selectedDebt.type}</div><h1 className="hdr-title">{selectedDebt.type}: {selectedDebt.name}</h1></div></div>{isLunas && <span className="pill sel">Lunas</span>}</header>
        <div className="scroll">
          {showEditDebtModal && editDebtForm && (
            <div className="card-glass" style={{padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><b>Edit {editDebtForm.type}</b><button className="pill" onClick={() => setShowEditDebtModal(false)}>Tutup</button></div>
              <div className="field-label">Nama</div><input className="inp" value={editDebtForm.name} onChange={e => setEditDebtForm(f=>({...f,name:e.target.value}))}/>
              <div className="field-label">Total (Rp)</div><input className="inp" inputMode="numeric" value={editDebtForm.total} onChange={e => setEditDebtForm(f=>({...f,total:e.target.value}))}/>
              <div className="field-label">Jatuh tempo</div><input className="inp" type="date" value={editDebtForm.jatuhTempo||""} onChange={e => setEditDebtForm(f=>({...f,jatuhTempo:e.target.value}))}/>
              <div className="field-label">Keterangan</div><input className="inp" value={editDebtForm.keterangan} onChange={e => setEditDebtForm(f=>({...f,keterangan:e.target.value}))}/>
              <div style={{display:"flex",gap:8}}><button className="pill" onClick={() => handleDeleteDebt(editDebtForm.id)}>Hapus</button><button className="submit-btn" style={{marginTop:0}} onClick={handleEditDebt}>Simpan perubahan</button></div>
            </div>
          )}
          <div className="card-glass" style={{padding:20,marginBottom:12}}>
            <div className="field-label">Total {selectedDebt.type}</div>
            <div style={{fontSize:30,fontWeight:800}}>{fmtRp(selectedDebt.total)}</div>
            <div style={{display:"flex",gap:12,marginTop:10}}><div><div className="field-label">Dibayar</div><b style={{color:"#34d399"}}>{fmtRp(selectedDebt.paid)}</b></div><div style={{textAlign:"right",marginLeft:"auto"}}><div className="field-label">Sisa</div><b style={{color:selectedDebt.type==="Hutang"?"#ff3b30":"#34d399"}}>{fmtRp(Math.max(0,selectedDebt.total-selectedDebt.paid))}</b></div></div>
            <div style={{marginTop:12,background:"rgba(255,255,255,.06)",borderRadius:999,height:8}}><div style={{width:`${progressPct}%`,height:"100%",borderRadius:999,background:"#47e266"}}/></div>
            <div className="tx-meta" style={{marginTop:6}}>{progressPct}% lunas{selectedDebt.jatuhTempo?` · jatuh tempo ${fmtDate(selectedDebt.jatuhTempo)}`:""}</div>
          </div>
          <div className="sec-title">Riwayat cicilan ({cikilans.length})</div>
          <div className="card-glass overflow-hidden" style={{padding:0,marginBottom:12}}>{cikilans.length===0?<div className="list-item"><div className="tx-meta">Belum ada cicilan tercatat.</div></div>:cikilans.map(c=><div key={c.id} className="list-item"><div className="tx-icon"><span className="material-symbols-outlined" style={{fontSize:18}}>payments</span></div><div className="tx-info"><div className="tx-desc">{fmtRp(c.nominal)}</div><div className="tx-meta">{fmtDate(c.tanggal)}{c.catatan?" · "+c.catatan:""}</div></div><span className="pill sel">Bayar</span></div>)}</div>
          {!isLunas && <button className="submit-btn" onClick={() => { setDebtView("payment"); }}>Catat Pembayaran</button>}
          <div style={{display:"flex",gap:8,marginTop:8}}>{!isLunas && <button className="pill" style={{flex:1,justifyContent:"center"}} onClick={() => { if(window.confirm(`Tandai ${selectedDebt.name} lunas?`)) handleMarkLunas(); }}>Lunas semua</button>}<button className="pill" style={{flex:1,justifyContent:"center"}} onClick={() => { setEditDebtForm({...selectedDebt}); setShowEditDebtModal(true); }}>Edit</button>}<button className="pill" style={{flex:1,justifyContent:"center"}} onClick={() => { setDebtView("list"); setSelectedDebtId(null); }}>Ke list</button></div>
        </div>
      </div>
    );
  }
  if (debtView === "payment" && selectedDebt) {
    const sisa = selectedDebt.total - selectedDebt.paid;
    const nominalParsed = parseMoney(paymentNominal) || 0;
    const sisaSetelah = Math.max(0, sisa - nominalParsed);
    return (
      <div className="screen">
        <header className="hdr"><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={() => setDebtView("detail")} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",backdropFilter:"blur(12px)"}} aria-label="Kembali ke detail"><span className="material-symbols-outlined" style={{fontSize:18}}>arrow_back_ios_new</span></button><div><div className="hdr-sub">{selectedDebt.name} · sisa {fmtRp(sisa)}</div><h1 className="hdr-title">Catat Pembayaran</h1></div></div></header>
        <div className="scroll">
          <div className="card-glass" style={{padding:20,marginBottom:12}}>
            <div className="field-label">Nominal pembayaran</div>
            <input className="inp" type="number" inputMode="numeric" placeholder="0" value={paymentNominal} onChange={e => props.setPaymentNominal(e.target.value)} autoFocus/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{label:"50rb",val:50000},{label:"100rb",val:100000},{label:"200rb",val:200000},{label:"500rb",val:500000},{label:"Lunas",val:sisa}].map(q=><button key={q.label} className={"pill "+(nominalParsed===q.val?"sel":"")} onClick={()=>props.setPaymentNominal(String(q.val))}>{q.label}</button>)}</div>
          </div>
          <div className="field-label">Tanggal</div><input className="inp" type="date" value={paymentTanggal} onChange={e => props.setPaymentTanggal(e.target.value)}/>
          <div className="field-label">Catatan (opsional)</div><input className="inp" value={paymentCatatan} onChange={e => props.setPaymentCatatan(e.target.value)} placeholder="Keterangan..."/>
          <div className="card-glass" style={{padding:16,marginBottom:12}}><div className="field-label">Sisa setelah bayar</div><div style={{fontSize:24,fontWeight:800}}>{nominalParsed>0?fmtRp(sisaSetelah):"—"}</div></div>
          <button className="submit-btn" disabled={nominalParsed<=0} onClick={handleSavePayment}>Simpan Pembayaran</button>
        </div>
      </div>
    );
  }
  const totalHutang = debtList.filter(d => d.type === "Hutang").reduce((s, d) => s + (d.total - d.paid), 0);
  const totalPiutang = debtList.filter(d => d.type === "Piutang").reduce((s, d) => s + (d.total - d.paid), 0);
  return (
    <div className="screen">
      <header className="hdr"><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={() => setTab("dashboard")} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",backdropFilter:"blur(12px)"}} aria-label="Kembali ke Dashboard"><span className="material-symbols-outlined" style={{fontSize:18}}>arrow_back_ios_new</span></button><div><div className="hdr-sub">Catat & lunasi</div><h1 className="hdr-title">Daftar Hutang</h1></div></div></header>
      <div className="scroll">
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div className="card-glass" style={{flex:1,padding:14}}><div className="field-label">Saya berhutang</div><div style={{fontWeight:800,color:"#ff3b30"}}>{fmtRp(totalHutang)}</div></div>
          <div className="card-glass" style={{flex:1,padding:14}}><div className="field-label">Piutang saya</div><div style={{fontWeight:800,color:"#34d399"}}>{fmtRp(totalPiutang)}</div></div>
        </div>
        <div className="sec-title">Hutang aktif</div>
        <div className="card-glass overflow-hidden" style={{padding:0,marginBottom:12}}>
          {debtList.length===0 && <div className="empty"><span className="material-symbols-outlined" style={{fontSize:40,opacity:.3}}>inbox</span><div className="empty-text">Belum ada hutang</div><div className="empty-sub">Ada yang ngutangin atau lo yang ngutang? Catet di bawah.</div></div>}
          {debtList.map(d=><DebtRow key={d.id} d={d} onOpen={()=>{setSelectedDebtId(d.id);setDebtView("detail");}} onEdit={(row)=>{setEditDebtForm({...row});setSelectedDebtId(row.id);setDebtView("detail");setShowEditDebtModal(true);}} onDelete={(id)=>{if(window.confirm("Hapus entri ini?"))handleDeleteDebt(id);}}/>)}
        </div>
        {!showDebtModal && <button className="submit-btn" onClick={() => setShowDebtModal(true)}>Catat hutang baru</button>}
        {showDebtModal && (
          <div className="card-glass" style={{padding:20,marginTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><b>Catat Hutang Baru</b><button className="pill" onClick={()=>setShowDebtModal(false)}>Tutup</button></div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>{["Hutang","Piutang"].map(t=><button key={t} className={"pill "+(debtForm.type===t?"sel":"")} onClick={()=>setDebtForm(f=>({...f,type:t}))}>{t}</button>)}</div>
            <div className="field-label">Nominal (Rp)</div><input className="inp" inputMode="numeric" placeholder="0" value={debtForm.total} onChange={e=>setDebtForm(f=>({...f,total:e.target.value}))}/>
            <div className="field-label">Nama kontak</div><input className="inp" placeholder="Siapa?" value={debtForm.name} onChange={e=>setDebtForm(f=>({...f,name:e.target.value}))}/>
            <div className="field-label">Jatuh tempo</div><input className="inp" type="date" value={debtForm.jatuhTempo||""} onChange={e=>setDebtForm(f=>({...f,jatuhTempo:e.target.value}))}/>
            <div className="field-label">Kategori</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{["Makanan","Sosial","Tagihan","Transportasi","Lainnya"].map(cat=><button key={cat} className={"pill "+(debtForm.kategori===cat?"sel":"")} onClick={()=>setDebtForm(f=>({...f,kategori:f.kategori===cat?"":cat}))}>{cat}</button>)}</div>
            <div className="field-label">Catatan (opsional)</div><input className="inp" value={debtForm.keterangan} onChange={e=>setDebtForm(f=>({...f,keterangan:e.target.value}))} placeholder="Keterangan..."/>
            <button className="submit-btn" onClick={handleAddDebt}>Simpan Hutang Baru</button>
          </div>
        )}
      </div>
    </div>
  );
}
