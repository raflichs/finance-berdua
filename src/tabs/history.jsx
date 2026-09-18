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
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:12,opacity:.4}}>Cari</span>
          <input style={{width:"100%",background:"#111",border:".5px solid rgba(255,255,255,.1)",borderRadius:14,padding:"12px 16px 12px 52px",color:"#fff",fontFamily:"inherit",fontSize:14,outline:"none",WebkitAppearance:"none"}} placeholder="Cari transaksi, kategori, nama..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:20,lineHeight:1}}>x</button>}
        </div>
        {!isSearching && <div style={{display:"flex",gap:8,overflowX:"auto",margin:"0 -20px",padding:"0 20px 14px",scrollbarWidth:"none"}}>
          <div onClick={()=>setFilterMonth("")} style={{flexShrink:0,background:filterMonth===""?"rgba(255,255,255,.1)":"#111",border:"1px solid " + (filterMonth===""?"rgba(255,255,255,.8)":"rgba(255,255,255,.08)"),borderRadius:999,padding:"7px 14px",fontSize:12,fontWeight:700,color:filterMonth===""?"#fff":"rgba(255,255,255,.3)",cursor:"pointer",whiteSpace:"nowrap"}}>3 bln terakhir</div>
          {allMonths.filter(m=>m>=THREE_MONTHS_AGO).map((m,i)=><div key={m} onClick={()=>setFilterMonth(m)} style={{flexShrink:0,background:filterMonth===m?"rgba(255,255,255,.1)":"#111",border:"1px solid " + (filterMonth===m?"rgba(255,255,255,.8)":"rgba(255,255,255,.08)"),borderRadius:999,padding:"7px 14px",fontSize:12,fontWeight:700,color:filterMonth===m?"#fff":i===0?"#0a84ff":"rgba(255,255,255,.3)",cursor:"pointer",whiteSpace:"nowrap"}}>{i===0?"Bulan ini":monthLabel(m)}</div>)}
        </div>}
        <div className="filter-row">{["Semua","Pemasukan","Pengeluaran","QRIS","Cash","Makan","Transport","Belanja","Tagihan","Nongkrong","Hiburan","Tabungan","Atur Cash"].map(f=><div key={f} className={"filter-pill " + (filterJenis===f?"sel":"")} onClick={()=>setFilterJenis(f)}>{f}</div>)}</div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>{[["#34c759","Pemasukan",histPemasukan],["#ff3b30","Pengeluaran",histPengeluaran]].map(([c,label,val])=><div key={label} style={{flex:1,background:"#111",borderRadius:14,border:".5px solid rgba(255,255,255,.08)",padding:"10px 12px"}}><div style={{fontSize:10,color:"rgba(255,255,255,.3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:c}}/>{label}</div><div style={{fontSize:13,fontWeight:700,fontFamily:"inherit",color:c,marginTop:3}}>{fmtRp(val)}</div></div>)}</div>
        {!isSearching && !showOld && oldTxCount > 0 && <div onClick={()=>setShowOld(true)} style={{display:"flex",alignItems:"center",gap:10,background:"#111",border:".5px solid rgba(255,255,255,.08)",borderRadius:14,padding:"12px 14px",marginBottom:14,cursor:"pointer"}}><span style={{fontSize:12}}>Lama</span><div style={{flex:1,fontSize:12,color:"rgba(255,255,255,.3)",fontWeight:600}}>Ada {oldTxCount} transaksi tersembunyi {oldMonthMin ? "dari " + monthLabel(oldMonthMin) : ""}</div><span style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>Tampilkan</span></div>}
        {isSearching && <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:12,fontWeight:600}}>Mencari di semua transaksi termasuk yang lama...</div>}
        {histFiltered.length===0 ? <div className="empty"><div className="empty-icon">Cari</div><div className="empty-text">Tidak ada hasil</div><div className="empty-sub">Coba kata kunci atau filter lain</div></div> : histGrouped.map(([monthKey, txs])=><div key={monthKey}><div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.2)",textTransform:"uppercase",letterSpacing:1,padding:"16px 0 8px"}}>{monthLabel(monthKey)} - {txs.length} transaksi</div>{txs.map(t=>{ const isCashMove=t.jenis==="CashMove"; const account=t.account||"QRIS"; return <div key={t.id} className="tx-item"><div className="tx-icon" style={{background:t.jenis==="Pemasukan"?"rgba(52,199,89,.12)":isCashMove?"rgba(10,132,255,.12)":"rgba(255,59,48,.1)"}}>{isCashMove?"Cash":EMOJI[t.kategori]}</div><div className="tx-info"><div className="tx-desc">{t.deskripsi}</div><div className="tx-meta">{fmtDate(t.tanggal)} - {isCashMove?`${t.fromAccount} ke ${t.toAccount}`:`${t.kategori} - ${account}`}</div><span className="who-badge" style={{background:t.addedBy===myName?"rgba(88,86,214,.15)":"rgba(175,82,222,.1)",color:t.addedBy===myName?"#a78bfa":"#c4b5fd"}}>{t.addedBy===myName?"Gue":t.addedBy}</span></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><div className="tx-amount" style={{color:t.jenis==="Pemasukan"?"#34c759":isCashMove?"#60a5fa":"#ff3b30"}}>{isCashMove?"":t.jenis==="Pemasukan"?"+":"-"}{fmtRp(t.nominal)}</div><div style={{display:"flex",gap:6}}>{t.addedBy===myName && !isCashMove && <button className="del-btn" title="Edit" onClick={()=>setEditTx({...t, nominal:t.nominal.toLocaleString("id-ID")})}>Edit</button>}<button className="del-btn" title="Hapus" onClick={()=>handleDelete(t.id)}>Hapus</button></div></div></div>; })}</div>)}
        {showOld && !isSearching && <div style={{textAlign:"center",padding:"16px 0"}}><button onClick={()=>setShowOld(false)} style={{background:"none",border:".5px solid rgba(255,255,255,.08)",borderRadius:999,padding:"8px 20px",color:"rgba(255,255,255,.25)",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sembunyikan transaksi lama</button></div>}
      </div>
    </>
  );
}
