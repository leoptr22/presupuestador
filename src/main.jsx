import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { materials, presets, profiles } from './data'
import './styles.css'

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function resolvePrice(item, profile, technology, uvMode = 'cmyk') {
  const list = item.prices?.[profile]
  if (!list) return null
  if (item.independent) return list.eco ?? list.uv ?? list.uvPlus ?? null
  if (technology === 'eco') return list.eco ?? null
  return uvMode === 'plus' ? (list.uvPlus ?? null) : (list.uv ?? null)
}

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    ruler: <><path d="M3 21 21 3l-4-1-2 2 2 2-2 2-2-2-2 2 2 2-2 2-2-2-2 2 2 2-4 4Z"/></>,
    cube: <><path d="m21 16-9 5-9-5V8l9-5 9 5Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [profile, setProfile] = useState('publico')
  const [selectedIds, setSelectedIds] = useState(['vinilo-promo'])
  const [search, setSearch] = useState('')
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [linearMeters, setLinearMeters] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [technology, setTechnology] = useState('eco')
  const [uvMode, setUvMode] = useState('cmyk')
  const [copied, setCopied] = useState(false)

  const selected = useMemo(() => selectedIds.map(id => materials.find(m => m.id === id)).filter(Boolean), [selectedIds])
  const hasAreaItems = selected.some(item => !item.fixed && item.billing !== 'linear')
  const hasLinearItems = selected.some(item => item.billing === 'linear')
  const categories = useMemo(() => {
    const found = materials.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(search.toLowerCase()))
    return Object.groupBy(found, m => m.category)
  }, [search])

  const calc = useMemo(() => {
    const w = Math.max(Number(width) || 0, 0)
    const h = Math.max(Number(height) || 0, 0)
    const ml = Math.max(Number(linearMeters) || 0, 0)
    const q = Math.max(Number(quantity) || 1, 1)
    const rawArea = (w / 100) * (h / 100)
    const billedArea = Math.max(rawArea, .25)
    const lines = selected.map(item => {
      const unitPrice = resolvePrice(item, profile, technology, uvMode)
      const billUnits = item.fixed ? 1 : item.billing === 'linear' ? ml : billedArea
      const lineTotal = unitPrice == null ? null : Math.round(unitPrice * billUnits * q)
      const billingLabel = item.fixed ? `${q} u.` : item.billing === 'linear' ? `${billUnits.toLocaleString('es-AR', {maximumFractionDigits:2})} ml × ${q}` : `${billUnits.toLocaleString('es-AR', {maximumFractionDigits:2})} m² × ${q}`
      return { ...item, unitPrice, lineTotal, billUnits, billingLabel }
    })
    return { rawArea, billedArea, ml, q, lines, total: lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0), unavailable: lines.filter(line => line.lineTotal == null).length }
  }, [width, height, linearMeters, quantity, selected, profile, technology, uvMode])

  function toggleMaterial(id) {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  const lineText = calc.lines.map(line => `• ${line.name}: ${line.lineTotal == null ? 'Consultar' : money.format(line.lineTotal)}`).join('\n')
  const technologyLabel = technology === 'eco' ? 'Ecosolvente' : uvMode === 'plus' ? 'UV CMYK + W + V' : 'UV CMYK'
  const quoteText = `PRESUPUESTO · ROJAS IMPRESIONES\n\nTrabajo fusionado (${calc.lines.length} componentes)\nImpresión: ${technologyLabel}${hasAreaItems ? `\nMedida: ${width} × ${height} cm` : ''}${hasLinearItems ? `\nMetros lineales: ${calc.ml}` : ''}\nCantidad: ${calc.q}\n\n${lineText}\n\nTOTAL: ${money.format(calc.total)}\n\nPrecios expresados en pesos argentinos. Validez: 7 días.`

  async function copyQuote() {
    await navigator.clipboard.writeText(quoteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function downloadQuote() {
    const blob = new Blob([quoteText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'presupuesto-trabajo-fusionado.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Rojas Impresiones"><span className="brand-logo" role="img" aria-label="Logo Rojas Impresiones"></span></a>
      <div className="top-title"><span></span> PRESUPUESTADOR GRAN FORMATO</div>
      <div className="profile-picker">
        <label htmlFor="profile">Lista de precios</label>
        <select id="profile" value={profile} onChange={e => setProfile(e.target.value)}>
          {Object.entries(profiles).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
      </div>
    </header>

    <main>
      <section className="intro">
        <div><p className="eyebrow">OBTENÉ UNA COTIZACIÓN ESTIMADA DE TU TRABAJO EN GRAN FORMATO</p><h1>Armá el trabajo, <em>capa por capa.</em></h1><p>Ante cualquier duda, comunicate con nuestro equipo o acercate a nuestro local.</p></div>
        <div className="step-line" aria-label="Pasos"><span className="active">1 <b>Impresión</b></span><i></i><span className="active">2 <b>Componentes</b></span><i></i><span className="active">3 <b>Total</b></span></div>
      </section>

      <div className="workspace">
        <section className="builder">
          <div className="section-heading"><span>01</span><div><h2>Tipo de impresión</h2><p>Elegí una opción para todo el trabajo.</p></div></div>
          <div className="tech-selector">
            <button className={technology === 'eco' ? 'selected' : ''} onClick={() => setTechnology('eco')}><span>ECO</span><b>Ecosolvente</b><small>Excelente calidad y durabilidad</small><i>{technology === 'eco' && <Icon name="check" size={15}/>}</i></button>
            <button className={technology === 'uv' ? 'selected uv' : ''} onClick={() => setTechnology('uv')}><span>UV</span><b>Impresión UV</b><small>Elegí CMYK o CMYK + W + V</small><i>{technology === 'uv' && <Icon name="check" size={15}/>}</i></button>
          </div>
          {technology === 'uv' && <div className="uv-modes"><span>Configuración UV</span><div><button className={uvMode === 'cmyk' ? 'active' : ''} onClick={() => setUvMode('cmyk')}><b>CMYK</b><small>Sin blanco ni laca</small></button><button className={uvMode === 'plus' ? 'active' : ''} onClick={() => setUvMode('plus')}><b>CMYK + W + V</b><small>Blanco + varnish/laca incluidos</small></button></div></div>}

          <div className="components-heading">
            <div className="section-heading"><span>02</span><div><h2>Sumá los componentes</h2><p>Podés elegir todos los materiales y terminaciones que necesites.</p></div></div>
            <strong>{selected.length} {selected.length === 1 ? 'ítem' : 'ítems'}</strong>
          </div>
          <div className="search"><Icon name="search"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vinilo, laca, corte, foam…" /></div>
          <div className="composition-strip">
            <Icon name="layers" size={17}/>
            {selected.length ? selected.map(item => <button key={item.id} onClick={() => toggleMaterial(item.id)}>{item.name}<b>×</b></button>) : <span>Elegí al menos un componente para armar el trabajo.</span>}
          </div>
          <div className="material-list multi-list">
            {Object.entries(categories).map(([category, items]) => <div className="material-group" key={category}>
              <h3>{category}</h3>
              <div className="material-grid">
                {items.map(item => { const active = selectedIds.includes(item.id); const exactPrice = resolvePrice(item, profile, technology, uvMode); const unavailable = exactPrice == null; const onlyPlus = technology === 'uv' && uvMode === 'cmyk' && item.prices?.[profile]?.uv == null && item.prices?.[profile]?.uvPlus != null; return <button key={item.id} aria-pressed={active} disabled={unavailable} className={`material-card ${active ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`} onClick={() => toggleMaterial(item.id)}>
                  <span className="material-icon"><Icon name={item.fixed || item.category === 'Materiales rígidos' ? 'cube' : 'ruler'}/></span>
                  <span className="material-copy"><b>{item.name}</b><small>{item.desc}</small><em>{unavailable ? (item.uvOnly && technology === 'eco' ? 'Sólo disponible en UV' : onlyPlus ? 'Sólo en CMYK + W + V' : 'Sin precio en esta lista') : `${money.format(exactPrice)} / ${item.unit}`}{item.uvOnly && !unavailable ? ' · Sólo UV' : ''}</em></span>
                  {item.popular && <span className="popular">Popular</span>}
                  <span className="check-box">{active ? <Icon name="check" size={14}/> : <Icon name="plus" size={13}/>}</span>
                </button>})}
              </div>
            </div>)}
            {Object.keys(categories).length === 0 && <div className="empty">No encontramos componentes con “{search}”.</div>}
          </div>

          <div className="dimensions">
            <div className="section-heading"><span>03</span><div><h2>Cantidades del trabajo</h2><p>Cada componente usa su unidad correcta: m², metro lineal o unidad.</p></div></div>
            {hasAreaItems && <><h3 className="measure-title">Componentes por metro cuadrado</h3><div className="measure-row">
              <label>Ancho <span><input aria-label="Ancho en centímetros" type="number" min="1" value={width} onChange={e => setWidth(e.target.value)}/><b>cm</b></span></label>
              <b className="times">×</b>
              <label>Alto <span><input aria-label="Alto en centímetros" type="number" min="1" value={height} onChange={e => setHeight(e.target.value)}/><b>cm</b></span></label>
              <label className="qty">Cantidad <span><input aria-label="Cantidad" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}/><b>u.</b></span></label>
            </div>
            <div className="presets"><span>Medidas rápidas</span>{presets.map(p => <button onClick={() => { setWidth(p.w); setHeight(p.h) }} key={p.label}>{p.label} cm</button>)}</div>
            {calc.rawArea < .25 && <p className="minimum">Se aplica el mínimo de facturación de 50 × 50 cm (0,25 m²).</p>}</>}
            {hasLinearItems && <div className="linear-measure"><h3 className="measure-title">Componentes por metro lineal</h3><div><label>Metros lineales <span><input aria-label="Metros lineales" type="number" min="0" step="0.1" value={linearMeters} onChange={e => setLinearMeters(e.target.value)}/><b>ml</b></span></label><p>No se usa ancho × alto: sólo la cantidad de metros lineales.</p></div></div>}
            {!hasAreaItems && <label className="standalone-qty">Cantidad <span><input aria-label="Cantidad" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}/><b>u.</b></span></label>}
          </div>
        </section>

        <aside className="quote">
          <div className="quote-head"><span><small>PRESUPUESTO FUSIONADO</small><b>Detalle del trabajo</b></span><i>ARS</i></div>
          <div className="preview"><span className="preview-art"><img src="/logo-rojas.png" alt="Rojas Impresiones" /></span><div><small>COMPOSICIÓN SELECCIONADA</small><b>{selected.length} {selected.length === 1 ? 'componente' : 'componentes'}</b><p>{technologyLabel}{hasAreaItems ? ` · ${width || 0} × ${height || 0} cm` : ''}{hasLinearItems ? ` · ${calc.ml} ml` : ''}</p></div></div>
          <div className="line-items">
            {calc.lines.length ? calc.lines.map(line => <div key={line.id} className={line.lineTotal == null ? 'unpriced-line' : ''}><span><b>{line.name}</b><small>{line.billingLabel} · {line.unitPrice == null ? 'sin precio' : `${money.format(line.unitPrice)} / ${line.unit}`}</small></span><strong>{line.lineTotal == null ? 'Consultar' : money.format(line.lineTotal)}</strong></div>) : <p>Agregá componentes para calcular el total.</p>}
          </div>
          <dl className="summary compact-summary">
            <div><dt>Tecnología</dt><dd>{technologyLabel}</dd></div>
            {hasAreaItems && <div><dt>Superficie por unidad</dt><dd>{calc.rawArea.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m²</dd></div>}
            {hasLinearItems && <div><dt>Metros lineales</dt><dd>{calc.ml.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ml</dd></div>}
            <div><dt>Cantidad</dt><dd>{calc.q} {calc.q === 1 ? 'unidad' : 'unidades'}</dd></div>
          </dl>
          <div className="total"><span><small>TOTAL DEL TRABAJO</small><b>{money.format(calc.total)}</b></span><small>Precio sin IVA</small></div>
          {calc.unavailable > 0 && <p className="price-warning">Hay {calc.unavailable} {calc.unavailable === 1 ? 'ítem sin precio' : 'ítems sin precio'} en esta lista.</p>}
          <p className="validity"><Icon name="check" size={16}/> Todos los componentes están fusionados</p>
          <button className="primary" onClick={copyQuote} disabled={!selected.length}><Icon name={copied ? 'check' : 'copy'}/>{copied ? '¡Presupuesto copiado!' : 'Copiar presupuesto'}</button>
          <button className="secondary" onClick={downloadQuote} disabled={!selected.length}><Icon name="download"/> Descargar detalle</button>
          <p className="disclaimer">El valor es estimativo y puede variar según requisitos técnicos. Consultanos para confirmar el trabajo.</p>
        </aside>
      </div>
    </main>
    <footer><span>ROJAS IMPRESIONES · GRAN FORMATO</span><span>Lista actualizada 02/02/2026</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
