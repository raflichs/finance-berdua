function HistoryTab(props) {
  const {
    allMonths, filterJenis, filterMonth, handleDelete, handleExport,
    setEditTx, histFiltered, histGrouped, histPemasukan, histPengeluaran,
    isSearching, myName, oldMonthMin, oldTxCount, search, setFilterJenis,
    setFilterMonth, setSearch, setShowOld, showOld
  } = props;
  return (
    <>
      <div className="hdr">
        <div><div className="hdr-sub">Semua catatan</div><div className="hdr-title">Riwayat</div></div>
      </div>
      <div className="scroll">
        <div style={{position:"relative",marginBottom:14}}>
          <span className="material-symbols-outlined" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,opacity:.4}}>search</span>
          <input style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:"12px 16px 12px 44px",color:"#fff",fontFamily:"inherit",fontSize:14,outline:"none",WebkitAppearance:"none"}} placeholder="Cari transaksi, kategori, nama..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>}
        </div>
        {!isSearching && <div style={{display:"flex",gap:6,overflowX:"auto",margin:"0 -16px",padding:"0 16px 12px",scrollbarWidth:"none"}}>
          <div onClick={()=>setFilterMonth("")} className={"pill "+(filterMonth===""?"sel":"")} style={{flexShrink:0}} >3 bln terakhir</div>
          {allMonths.filter(m=>m>=THREE_MONTHS_AGO).map((m,i)=><div key={m} onClick={()=>setFilterMonth(m)} className={"pill "+(filterMonth===m?"sel":"")} style={{flexShrink:0}}>{i===0?"Bulan ini":monthLabel(m)}</div>)}
        </div>}
        <div className="filter-row">{["Semua","Pemasukan","Pengeluaran","QRIS","Cash","Makan","Transport","Belanja","Tagihan","Nongkrong","Hiburan","Tabungan","Atur Cash"].map(f=><div key={f} className={"filter-pill " + (filterJenis===f?"sel":"")} onClick={()=>setFilterJenis(f)}>{f}</div>)}</div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>{[["#34c759","Pemasukan",histPemasukan],["#ff3b30","Pengeluaran",histPengeluaran]].map(([c,label,val])=><div key={label} className="card-glass" style={{flex:1,padding:"10px 12px"}}><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:c}}/>{label}</div><div style={{fontSize:13,fontWeight:700,color:c,marginTop:3}}>{fmtRp(val)}</div></div>)}</div>
        {!isSearching && !showOld && oldTxCount > 0 && <div onClick={()=>setShowOld(true)} className="card-glass" style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",marginBottom:14,cursor:"pointer"}}><span className="material-symbols-outlined" style={{fontSize:18,opacity:.6}}>history</span><div style={{flex:1,fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:600}}>Ada {oldTxCount} transaksi tersembunyi {oldMonthMin ? "dari " + monthLabel(oldMonthMin) : ""}</div><span style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>Tampilkan</span></div>}
        {isSearching && <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:12,fontWeight:600}}>Mencari di semua transaksi termasuk yang lama...</div>}
        {histFiltered.length===0 ? <div className="empty"><span className="material-symbols-outlined" style={{fontSize:40,opacity:.3}}>inbox</span><div className="empty-text">Tidak ada hasil</div><div className="empty-sub">Coba kata kunci atau filter lain</div></div> : histGrouped.map(([monthKey, txs])=><div key={monthKey}><div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:.8,padding:"16px 0 8px"}}>{monthLabel(monthKey)} · {txs.length} transaksi</div><div className="card-glass overflow-hidden" style={{padding:0}}>{txs.map(t=>{ const isCashMove=t.jenis==="CashMove"; const account=t.account||"QRIS"; return <div key={t.id} className="list-item"><div className="tx-icon" style={{background:t.jenis==="Pemasukan"?"rgba(52,199,89,.12)":isCashMove?"rgba(10,132,255,.12)":"rgba(255,59,48,.1)",border:"1px solid rgba(255,255,255,.06)"}}><span className="material-symbols-outlined" style={{fontSize:18,color:t.jenis==="Pemasukan"?"#34c759":isCashMove?"#60a5fa":"#ff3b30"}}>{isCashMove?"payments":iconFor(t.kategori)}</span></div><div className="tx-info"><div className="tx-desc">{t.deskripsi}</div><div className="tx-meta" style={{fontSize:12,fontWeight:400}}>{fmtDate(t.tanggal)} · {isCashMove?`${t.fromAccount} ke ${t.toAccount}`:`${t.kategori} · ${account}`}</div><span className="who-badge" style={{background:t.addedBy===myName?"rgba(88,86,214,.15)":"rgba(175,82,222,.1)",color:t.addedBy===myName?"#a78bfa":"#c4b5fd"}}>{t.addedBy===myName?"Gue":t.addedBy}</span></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><div className="tx-amount" style={{color:t.jenis==="Pemasukan"?"#34c759":isCashMove?"#60a5fa":"#ff3b30"}}>{isCashMove?"":t.jenis==="Pemasukan"?"+":"-"}{fmtRp(t.nominal)}</div><div style={{display:"flex",gap:6}}>{t.addedBy===myName && !isCashMove && <button className="del-btn" title="Edit" onClick={()=>setEditTx({...t, nominal:t.nominal.toLocaleString("id-ID")})}>Edit</button>}<button className="del-btn" title="Hapus" onClick={()=>handleDelete(t.id)}>Hapus</button></div></div></div>; })}</div></div>)}
        {showOld && !isSearching && <div style={{textAlign:"center",padding:"16px 0"}}><button onClick={()=>setShowOld(false)} className="pill">Sembunyikan transaksi lama</button></div>}
      </div>
    </>
  );
}
