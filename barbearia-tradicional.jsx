import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "barbearia-data";

const defaultData = {
  produtos: [],
  clientes: [],
  contas: [],
  atendimentos: [],
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dateStr(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Icons ───
const Icons = {
  scissors: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
  ),
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  ),
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
};

// ─── Styles ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0D0D0D;
    --surface: #1A1A1A;
    --surface2: #242424;
    --surface3: #2E2E2E;
    --border: #333;
    --border2: #444;
    --text: #F0EDE8;
    --text2: #A09B93;
    --text3: #6B6560;
    --gold: #C9A84C;
    --gold2: #E8C96A;
    --gold-dim: #8B7A3A;
    --red: #C94C4C;
    --green: #4CAF50;
    --blue: #5C8EC9;
    --radius: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  /* Header */
  .header {
    padding: 20px 20px 16px;
    background: linear-gradient(180deg, #1A1714 0%, var(--bg) 100%);
    border-bottom: 1px solid var(--border);
  }
  .header-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.5px;
  }
  .header-sub {
    font-size: 12px;
    color: var(--text3);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-left: 2px;
  }

  /* Nav */
  .nav {
    display: flex;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 4px 8px;
    font-size: 10px;
    font-weight: 500;
    color: var(--text3);
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .nav-item.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
    background: rgba(201,168,76,0.05);
  }

  /* Content */
  .content { padding: 16px; padding-bottom: 80px; }

  /* Cards */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    margin-bottom: 10px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: var(--border2); }
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
  }
  .card-sub {
    font-size: 12px;
    color: var(--text2);
    margin-top: 2px;
  }
  .card-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.3px;
  }
  .badge-gold { background: rgba(201,168,76,0.15); color: var(--gold2); }
  .badge-green { background: rgba(76,175,80,0.15); color: var(--green); }
  .badge-red { background: rgba(201,76,76,0.15); color: var(--red); }
  .badge-blue { background: rgba(92,142,201,0.15); color: var(--blue); }

  .card-actions {
    display: flex;
    gap: 6px;
  }
  .btn-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface2);
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-icon:hover { border-color: var(--gold-dim); color: var(--gold); }
  .btn-icon.danger:hover { border-color: var(--red); color: var(--red); }

  /* FAB */
  .fab {
    position: fixed;
    bottom: 24px;
    right: calc(50% - 220px);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--gold);
    color: var(--bg);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(201,168,76,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    z-index: 20;
  }
  .fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(201,168,76,0.5); }

  @media (max-width: 520px) {
    .fab { right: 20px; }
  }

  /* Forms */
  .form-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 30;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .form-panel {
    background: var(--surface);
    border-top: 1px solid var(--gold-dim);
    border-radius: 16px 16px 0 0;
    width: 100%;
    max-width: 480px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 24px 20px 32px;
    animation: slideUp 0.25s ease-out;
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--gold);
    margin-bottom: 20px;
  }
  .field { margin-bottom: 14px; }
  .field label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: var(--text2);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .field input, .field select, .field textarea {
    width: 100%;
    padding: 10px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: var(--gold-dim);
  }
  .field select { cursor: pointer; }
  .field textarea { resize: vertical; min-height: 60px; }
  .field-row { display: flex; gap: 10px; }
  .field-row .field { flex: 1; }

  .btn-primary {
    width: 100%;
    padding: 12px;
    background: var(--gold);
    color: var(--bg);
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .btn-primary:hover { opacity: 0.9; }

  .btn-secondary {
    width: 100%;
    padding: 10px;
    background: none;
    color: var(--text2);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    margin-top: 6px;
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--text3); }

  /* Search */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 14px;
  }
  .search-bar input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text);
    font-size: 13px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .search-bar svg { color: var(--text3); }

  /* Section titles */
  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
  }

  /* Empty state */
  .empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--text3);
  }
  .empty svg { opacity: 0.3; margin-bottom: 12px; }
  .empty p { font-size: 13px; }

  /* Detail view */
  .detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .detail-header button {
    background: none;
    border: none;
    color: var(--gold);
    cursor: pointer;
    display: flex;
    padding: 4px;
  }
  .detail-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: var(--gold);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    text-align: center;
  }
  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--gold);
  }
  .stat-label {
    font-size: 10px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  /* Insight bars */
  .bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .bar-label {
    font-size: 12px;
    color: var(--text2);
    width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .bar-track {
    flex: 1;
    height: 8px;
    background: var(--surface2);
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold-dim), var(--gold));
    border-radius: 4px;
    transition: width 0.5s ease-out;
  }
  .bar-value {
    font-size: 11px;
    color: var(--text3);
    width: 60px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Chips for multi-select */
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .chip {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chip.selected {
    border-color: var(--gold-dim);
    background: rgba(201,168,76,0.12);
    color: var(--gold2);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Tags */
  .tag-row { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
  .tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 12px;
    background: rgba(201,168,76,0.1);
    color: var(--gold-dim);
    letter-spacing: 0.3px;
  }

  .clickable { cursor: pointer; }

  /* Insight cards */
  .insight-card {
    background: linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
  }
  .insight-title {
    font-size: 12px;
    color: var(--gold);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
`;

// ─── Main App ───
export default function App() {
  const [data, setData] = useState(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("produtos");
  const [form, setForm] = useState(null); // {type, item?}
  const [detail, setDetail] = useState(null); // {type, id}
  const [search, setSearch] = useState("");

  // Load
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setData(JSON.parse(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Save
  const save = useCallback(async (d) => {
    setData(d);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(d)); } catch {}
  }, []);

  const addItem = (key, item) => {
    const d = { ...data, [key]: [...data[key], { id: uid(), ...item }] };
    save(d);
    setForm(null);
  };

  const updateItem = (key, id, updates) => {
    const d = { ...data, [key]: data[key].map(i => i.id === id ? { ...i, ...updates } : i) };
    save(d);
    setForm(null);
  };

  const deleteItem = (key, id) => {
    if (!confirm("Excluir este item?")) return;
    const d = { ...data, [key]: data[key].filter(i => i.id !== id) };
    save(d);
  };

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#C9A84C", fontFamily: "Playfair Display, serif", fontSize: 20 }}>Barbearia Tradicional</div>;

  const tabs = [
    { key: "produtos", label: "Produtos", icon: Icons.box },
    { key: "clientes", label: "Clientes", icon: Icons.users },
    { key: "contas", label: "Contas", icon: Icons.wallet },
    { key: "insights", label: "Insights", icon: Icons.chart },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <span style={{ color: "#C9A84C" }}>{Icons.scissors}</span>
            <h1>Barbearia Tradicional</h1>
          </div>
          <div className="header-sub">Sistema de Gestão</div>
        </div>

        <nav className="nav">
          {tabs.map(t => (
            <button key={t.key} className={`nav-item ${tab === t.key ? "active" : ""}`} onClick={() => { setTab(t.key); setDetail(null); setSearch(""); }}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="content">
          {detail ? (
            <DetailView data={data} detail={detail} setDetail={setDetail} setForm={setForm} addItem={addItem} deleteItem={deleteItem} />
          ) : tab === "produtos" ? (
            <ProdutosTab data={data} search={search} setSearch={setSearch} setForm={setForm} deleteItem={deleteItem} />
          ) : tab === "clientes" ? (
            <ClientesTab data={data} search={search} setSearch={setSearch} setForm={setForm} setDetail={setDetail} deleteItem={deleteItem} />
          ) : tab === "contas" ? (
            <ContasTab data={data} search={search} setSearch={setSearch} setForm={setForm} deleteItem={deleteItem} />
          ) : (
            <InsightsTab data={data} setDetail={setDetail} setTab={setTab} />
          )}
        </div>

        {tab !== "insights" && !detail && (
          <button className="fab" onClick={() => setForm({ type: tab })}>
            {Icons.plus}
          </button>
        )}

        {form && (
          <FormPanel form={form} data={data} setForm={setForm} addItem={addItem} updateItem={updateItem} />
        )}
      </div>
    </>
  );
}

// ─── PRODUTOS ───
function ProdutosTab({ data, search, setSearch, setForm, deleteItem }) {
  const filtered = data.produtos.filter(p =>
    !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.fornecedor||"").toLowerCase().includes(search.toLowerCase())
  );
  const fornecedores = [...new Set(data.produtos.map(p => p.fornecedor).filter(Boolean))];

  return (
    <>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar produto ou fornecedor..." />
      {fornecedores.length > 0 && (
        <div className="tag-row" style={{ marginBottom: 14 }}>
          {fornecedores.map(f => (
            <span key={f} className="chip" style={{ cursor: "pointer" }} onClick={() => setSearch(search === f ? "" : f)}>
              {f}
            </span>
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty icon={Icons.box} text="Nenhum produto cadastrado" />
      ) : (
        filtered.map(p => (
          <div className="card" key={p.id}>
            <div className="card-row">
              <div>
                <div className="card-title">{p.nome}</div>
                <div className="card-sub">{p.fornecedor}{p.marca ? ` · ${p.marca}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="card-badge badge-gold">{money(p.precoVenda)}</div>
                {p.precoCusto && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>Custo: {money(p.precoCusto)}</div>}
              </div>
            </div>
            {p.estoque != null && (
              <div style={{ fontSize: 11, color: p.estoque <= 3 ? "var(--red)" : "var(--text3)", marginTop: 6 }}>
                Estoque: {p.estoque} un.
              </div>
            )}
            <div className="card-row" style={{ marginTop: 8 }}>
              <div className="tag-row">
                {p.categoria && <span className="tag">{p.categoria}</span>}
              </div>
              <div className="card-actions">
                <button className="btn-icon" onClick={() => setForm({ type: "produtos", item: p })}>{Icons.edit}</button>
                <button className="btn-icon danger" onClick={() => deleteItem("produtos", p.id)}>{Icons.trash}</button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}

// ─── CLIENTES ───
function ClientesTab({ data, search, setSearch, setForm, setDetail, deleteItem }) {
  const filtered = data.clientes.filter(c =>
    !search || c.nome.toLowerCase().includes(search.toLowerCase()) || (c.telefone||"").includes(search)
  );

  return (
    <>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />
      {filtered.length === 0 ? (
        <Empty icon={Icons.users} text="Nenhum cliente cadastrado" />
      ) : (
        filtered.map(c => {
          const atds = data.atendimentos.filter(a => a.clienteId === c.id);
          const total = atds.reduce((s, a) => s + (a.valor || 0), 0);
          return (
            <div className="card clickable" key={c.id} onClick={() => setDetail({ type: "cliente", id: c.id })}>
              <div className="card-row">
                <div>
                  <div className="card-title">{c.nome}</div>
                  <div className="card-sub" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {c.telefone && <>{Icons.phone} {c.telefone}</>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="card-badge badge-green">{atds.length} visitas</div>
                  {total > 0 && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>Total: {money(total)}</div>}
                </div>
              </div>
              {c.notas && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>{c.notas}</div>}
              <div className="card-row" style={{ marginTop: 8 }}>
                <div />
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => setForm({ type: "clientes", item: c })}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => deleteItem("clientes", c.id)}>{Icons.trash}</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

// ─── CONTAS ───
function ContasTab({ data, search, setSearch, setForm, deleteItem }) {
  const filtered = data.contas.filter(c =>
    !search || c.descricao.toLowerCase().includes(search.toLowerCase())
  );
  const fixas = filtered.filter(c => c.tipo === "fixa");
  const variaveis = filtered.filter(c => c.tipo === "variavel");
  const totalFixas = fixas.reduce((s, c) => s + (c.valor || 0), 0);
  const totalVar = variaveis.reduce((s, c) => s + (c.valor || 0), 0);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar conta..." />
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{money(totalFixas)}</div>
          <div className="stat-label">Fixas/mês</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{money(totalVar)}</div>
          <div className="stat-label">Variáveis</div>
        </div>
      </div>

      {fixas.length > 0 && <div className="section-title">Contas Fixas</div>}
      {fixas.map(c => (
        <ContaCard key={c.id} c={c} setForm={setForm} deleteItem={deleteItem} />
      ))}
      {variaveis.length > 0 && <div className="section-title" style={{ marginTop: 16 }}>Contas Variáveis</div>}
      {variaveis.map(c => (
        <ContaCard key={c.id} c={c} setForm={setForm} deleteItem={deleteItem} />
      ))}
      {filtered.length === 0 && <Empty icon={Icons.wallet} text="Nenhuma conta registrada" />}
    </>
  );
}

function ContaCard({ c, setForm, deleteItem }) {
  return (
    <div className="card">
      <div className="card-row">
        <div>
          <div className="card-title">{c.descricao}</div>
          <div className="card-sub">{c.categoria || c.tipo}{c.vencimento ? ` · Venc. dia ${c.vencimento}` : ""}</div>
        </div>
        <div className="card-badge badge-red">{money(c.valor)}</div>
      </div>
      <div className="card-row" style={{ marginTop: 8 }}>
        <div />
        <div className="card-actions">
          <button className="btn-icon" onClick={() => setForm({ type: "contas", item: c })}>{Icons.edit}</button>
          <button className="btn-icon danger" onClick={() => deleteItem("contas", c.id)}>{Icons.trash}</button>
        </div>
      </div>
    </div>
  );
}

// ─── INSIGHTS ───
function InsightsTab({ data, setDetail, setTab }) {
  const { clientes, atendimentos, produtos, contas } = data;

  const totalReceita = atendimentos.reduce((s, a) => s + (a.valor || 0), 0);
  const totalContas = contas.reduce((s, c) => s + (c.valor || 0), 0);
  const lucroEst = totalReceita - totalContas;

  // Top clientes
  const clienteStats = clientes.map(c => {
    const atds = atendimentos.filter(a => a.clienteId === c.id);
    return { ...c, visitas: atds.length, gasto: atds.reduce((s, a) => s + (a.valor || 0), 0) };
  }).sort((a, b) => b.gasto - a.gasto);

  const maxGasto = Math.max(...clienteStats.map(c => c.gasto), 1);

  // Produtos mais consumidos
  const produtoCount = {};
  atendimentos.forEach(a => {
    (a.produtos || []).forEach(pid => {
      const p = produtos.find(x => x.id === pid);
      if (p) produtoCount[p.nome] = (produtoCount[p.nome] || 0) + 1;
    });
  });
  const topProdutos = Object.entries(produtoCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxProd = Math.max(...topProdutos.map(p => p[1]), 1);

  // Monthly revenue
  const monthlyRev = {};
  atendimentos.forEach(a => {
    if (a.data) {
      const m = a.data.slice(0, 7);
      monthlyRev[m] = (monthlyRev[m] || 0) + (a.valor || 0);
    }
  });
  const months = Object.entries(monthlyRev).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonth = Math.max(...months.map(m => m[1]), 1);

  const hasData = atendimentos.length > 0;

  return (
    <>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{money(totalReceita)}</div>
          <div className="stat-label">Receita Total</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: lucroEst >= 0 ? "var(--green)" : "var(--red)" }}>{money(lucroEst)}</div>
          <div className="stat-label">Lucro Estimado</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{clientes.length}</div>
          <div className="stat-label">Clientes</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{atendimentos.length}</div>
          <div className="stat-label">Atendimentos</div>
        </div>
      </div>

      {!hasData ? (
        <div className="empty" style={{ padding: 24 }}>
          <p>Registre atendimentos nos perfis de clientes para gerar insights.</p>
        </div>
      ) : (
        <>
          {months.length > 0 && (
            <div className="insight-card">
              <div className="insight-title">Receita Mensal</div>
              {months.map(([m, v]) => (
                <div className="bar-row" key={m}>
                  <span className="bar-label">{m.split("-").reverse().join("/")}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(v / maxMonth) * 100}%` }} /></div>
                  <span className="bar-value">{money(v)}</span>
                </div>
              ))}
            </div>
          )}

          {clienteStats.length > 0 && (
            <div className="insight-card">
              <div className="insight-title">Top Clientes por Gasto</div>
              {clienteStats.slice(0, 5).map(c => (
                <div className="bar-row clickable" key={c.id} onClick={() => { setDetail({ type: "cliente", id: c.id }); setTab("clientes"); }}>
                  <span className="bar-label">{c.nome}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.gasto / maxGasto) * 100}%` }} /></div>
                  <span className="bar-value">{money(c.gasto)}</span>
                </div>
              ))}
            </div>
          )}

          {topProdutos.length > 0 && (
            <div className="insight-card">
              <div className="insight-title">Produtos Mais Consumidos</div>
              {topProdutos.map(([nome, count]) => (
                <div className="bar-row" key={nome}>
                  <span className="bar-label">{nome}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxProd) * 100}%` }} /></div>
                  <span className="bar-value">{count}x</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── DETAIL VIEW (Cliente) ───
function DetailView({ data, detail, setDetail, setForm, addItem, deleteItem }) {
  const cliente = data.clientes.find(c => c.id === detail.id);
  if (!cliente) return <div className="empty"><p>Cliente não encontrado</p></div>;

  const atds = data.atendimentos.filter(a => a.clienteId === detail.id).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const totalGasto = atds.reduce((s, a) => s + (a.valor || 0), 0);
  const ultimaVisita = atds[0]?.data;

  // Produtos favoritos
  const prodCount = {};
  atds.forEach(a => (a.produtos || []).forEach(pid => {
    const p = data.produtos.find(x => x.id === pid);
    if (p) prodCount[p.nome] = (prodCount[p.nome] || 0) + 1;
  }));
  const favProds = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Serviços favoritos
  const servCount = {};
  atds.forEach(a => (a.servicos || []).forEach(s => {
    servCount[s] = (servCount[s] || 0) + 1;
  }));
  const favServs = Object.entries(servCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <>
      <div className="detail-header">
        <button onClick={() => setDetail(null)}>{Icons.back}</button>
        <h2>{cliente.nome}</h2>
      </div>

      {cliente.telefone && (
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          {Icons.phone} {cliente.telefone}
        </div>
      )}
      {cliente.notas && <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>{cliente.notas}</div>}

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{atds.length}</div>
          <div className="stat-label">Visitas</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{money(totalGasto)}</div>
          <div className="stat-label">Total Gasto</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{atds.length ? money(totalGasto / atds.length) : "—"}</div>
          <div className="stat-label">Ticket Médio</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{ultimaVisita ? dateStr(ultimaVisita) : "—"}</div>
          <div className="stat-label">Última Visita</div>
        </div>
      </div>

      {(favServs.length > 0 || favProds.length > 0) && (
        <div className="insight-card">
          <div className="insight-title">Preferências</div>
          {favServs.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>Serviços favoritos</div>
              <div className="tag-row">
                {favServs.map(([s, c]) => <span key={s} className="tag">{s} ({c}x)</span>)}
              </div>
            </div>
          )}
          {favProds.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>Produtos favoritos</div>
              <div className="tag-row">
                {favProds.map(([p, c]) => <span key={p} className="tag">{p} ({c}x)</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-row" style={{ marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Atendimentos</div>
        <button className="btn-icon" style={{ borderColor: "var(--gold-dim)", color: "var(--gold)" }} onClick={() => setForm({ type: "atendimentos", clienteId: detail.id })}>
          {Icons.plus}
        </button>
      </div>

      {atds.length === 0 ? (
        <div className="empty" style={{ padding: 20 }}><p>Nenhum atendimento registrado</p></div>
      ) : (
        atds.map(a => (
          <div className="card" key={a.id}>
            <div className="card-row">
              <div>
                <div className="card-title">{dateStr(a.data)}</div>
                <div className="card-sub">
                  {(a.servicos || []).join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="card-badge badge-gold">{money(a.valor)}</span>
                <button className="btn-icon danger" onClick={() => deleteItem("atendimentos", a.id)}>{Icons.trash}</button>
              </div>
            </div>
            {(a.produtos || []).length > 0 && (
              <div className="tag-row" style={{ marginTop: 6 }}>
                {a.produtos.map(pid => {
                  const p = data.produtos.find(x => x.id === pid);
                  return p ? <span key={pid} className="tag">{p.nome}</span> : null;
                })}
              </div>
            )}
            {a.obs && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>{a.obs}</div>}
          </div>
        ))
      )}
    </>
  );
}

// ─── FORM PANEL ───
function FormPanel({ form, data, setForm, addItem, updateItem }) {
  const isEdit = !!form.item;
  const type = form.type;

  // Produtos form
  const [nome, setNome] = useState(form.item?.nome || "");
  const [fornecedor, setFornecedor] = useState(form.item?.fornecedor || "");
  const [marca, setMarca] = useState(form.item?.marca || "");
  const [categoria, setCategoria] = useState(form.item?.categoria || "");
  const [precoCusto, setPrecoCusto] = useState(form.item?.precoCusto || "");
  const [precoVenda, setPrecoVenda] = useState(form.item?.precoVenda || "");
  const [estoque, setEstoque] = useState(form.item?.estoque ?? "");

  // Clientes form
  const [telefone, setTelefone] = useState(form.item?.telefone || "");
  const [notas, setNotas] = useState(form.item?.notas || "");

  // Contas form
  const [descricao, setDescricao] = useState(form.item?.descricao || "");
  const [tipoConta, setTipoConta] = useState(form.item?.tipo || "fixa");
  const [valor, setValor] = useState(form.item?.valor || "");
  const [catConta, setCatConta] = useState(form.item?.categoria || "");
  const [vencimento, setVencimento] = useState(form.item?.vencimento || "");

  // Atendimentos form
  const [dataAtd, setDataAtd] = useState(form.item?.data || today());
  const [valorAtd, setValorAtd] = useState(form.item?.valor || "");
  const [obsAtd, setObsAtd] = useState(form.item?.obs || "");
  const [servicos, setServicos] = useState(form.item?.servicos || []);
  const [prodsSel, setProdsSel] = useState(form.item?.produtos || []);

  const servicosOpts = ["Corte", "Barba", "Corte + Barba", "Sobrancelha", "Pigmentação", "Hidratação"];

  const toggleServico = (s) => setServicos(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleProd = (pid) => setProdsSel(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);

  const handleSubmit = () => {
    if (type === "produtos") {
      const item = { nome, fornecedor, marca, categoria, precoCusto: Number(precoCusto) || 0, precoVenda: Number(precoVenda) || 0, estoque: estoque !== "" ? Number(estoque) : null };
      if (!nome) return;
      isEdit ? updateItem("produtos", form.item.id, item) : addItem("produtos", item);
    } else if (type === "clientes") {
      if (!nome) return;
      const item = { nome, telefone, notas };
      isEdit ? updateItem("clientes", form.item.id, item) : addItem("clientes", item);
    } else if (type === "contas") {
      if (!descricao) return;
      const item = { descricao, tipo: tipoConta, valor: Number(valor) || 0, categoria: catConta, vencimento };
      isEdit ? updateItem("contas", form.item.id, item) : addItem("contas", item);
    } else if (type === "atendimentos") {
      const item = { clienteId: form.clienteId, data: dataAtd, valor: Number(valorAtd) || 0, servicos, produtos: prodsSel, obs: obsAtd };
      addItem("atendimentos", item);
    }
  };

  const titles = { produtos: "Produto", clientes: "Cliente", contas: "Conta", atendimentos: "Atendimento" };

  return (
    <div className="form-overlay" onClick={() => setForm(null)}>
      <div className="form-panel" onClick={e => e.stopPropagation()}>
        <div className="form-title">{isEdit ? "Editar" : "Novo"} {titles[type]}</div>

        {type === "produtos" && (
          <>
            <div className="field"><label>Nome do Produto *</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pomada Modeladora" /></div>
            <div className="field-row">
              <div className="field"><label>Fornecedor</label><input value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Ex: Keune" /></div>
              <div className="field"><label>Marca</label><input value={marca} onChange={e => setMarca(e.target.value)} /></div>
            </div>
            <div className="field"><label>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione</option>
                <option value="Cabelo">Cabelo</option>
                <option value="Barba">Barba</option>
                <option value="Pele">Pele</option>
                <option value="Perfumaria">Perfumaria</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="field-row">
              <div className="field"><label>Preço de Custo</label><input type="number" step="0.01" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} /></div>
              <div className="field"><label>Preço de Venda</label><input type="number" step="0.01" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} /></div>
            </div>
            <div className="field"><label>Estoque (un.)</label><input type="number" value={estoque} onChange={e => setEstoque(e.target.value)} /></div>
          </>
        )}

        {type === "clientes" && (
          <>
            <div className="field"><label>Nome *</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" /></div>
            <div className="field"><label>Telefone</label><input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(19) 99999-9999" /></div>
            <div className="field"><label>Observações</label><textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Preferências, alergias, etc." /></div>
          </>
        )}

        {type === "contas" && (
          <>
            <div className="field"><label>Descrição *</label><input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Aluguel, Energia" /></div>
            <div className="field-row">
              <div className="field"><label>Tipo</label>
                <select value={tipoConta} onChange={e => setTipoConta(e.target.value)}>
                  <option value="fixa">Fixa</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
              <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Categoria</label>
                <select value={catConta} onChange={e => setCatConta(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Energia">Energia</option>
                  <option value="Água">Água</option>
                  <option value="Internet">Internet</option>
                  <option value="Materiais">Materiais</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Impostos">Impostos</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="field"><label>Dia Vencimento</label><input type="number" min="1" max="31" value={vencimento} onChange={e => setVencimento(e.target.value)} /></div>
            </div>
          </>
        )}

        {type === "atendimentos" && (
          <>
            <div className="field-row">
              <div className="field"><label>Data</label><input type="date" value={dataAtd} onChange={e => setDataAtd(e.target.value)} /></div>
              <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={valorAtd} onChange={e => setValorAtd(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Serviços</label>
              <div className="chips">
                {servicosOpts.map(s => (
                  <span key={s} className={`chip ${servicos.includes(s) ? "selected" : ""}`} onClick={() => toggleServico(s)}>{s}</span>
                ))}
              </div>
            </div>
            {data.produtos.length > 0 && (
              <div className="field">
                <label>Produtos Utilizados</label>
                <div className="chips">
                  {data.produtos.map(p => (
                    <span key={p.id} className={`chip ${prodsSel.includes(p.id) ? "selected" : ""}`} onClick={() => toggleProd(p.id)}>{p.nome}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="field"><label>Observações</label><textarea value={obsAtd} onChange={e => setObsAtd(e.target.value)} placeholder="Detalhes do atendimento" /></div>
          </>
        )}

        <button className="btn-primary" onClick={handleSubmit}>{isEdit ? "Salvar Alterações" : "Cadastrar"}</button>
        <button className="btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Shared Components ───
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar">
      {Icons.search}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="empty">
      <div style={{ transform: "scale(2)", marginBottom: 16 }}>{icon}</div>
      <p>{text}</p>
    </div>
  );
}
