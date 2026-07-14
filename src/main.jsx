import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { jsPDF } from 'jspdf'
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })
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
    trash: <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6M14 11v6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
const stickerSheetOptions = [
  { id: '50x50', label: '50 × 50 cm', width: 50, height: 50 },
  { id: 'super-a3', label: 'Super A3', detail: '32 × 45 cm', width: 32, height: 45 },
]

// calculador de stickers por plancha
function StickerSheetCalculator({ open, onClose }) {
  const [stickerBase, setStickerBase] = useState('')
  const [stickerHeight, setStickerHeight] = useState('')
  const [cutType, setCutType] = useState('medio')
  const [sheetType, setSheetType] = useState('50x50')

  if (!open) return null

  const sheet = stickerSheetOptions.find(option => option.id === sheetType) || stickerSheetOptions[0]
  const extraMm = cutType === 'profundo' ? 3 : 1
  const base = Math.max(Number(stickerBase) || 0, 0)
  const height = Math.max(Number(stickerHeight) || 0, 0)
  const effectiveBase = base > 0 ? base + extraMm / 10 : 0
  const effectiveHeight = height > 0 ? height + extraMm / 10 : 0
  const columns = base > 0 ? Math.floor(sheet.width / effectiveBase) : 0
  const rows = height > 0 ? Math.floor(sheet.height / effectiveHeight) : 0
  const total = columns * rows
  const usedArea = total * effectiveBase * effectiveHeight
  const utilization = total > 0 ? Math.min((usedArea / (sheet.width * sheet.height)) * 100, 100) : 0

  return <div className="sticker-modal-backdrop" onClick={onClose}>
    <section className="sticker-modal" role="dialog" aria-modal="true" aria-labelledby="sticker-calculator-title" onClick={event => event.stopPropagation()}>
      <button className="sticker-modal-close" type="button" aria-label="Cerrar calculador" onClick={onClose}>×</button>
      <div className="sticker-modal-heading">
        <span><Icon name="ruler" size={22}/></span>
        <div><small>STICKERS / ETIQUETAS</small><h2 id="sticker-calculator-title">Stickers por plancha</h2><p>Calculá cuántos stickers entran según el tamaño de plancha elegido.</p></div>
      </div>

      <div className="sticker-calculator-grid">
        <div className="sticker-controls">
          <h3>Medida del sticker</h3>
          <div className="sticker-measures">
            <label>Base <span><input type="number" min="0" step="0.1" value={stickerBase} onChange={event => setStickerBase(event.target.value)} placeholder="Ingresar"/><b>cm</b></span></label>
            <i>×</i>
            <label>Altura <span><input type="number" min="0" step="0.1" value={stickerHeight} onChange={event => setStickerHeight(event.target.value)} placeholder="Ingresar"/><b>cm</b></span></label>
          </div>

          <h3>Tamaño de plancha</h3>
          <div className="sticker-sheet-options">
            {stickerSheetOptions.map(option => (
              <button key={option.id} type="button" className={sheetType === option.id ? 'selected' : ''} onClick={() => setSheetType(option.id)}>
                <span>{option.label}</span>
                <small>{option.detail || option.label}</small>
              </button>
            ))}
          </div>

          <h3>Tipo de corte</h3>
          <div className="sticker-cut-options">
            <button type="button" className={cutType === 'medio' ? 'selected' : ''} onClick={() => setCutType('medio')}><span>Medio corte</span><small>Suma 1 mm a la base y a la altura</small></button>
            <button type="button" className={cutType === 'profundo' ? 'selected' : ''} onClick={() => setCutType('profundo')}><span>Corte profundo</span><small>Suma 3 mm a la base y a la altura</small></button>
          </div>
          <p className="sticker-effective-size">Medida utilizada para el cálculo: <b>{formatNumber(effectiveBase)} × {formatNumber(effectiveHeight)} cm</b></p>
        </div>

        <div className="sticker-result">
          <div className="sheet-badge">PLANCHA <b>{sheet.label}{sheet.detail ? ` · ${sheet.detail}` : ''}</b></div>
          {base > 0 && height > 0 ? <>
            <strong>{total}</strong>
            <span>stickers por plancha</span>
            <dl>
              <div><dt>Columnas</dt><dd>{columns}</dd></div>
              <div><dt>Filas</dt><dd>{rows}</dd></div>
              <div><dt>Aprovechamiento</dt><dd>{formatNumber(utilization)}%</dd></div>
            </dl>
            {total === 0 && <p className="sticker-alert">La medida resultante supera el tamaño de la plancha.</p>}
          </> : <div className="sticker-empty-result"><Icon name="cube" size={30}/><p>Ingresá la base y la altura para ver el resultado.</p></div>}
        </div>
      </div>
    </section>
  </div>
}

function App() {
  const [profile, setProfile] = useState('publico')
  const [selectedIds, setSelectedIds] = useState([''])
  const [search, setSearch] = useState('')
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [linearMeters, setLinearMeters] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [technology, setTechnology] = useState('eco')
  const [uvMode, setUvMode] = useState('cmyk')
  const [jobs, setJobs] = useState([])
  const [finalized, setFinalized] = useState(false)
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', cuit: '' })
  const [formErrors, setFormErrors] = useState({})
  const [stickerCalculatorOpen, setStickerCalculatorOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const selected = useMemo(() => selectedIds.map(id => materials.find(m => m.id === id)).filter(Boolean), [selectedIds])
  const hasAreaItems = selected.some(item => !item.fixed && item.billing !== 'linear')
  const hasLinearItems = selected.some(item => item.billing === 'linear')
  const categories = useMemo(() => {
    const found = materials.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(search.toLowerCase()))
    return Object.groupBy(found, m => m.category)
  }, [search])

  const technologyLabel = technology === 'eco' ? 'Ecosolvente' : uvMode === 'plus' ? 'UV CMYK + W + V' : 'UV CMYK'

  const calc = useMemo(() => {
    const w = Math.max(Number(width) || 0, 0)
    const h = Math.max(Number(height) || 0, 0)
    const ml = Math.max(Number(linearMeters) || 0, 0)
    const q = Math.max(Number(quantity) || 1, 1)
    const area = (w / 100) * (h / 100)
    const lines = selected.map(item => {
      const unitPrice = resolvePrice(item, profile, technology, uvMode)
      const billUnits = item.fixed ? 1 : item.billing === 'linear' ? ml : area
      const lineTotal = unitPrice == null ? null : Math.round(unitPrice * billUnits * q)
      const billingLabel = item.fixed ? `${q} u.` : item.billing === 'linear' ? `${formatNumber(billUnits)} ml × ${q}` : `${formatNumber(billUnits)} m² × ${q}`
      return { ...item, unitPrice, lineTotal, billUnits, billingLabel }
    })
    return {
      width: w,
      height: h,
      area,
      ml,
      q,
      technologyLabel,
      profileKey: profile,
      profileLabel: profiles[profile]?.label ?? profile,
      lines,
      total: lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0),
      unavailable: lines.filter(line => line.lineTotal == null).length,
    }
  }, [width, height, linearMeters, quantity, selected, profile, technology, uvMode, technologyLabel])

  const combinedTotal = jobs.reduce((sum, job) => sum + job.total, 0)
  const sourceJobs = jobs.length ? jobs : [{ ...calc, title: 'Trabajo 1' }]
  const quoteIsImprenta = sourceJobs.length > 0 && sourceJobs.every(job => job.profileKey === 'gremio')

  function updateCustomer(field, value) {
    setCustomer(current => ({ ...current, [field]: value }))
    setFormErrors(current => ({ ...current, [field]: '' }))
    setFinalized(false)
  }

  function validateCustomer() {
    const errors = {}
    if (!customer.name.trim()) errors.name = 'Ingresá el nombre y apellido.'
    if (!customer.phone.trim()) errors.phone = 'Ingresá el teléfono.'
    if (quoteIsImprenta && !customer.cuit.trim()) errors.cuit = 'Ingresá el CUIT para el perfil Imprenta.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  function toggleMaterial(id) {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
    setFinalized(false)
  }

  function addCurrentJob() {
    if (!selected.length) return
    const nextNumber = jobs.length + 1
    setJobs(current => [...current, {
      ...calc,
      id: crypto.randomUUID(),
      title: `Trabajo ${nextNumber}`,
      lines: calc.lines.map(line => ({ ...line })),
    }])
    setFinalized(false)
  }

  function removeJob(id) {
    setJobs(current => current.filter(job => job.id !== id))
    setFinalized(false)
  }

  function clearJobs() {
    setJobs([])
    setFinalized(false)
  }

  function finalizeQuote() {
    if (!jobs.length && !selected.length) return
    if (!validateCustomer()) return
    setFinalized(true)
  }

  function buildQuoteText() {
    const total = sourceJobs.reduce((sum, job) => sum + job.total, 0)
    const profileNames = [...new Set(sourceJobs.map(job => job.profileLabel))].join(' / ')
    const date = new Intl.DateTimeFormat('es-AR').format(new Date())
    const textLines = [
      'Rojas Impresiones · Gran Formato',
      'Presupuesto estimado',
      `Fecha: ${date}`,
      `Perfil: ${profileNames}`,
      quoteIsImprenta ? 'Condición: MÁS IVA' : null,
      '',
      'Datos del cliente:',
      `Nombre y apellido: ${customer.name.trim()}`,
      `Teléfono: ${customer.phone.trim()}`,
      customer.email.trim() ? `Email: ${customer.email.trim()}` : null,
      quoteIsImprenta ? `CUIT: ${customer.cuit.trim()}` : null,
      '',
    ].filter(Boolean)

    sourceJobs.forEach((job, index) => {
      const hasArea = job.lines.some(line => !line.fixed && line.billing !== 'linear')
      const hasLinear = job.lines.some(line => line.billing === 'linear')
      textLines.push(`Trabajo ${index + 1}`)
      textLines.push(`Perfil: ${job.profileLabel}`)
      textLines.push(`Impresión: ${job.technologyLabel}`)
      if (hasArea) textLines.push(`Medida: ${job.width} × ${job.height} cm (${formatNumber(job.area)} m²) · Cantidad: ${job.q}`)
      else textLines.push(`Cantidad: ${job.q}`)
      if (hasLinear) textLines.push(`Metros lineales: ${formatNumber(job.ml)} ml`)
      job.lines.forEach(line => {
        textLines.push(`- ${line.name}: ${line.billingLabel} · ${line.lineTotal == null ? 'Consultar' : money.format(line.lineTotal)}`)
      })
      textLines.push(`Subtotal trabajo ${index + 1}: ${money.format(job.total)}`)
      textLines.push('')
    })

    textLines.push(`TOTAL GENERAL: ${money.format(total)}${quoteIsImprenta ? ' · MÁS IVA' : ''}`)
    textLines.push('El valor es estimativo y puede variar según requisitos técnicos. Consultanos para confirmar el trabajo.')
    return textLines.join('\n')
  }

  async function copyQuoteText() {
    if (!jobs.length && !selected.length) return
    if (!validateCustomer()) return
    const text = buildQuoteText()
    try {
      await navigator.clipboard.writeText(text)
      setFinalized(true)
      setCopyStatus('Presupuesto copiado. Listo para pegar en WhatsApp o mail.')
    } catch {
      setCopyStatus('No se pudo copiar automáticamente. Probá desde un navegador actualizado.')
    }
  }

  async function logoDataUrl() {
    try {
      const response = await fetch('/logo-rojas.png')
      const blob = await response.blob()
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }


// generador de PDF

  async function generatePdf() {
    if (!validateCustomer()) return
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 16
    const contentWidth = pageWidth - margin * 2
    const total = sourceJobs.reduce((sum, job) => sum + job.total, 0)
    const profileNames = [...new Set(sourceJobs.map(job => job.profileLabel))].join(' / ')
    const date = new Intl.DateTimeFormat('es-AR').format(new Date())
    let y = 18

    const ensureSpace = needed => {
      if (y + needed <= pageHeight - 18) return
      doc.addPage()
      y = 18
    }
    const addPageNumber = () => {
      const pages = doc.getNumberOfPages()
      for (let page = 1; page <= pages; page += 1) {
        doc.setPage(page)
        doc.setDrawColor(220, 228, 225)
        doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(110, 126, 130)
        doc.text('ROJAS IMPRESIONES · GRAN FORMATO', margin, pageHeight - 8)
        doc.text(`Página ${page} de ${pages}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
      }
    }

    const logo = await logoDataUrl()
    if (logo) doc.addImage(logo, 'PNG', margin, 10, 48, 22, undefined, 'FAST')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 47, 56)
    doc.setFontSize(19)
    doc.text('PRESUPUESTO', pageWidth - margin, 17, { align: 'right' })
    doc.setFontSize(9)
    doc.setTextColor(109, 126, 130)
    doc.text(`Fecha: ${date}`, pageWidth - margin, 23, { align: 'right' })
    doc.text('Validez: 7 días', pageWidth - margin, 28, { align: 'right' })
    y = 39

    doc.setFillColor(20, 47, 56)
    doc.rect(margin, y, contentWidth, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`PERFIL: ${profileNames.toUpperCase()}`, margin + 4, y + 7.7)
    if (quoteIsImprenta) doc.text('MÁS IVA', pageWidth - margin - 4, y + 7.7, { align: 'right' })
    y += 19

    doc.setTextColor(20, 47, 56)
    doc.setFontSize(11)
    doc.text('DATOS DEL CLIENTE', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const clientLines = [
      `Nombre y apellido: ${customer.name.trim()}`,
      `Teléfono: ${customer.phone.trim()}`,
      `Email: ${customer.email.trim() || '-'}`,
      quoteIsImprenta ? `CUIT: ${customer.cuit.trim()}` : null,
    ].filter(Boolean)
    clientLines.forEach(line => { doc.text(line, margin, y); y += 5 })
    y += 4

    sourceJobs.forEach((job, index) => {
      ensureSpace(35)
      doc.setFillColor(239, 246, 244)
      doc.rect(margin, y, contentWidth, 11, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(20, 47, 56)
      doc.text(`TRABAJO ${index + 1}`, margin + 4, y + 7)
      doc.text(money.format(job.total), pageWidth - margin - 4, y + 7, { align: 'right' })
      y += 16

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(91, 110, 114)
      const hasArea = job.lines.some(line => !line.fixed && line.billing !== 'linear')
      const hasLinear = job.lines.some(line => line.billing === 'linear')
      const details = [
        `Perfil: ${job.profileLabel} · Impresión: ${job.technologyLabel}`,
        hasArea ? `Medida: ${job.width} × ${job.height} cm (${formatNumber(job.area)} m²) · Cantidad: ${job.q}` : `Cantidad: ${job.q}`,
        hasLinear ? `Metros lineales: ${formatNumber(job.ml)} ml` : null,
      ].filter(Boolean)
      details.forEach(detail => { doc.text(detail, margin, y); y += 4.5 })
      y += 2

      job.lines.forEach(line => {
        const nameLines = doc.splitTextToSize(line.name, 92)
        const rowHeight = Math.max(8, nameLines.length * 4 + 3)
        ensureSpace(rowHeight + 2)
        doc.setDrawColor(230, 235, 233)
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(32, 58, 65)
        doc.text(nameLines, margin, y + 4)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(109, 126, 130)
        doc.text(line.billingLabel, margin + 98, y + 4)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(32, 58, 65)
        doc.text(line.lineTotal == null ? 'Consultar' : money.format(line.lineTotal), pageWidth - margin, y + 4, { align: 'right' })
        y += rowHeight
      })
      y += 7
    })

    ensureSpace(28)
    doc.setFillColor(214, 37, 102)
    doc.rect(margin, y, contentWidth, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(quoteIsImprenta ? 'TOTAL GENERAL · MÁS IVA' : 'TOTAL GENERAL', margin + 5, y + 7)
    doc.setFontSize(16)
    doc.text(money.format(total), pageWidth - margin - 5, y + 12, { align: 'right' })
    y += 25
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(92, 110, 114)
    doc.text(quoteIsImprenta ? 'Precios expresados en pesos argentinos, más IVA.' : 'Precios expresados en pesos argentinos.', margin, y)
    doc.text('El valor es estimativo y puede variar según los requisitos técnicos. Consultanos para confirmar el trabajo.', margin, y + 5)
    addPageNumber()

    doc.save('Presupuesto Rojas impresiones Gran Formato.pdf')
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Rojas Impresiones"><span className="brand-logo" role="img" aria-label="Logo Rojas Impresiones"></span></a>
      <div className="top-title"><span></span> PRESUPUESTADOR GRAN FORMATO</div>
      <div className="profile-picker">
        <span>Lista de precios</span>
        <div className="profile-tabs" role="tablist" aria-label="Lista de precios">
          {Object.entries(profiles).map(([key, item]) => (
            <button key={key} type="button" className={`profile-tab-${key} ${profile === key ? 'active' : ''}`} onClick={() => { setProfile(key); setFinalized(false) }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <a className="nav-link-button" href="https://presupuestador-impresiones.vercel.app">Presupuestador impresiones</a>
    </header>

    <main>
      <section className="intro">
        <div><p className="eyebrow">OBTENÉ UNA COTIZACIÓN ESTIMADA DE TU TRABAJO EN GRAN FORMATO</p><h1>Armá tu proyecto, <em>paso a paso.</em></h1><p>Agregá cada parte al presupuesto conjunto y finalizalo cuando esté completo.</p><button className="sticker-tool-trigger" type="button" onClick={() => setStickerCalculatorOpen(true)}><Icon name="ruler" size={17}/> Calcular stickers por plancha</button></div>
        <div className="step-line" aria-label="Pasos"><span className="active">1 <b>Trabajo</b></span><i></i><span className="active">2 <b>Agregar</b></span><i></i><span className={finalized ? 'active' : ''}>3 <b>Finalizar</b></span></div>
      </section>

      <div className="workspace">
        <section className="builder">
          <div className="section-heading"><span>01</span><div><h2>Tipo de impresión</h2><p>Elegí una opción para el trabajo actual.</p></div></div>
          <div className="tech-selector">
            <button className={technology === 'eco' ? 'selected' : ''} onClick={() => { setTechnology('eco'); setFinalized(false) }}><span>ECO</span><b>Ecosolvente</b><small>Excelente calidad y durabilidad</small><i>{technology === 'eco' && <Icon name="check" size={15}/>}</i></button>
            <button className={technology === 'uv' ? 'selected uv' : ''} onClick={() => { setTechnology('uv'); setFinalized(false) }}><span>UV</span><b>Impresión UV</b><small>Elegí CMYK o CMYK + W + V</small><i>{technology === 'uv' && <Icon name="check" size={15}/>}</i></button>
          </div>
          {technology === 'uv' && <div className="uv-modes"><span>Configuración UV</span><div><button className={uvMode === 'cmyk' ? 'active' : ''} onClick={() => { setUvMode('cmyk'); setFinalized(false) }}><b>CMYK</b><small>Sin blanco ni laca</small></button><button className={uvMode === 'plus' ? 'active' : ''} onClick={() => { setUvMode('plus'); setFinalized(false) }}><b>CMYK + W + V</b><small>Blanco + varnish/laca incluidos</small></button></div></div>}

          <div className="components-heading">
            <div className="section-heading"><span>02</span><div><h2>Sumá los componentes</h2><p>Este bloque será un trabajo dentro del presupuesto conjunto.</p></div></div>
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
                {items.map(item => {
                  const active = selectedIds.includes(item.id)
                  const exactPrice = resolvePrice(item, profile, technology, uvMode)
                  const unavailable = exactPrice == null
                  const onlyPlus = technology === 'uv' && uvMode === 'cmyk' && item.prices?.[profile]?.uv == null && item.prices?.[profile]?.uvPlus != null
                  return <button key={item.id} aria-pressed={active} disabled={unavailable} className={`material-card ${active ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`} onClick={() => toggleMaterial(item.id)}>
                    <span className="material-icon"><Icon name={item.fixed || item.category === 'Materiales rígidos' ? 'cube' : 'ruler'}/></span>
                    <span className="material-copy"><b>{item.name}</b><small>{item.desc}</small><em>{unavailable ? (item.uvOnly && technology === 'eco' ? 'Sólo disponible en UV' : onlyPlus ? 'Sólo en CMYK + W + V' : 'Sin precio en esta lista') : `${money.format(exactPrice)} / ${item.unit}`}{item.uvOnly && !unavailable ? ' · Sólo UV' : ''}</em></span>
                    {item.popular && <span className="popular">Popular</span>}
                    <span className="check-box">{active ? <Icon name="check" size={14}/> : <Icon name="plus" size={13}/>}</span>
                  </button>
                })}
              </div>
            </div>)}
            {Object.keys(categories).length === 0 && <div className="empty">No encontramos componentes con “{search}”.</div>}
          </div>

          <div className="dimensions">
            <div className="section-heading"><span>03</span><div><h2>Cantidades del trabajo actual</h2><p>Cada componente usa su unidad correcta: m² real, metro lineal o unidad.</p></div></div>
            {hasAreaItems && <><h3 className="measure-title">Componentes por metro cuadrado</h3><div className="measure-row">
              <label>Ancho <span><input aria-label="Ancho en centímetros" type="number" min="0" value={width} onChange={e => { setWidth(e.target.value); setFinalized(false) }}/><b>cm</b></span></label>
              <b className="times">×</b>
              <label>Alto <span><input aria-label="Alto en centímetros" type="number" min="0" value={height} onChange={e => { setHeight(e.target.value); setFinalized(false) }}/><b>cm</b></span></label>
              <label className="qty">Cantidad <span><input aria-label="Cantidad" type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setFinalized(false) }}/><b>u.</b></span></label>
            </div>
            <div className="presets"><span>Medidas rápidas</span>{presets.map(p => <button onClick={() => { setWidth(p.w); setHeight(p.h); setFinalized(false) }} key={p.label}>{p.label} cm</button>)}</div></>}
            {hasLinearItems && <div className="linear-measure"><h3 className="measure-title">Componentes por metro lineal</h3><div><label>Metros lineales <span><input aria-label="Metros lineales" type="number" min="0" step="0.1" value={linearMeters} onChange={e => { setLinearMeters(e.target.value); setFinalized(false) }}/><b>ml</b></span></label><p>No se usa ancho × alto: sólo la cantidad de metros lineales.</p></div></div>}
            {!hasAreaItems && <label className="standalone-qty">Cantidad <span><input aria-label="Cantidad" type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setFinalized(false) }}/><b>u.</b></span></label>}
            <button className="add-job" onClick={addCurrentJob} disabled={!selected.length || calc.unavailable > 0}><Icon name="plus"/> Agregar este trabajo al presupuesto conjunto</button>
            {calc.unavailable > 0 && <p className="price-warning inline-warning">Hay ítems sin precio en esta combinación. Cambiá lista o tecnología para poder agregarlo.</p>}
          </div>
        </section>

        <aside className="quote">
          <div className="quote-head"><span><small>PRESUPUESTO CONJUNTO</small><b>{jobs.length ? `${jobs.length} trabajos agregados` : 'Trabajo actual'}</b></span><i>ARS</i></div>
          <div className="preview"><span className="preview-art"><img src="/logo-rojas.png" alt="Rojas Impresiones" /></span><div><small>{finalized ? 'PRESUPUESTO FINALIZADO' : 'BORRADOR EN ARMADO'}</small><b>{jobs.length ? `${jobs.length} ${jobs.length === 1 ? 'trabajo' : 'trabajos'} en conjunto` : `${selected.length} componentes`}</b><p>{jobs.length ? `Total parcial · ${money.format(combinedTotal)}` : `${technologyLabel}${hasAreaItems ? ` · ${width || 0} × ${height || 0} cm` : ''}${hasLinearItems ? ` · ${formatNumber(calc.ml)} ml` : ''}`}</p></div></div>

          <div className="line-items">
            {calc.lines.length ? calc.lines.map(line => <div key={line.id} className={line.lineTotal == null ? 'unpriced-line' : ''}><span><b>{line.name}</b><small>{line.billingLabel} · {line.unitPrice == null ? 'sin precio' : `${money.format(line.unitPrice)} / ${line.unit}`}</small></span><strong>{line.lineTotal == null ? 'Consultar' : money.format(line.lineTotal)}</strong></div>) : <p>Agregá componentes para calcular el total.</p>}
          </div>
          <dl className="summary compact-summary">
            <div><dt>Trabajo actual</dt><dd>{money.format(calc.total)}</dd></div>
            <div><dt>Trabajos agregados</dt><dd>{jobs.length}</dd></div>
            <div><dt>Total conjunto</dt><dd>{money.format(combinedTotal)}</dd></div>
          </dl>

          {jobs.length > 0 && <div className="nested-jobs">
            <div className="nested-head"><b>Presupuestos agregados</b><button onClick={clearJobs}>Vaciar</button></div>
            {jobs.map((job, index) => <div className="nested-job" key={job.id}>
              <span><b>Trabajo {index + 1}</b><small>{job.lines.length} componentes · {job.technologyLabel}</small></span>
              <strong>{money.format(job.total)}</strong>
              <button aria-label={`Eliminar trabajo ${index + 1}`} onClick={() => removeJob(job.id)}><Icon name="trash" size={14}/></button>
            </div>)}
          </div>}

          <div className="customer-form">
            <div className="customer-form-head"><b>Datos para el presupuesto</b><small>* Obligatorio</small></div>
            <label className={formErrors.name ? 'field-error' : ''}>Nombre y apellido *
              <input value={customer.name} onChange={e => updateCustomer('name', e.target.value)} placeholder="Nombre completo" />
              {formErrors.name && <small>{formErrors.name}</small>}
            </label>
            <label className={formErrors.phone ? 'field-error' : ''}>Teléfono *
              <input value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} placeholder="Ej. 11 1234-5678" inputMode="tel" />
              {formErrors.phone && <small>{formErrors.phone}</small>}
            </label>
            <label>Email
              <input value={customer.email} onChange={e => updateCustomer('email', e.target.value)} placeholder="nombre@email.com" type="email" />
            </label>
            {quoteIsImprenta && <label className={formErrors.cuit ? 'field-error' : ''}>CUIT *
              <input value={customer.cuit} onChange={e => updateCustomer('cuit', e.target.value)} placeholder="XX-XXXXXXXX-X" inputMode="numeric" />
              {formErrors.cuit && <small>{formErrors.cuit}</small>}
            </label>}
          </div>

          <div className="total"><span><small>{finalized ? 'TOTAL FINAL' : 'TOTAL EN ARMADO'}</small><b>{money.format(jobs.length ? combinedTotal : calc.total)}</b></span><small>{finalized ? 'Listo para enviar' : 'Agregá y finalizá'}</small></div>
          {quoteIsImprenta && <p className="vat-note">Más IVA</p>}
          <p className="validity"><Icon name="check" size={16}/> Sin mínimo automático: se calcula por medida real</p>
          <button className="primary finalize" onClick={finalizeQuote} disabled={!jobs.length && !selected.length}><Icon name="check"/> Finalizar presupuesto conjunto</button>
          <button className="primary pdf-button" onClick={generatePdf} disabled={!finalized}><Icon name="download"/> Generar presupuesto en PDF</button>
          <button className="primary copy-button" onClick={copyQuoteText} disabled={!jobs.length && !selected.length}><Icon name="copy"/> Copiar presupuesto para WhatsApp o mail</button>
          {copyStatus && <p className="copy-status">{copyStatus}</p>}
          <p className="disclaimer">El valor es estimativo y puede variar según requisitos técnicos. Consultanos para confirmar el trabajo.</p>
        </aside>
      </div>
    </main>
    <StickerSheetCalculator open={stickerCalculatorOpen} onClose={() => setStickerCalculatorOpen(false)} />
    <footer><span>ROJAS IMPRESIONES · GRAN FORMATO</span><span>Lista actualizada 20/05/2026</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
