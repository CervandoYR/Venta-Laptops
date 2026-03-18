"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, Save, User, Laptop, Wrench, Package, FileText, Search, Plus, Trash2, Calendar, ClipboardList, AlertCircle, MapPin, Tablet, Smartphone, HardDrive, Cpu, DollarSign, Monitor, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

// ─── Physical checklists by device type ─────────────────────
const PHYSICAL_BY_TYPE: Record<string, { key: string; label: string }[]> = {
  'Laptop': [
    { key: 'pantalla',   label: '🖥️ Pantalla / Display' },
    { key: 'teclado',    label: '⌨️ Teclado' },
    { key: 'touchpad',   label: '🖱️ Touchpad' },
    { key: 'carcasa',    label: '🔲 Carcasa / Chasis' },
    { key: 'bateria',    label: '🔋 Batería' },
    { key: 'puertos',    label: '🔌 Puertos USB / HDMI' },
    { key: 'camaraWeb',  label: '📷 Cámara Web' },
    { key: 'altavoces',  label: '🔊 Altavoces' },
  ],
  'PC de Escritorio': [
    { key: 'gabinete',     label: '🖥️ Gabinete / Torre' },
    { key: 'fuente',       label: '⚡ Fuente de Poder' },
    { key: 'ventiladores', label: '💨 Ventiladores' },
    { key: 'puertos',      label: '🔌 Puertos USB / HDMI' },
    { key: 'botones',      label: '⏻ Botones Encendido/Reset' },
    { key: 'altavoces',    label: '🔊 Altavoces internos' },
  ],
  'All-in-One': [
    { key: 'pantalla',  label: '🖥️ Pantalla / Display' },
    { key: 'carcasa',   label: '🔲 Carcasa' },
    { key: 'teclado',   label: '⌨️ Teclado (si incluye)' },
    { key: 'camaraWeb', label: '📷 Cámara Web' },
    { key: 'puertos',   label: '🔌 Puertos' },
    { key: 'altavoces', label: '🔊 Altavoces' },
  ],
  'Impresora': [
    { key: 'bandeja',  label: '📄 Bandeja de papel' },
    { key: 'cabezal',  label: '🖨️ Cabezal / Cartuchos' },
    { key: 'rodillos', label: '🔄 Rodillos de arrastre' },
    { key: 'pantalla', label: '🖥️ Pantalla / Panel' },
    { key: 'puertos',  label: '🔌 Puertos / WiFi' },
    { key: 'tapa',     label: '🔲 Tapa y carcasa' },
  ],
  'Tablet': [
    { key: 'pantalla',  label: '🖥️ Pantalla táctil' },
    { key: 'carcasa',   label: '🔲 Carcasa' },
    { key: 'botones',   label: '⏻ Botones' },
    { key: 'camara',    label: '📷 Cámara' },
    { key: 'altavoces', label: '🔊 Altavoces' },
    { key: 'puertos',   label: '🔌 Puerto de carga' },
  ],
  'Smartphone': [
    { key: 'pantalla',  label: '🖥️ Pantalla táctil' },
    { key: 'carcasa',   label: '🔲 Carcasa / Marco' },
    { key: 'botones',   label: '⏻ Botones laterales' },
    { key: 'camara',    label: '📷 Cámara(s)' },
    { key: 'altavoces', label: '🔊 Altavoz / Auricular' },
    { key: 'puertos',   label: '🔌 Puerto de carga' },
  ],
}
const PHYSICAL_DEFAULT = [
  { key: 'carcasa',  label: '🔲 Carcasa' },
  { key: 'puertos',  label: '🔌 Puertos' },
  { key: 'pantalla', label: '🖥️ Pantalla / Indicadores' },
]

const BASE_ACCESSORIES = ['Cargador', 'Bolsa / Mochila', 'Mouse', 'Auriculares', 'Cable USB', 'Adaptador', 'Manual']

// ─── Hardware suggestion lists ────────────────────────────────
const BRANDS = ['HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung', 'Toshiba', 'Sony', 'Huawei', 'LG']
const CPUS = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Intel Celeron', 'Intel Pentium', 'Apple M1', 'Apple M2', 'Apple M3']
const RAMS = ['4GB DDR4', '8GB DDR4', '16GB DDR4', '32GB DDR4', '4GB DDR3', '8GB DDR3', '16GB DDR3', '2GB DDR3']
const DISKS = ['256GB SSD', '512GB SSD', '1TB SSD', '256GB NVMe', '512GB NVMe', '1TB NVMe', '500GB HDD', '1TB HDD', '2TB HDD']
const GPUS  = [
  'Gráficos Integrados (Intel)', 'Gráficos Integrados (AMD)', 'Gráficos Integrados (Apple)',
  'NVIDIA GTX 1050', 'NVIDIA GTX 1050 Ti', 'NVIDIA GTX 1060', 'NVIDIA GTX 1650', 'NVIDIA GTX 1660',
  'NVIDIA RTX 2060', 'NVIDIA RTX 3050', 'NVIDIA RTX 3060', 'NVIDIA RTX 3070', 'NVIDIA RTX 4060',
  'AMD Radeon RX 550', 'AMD Radeon RX 570', 'AMD Radeon RX 580', 'AMD Radeon RX 6600',
]
const COMMON_ISSUES = [
  'No enciende', 'Pantalla negra', 'Pantalla rota', 'Pantalla con rayas',
  'Teclado no funciona', 'Touchpad no funciona', 'Batería no carga',
  'Batería dura poco', 'Se apaga solo', 'Sobrecalentamiento',
  'Lento / se congela', 'No reconoce Wi-Fi', 'Puerto USB dañado',
  'Sonido sin audio', 'Ventilador hace ruido', 'Bisagra rota',
  'No lee disco duro', 'No arranca Windows / sistema operativo',
]

const COND_ACTIVE: Record<string, string> = {
  'Buena':   'bg-green-500 text-white border-green-500 shadow-md',
  'Regular': 'bg-yellow-500 text-white border-yellow-500 shadow-md',
  'Dañada':  'bg-red-500 text-white border-red-500 shadow-md',
}
const COND_INACTIVE = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50'

// ─── Sub-components ──────────────────────────────────────────
function Card({ icon: Icon, color, title, children }: { icon: any; color: string; title: string; children: React.ReactNode }) {
  const borders: Record<string, string> = {
    blue: 'border-blue-400 bg-blue-50', purple: 'border-purple-400 bg-purple-50',
    orange: 'border-orange-400 bg-orange-50', teal: 'border-teal-400 bg-teal-50',
    rose: 'border-rose-400 bg-rose-50', green: 'border-green-400 bg-green-50',
  }
  const icons: Record<string, string> = {
    blue: 'text-blue-600', purple: 'text-purple-600', orange: 'text-orange-600',
    teal: 'text-teal-600', rose: 'text-rose-600', green: 'text-green-600',
  }
  return (
    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className={`flex items-center gap-3 px-7 py-5 border-b-2 ${borders[color]}`}>
        <div className={`p-2.5 bg-white rounded-2xl shadow-sm ${icons[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">{title}</h2>
      </div>
      <div className="px-7 py-6 flex-1">{children}</div>
    </div>
  )
}

const inpBase = "w-full px-4 py-3.5 text-base border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300"
const inpOk  = inpBase + " border-gray-200"
const inpErr = inpBase + " border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400"

interface FldProps extends React.InputHTMLAttributes<HTMLInputElement> { err?: string }
const Inp = ({ err, ...p }: FldProps) => (
  <>
    <input {...p} className={err ? inpErr : inpOk} />
    {err && <p className="text-xs text-red-500 font-bold mt-1" data-field-error="1">⚠️ {err}</p>}
  </>
)
const Sel = ({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={inpOk + " cursor-pointer"}>{children}</select>
)
interface TxtProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { err?: string }
const Txt = ({ err, ...p }: TxtProps) => (
  <>
    <textarea {...p} rows={(p as any).rows || 4} className={(err ? inpErr : inpOk) + " resize-none"} />
    {err && <p className="text-xs text-red-500 font-bold mt-1" data-field-error="1">⚠️ {err}</p>}
  </>
)
const Lbl = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{children}</label>
)

// ─── Default form ────────────────────────────────────────────
function mkForm(d: any) {
  const s = d ?? {}
  return {
    clientId: s.clientId || '', clientName: s.clientName || '',
    clientPhone: s.clientPhone || '', clientEmail: s.clientEmail || '',
    clientDocument: s.clientDocument || '', technicianId: s.technicianId || '',
    deviceType: s.deviceType || 'Laptop', deviceBrand: s.deviceBrand || '',
    deviceModel: s.deviceModel || '', deviceProcessor: s.deviceProcessor || '',
    deviceRam: s.deviceRam || '', deviceGpu: s.deviceGpu || '',
    deviceDisks: s.deviceDisks || '',
    physicalCondition: (s.physicalCondition || {}) as Record<string, string>,
    accessories: (s.accessories || {}) as Record<string, boolean>,
    issueReported: s.issueReported || '', issueNotes: s.issueNotes || '',
    status: s.status || 'PENDING',
    totalAmount: s.totalAmount?.toString() || '',
    paidAmount: s.paidAmount?.toString() || '',
    paymentStatus: s.paymentStatus || 'PENDING',
  }
}

// ─── Main ────────────────────────────────────────────────────
export default function TicketEditForm({ initialData = null, ticketId }: { initialData?: any; ticketId?: string }) {
  const router = useRouter()
  const isEdit = !!ticketId
  const [loading, setLoading] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [clientSearch, setClientSearch] = useState(initialData?.clientName || '')
  const [showClients, setShowClients] = useState(false)
  const [customAcc, setCustomAcc] = useState('')
  const [form, setForm] = useState(() => mkForm(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/tecnicos').then(r => r.json()).then(setTechnicians).catch(() => {})
    fetch('/api/clientes').then(r => r.json()).then(setClients).catch(() => {})
  }, [])

  const filteredClients = clients.filter((c: any) =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone?.includes(clientSearch)
  ).slice(0, 8)

  const pickClient = (c: any) => {
    setClientSearch(c.name)
    setForm(f => ({ ...f, clientId: c.id, clientName: c.name, clientPhone: c.phone || '', clientEmail: c.email || '', clientDocument: c.document || '' }))
    setShowClients(false)
  }

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const clearClient = () => {
    setClientSearch('')
    setForm(f => ({ ...f, clientId: '', clientName: '', clientPhone: '', clientEmail: '', clientDocument: '' }))
  }

  const toggleCond = (e: React.MouseEvent, key: string, val: string) => {
    e.preventDefault(); e.stopPropagation()
    setForm(f => ({ ...f, physicalCondition: { ...f.physicalCondition, [key]: f.physicalCondition[key] === val ? '' : val } }))
  }

  const toggleAcc = (e: React.MouseEvent, name: string) => {
    e.preventDefault(); e.stopPropagation()
    setForm(f => ({ ...f, accessories: { ...f.accessories, [name]: !f.accessories[name] } }))
  }

  const addCustom = (e?: React.MouseEvent) => {
    e?.preventDefault()
    const t = customAcc.trim(); if (!t) return
    setForm(f => ({ ...f, accessories: { ...f.accessories, [t]: true } }))
    setCustomAcc('')
  }

  const submit = async (e?: React.MouseEvent) => {
    e?.preventDefault()

    // ── Validate fields ────────────────────────────────────────
    const err: Record<string, string> = {}
    const name = form.clientName.trim()
    const phone = form.clientPhone.trim()
    const doc = form.clientDocument.trim()

    if (!form.clientId) {
      if (!name) err.clientName = 'El nombre es obligatorio'
      else if (/[0-9]/.test(name)) err.clientName = 'El nombre no puede contener números'
      else if (/[^a-zA-Zà-ÿ\s'.\-]/.test(name)) err.clientName = 'El nombre solo debe contener letras'

      if (phone && !/^9\d{8}$/.test(phone)) err.clientPhone = 'El teléfono debe ser de 9 dígitos (ej: 926 870 309)'

      if (doc && doc.length === 8 && !/^\d{8}$/.test(doc)) err.clientDocument = 'DNI: 8 dígitos numéricos'
      if (doc && doc.length === 11 && !/^\d{11}$/.test(doc)) err.clientDocument = 'RUC: 11 dígitos numéricos'
      if (doc && doc.length !== 0 && doc.length !== 8 && doc.length !== 11) err.clientDocument = 'DNI (8 dígitos) o RUC (11 dígitos)'
    }


    if (!form.deviceBrand.trim()) err.deviceBrand = 'La marca es obligatoria'
    if (!form.deviceModel.trim()) err.deviceModel = 'El modelo es obligatorio'
    if (!form.issueReported.trim()) err.issueReported = 'Describe la falla reportada (campo obligatorio)'

    setErrors(err)
    if (Object.keys(err).length > 0) {
      // Scroll to first error
      const firstEl = document.querySelector('[data-field-error]') as HTMLElement
      firstEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error('Por favor corrige los campos marcados en rojo')
      return
    }

    setLoading(true)
    try {
      const body = {
        clientId: form.clientId || undefined,
        clientName: !form.clientId ? form.clientName : undefined,
        clientPhone: !form.clientId ? form.clientPhone : undefined,
        clientEmail: !form.clientId ? form.clientEmail : undefined,
        clientDocument: !form.clientId ? form.clientDocument : undefined,
        technicianId: form.technicianId || null,
        deviceType: form.deviceType, deviceBrand: form.deviceBrand,
        deviceModel: form.deviceModel, deviceProcessor: form.deviceProcessor,
        deviceRam: form.deviceRam, deviceGpu: form.deviceGpu, deviceDisks: form.deviceDisks,
        physicalCondition: form.physicalCondition, accessories: form.accessories,
        issueReported: form.issueReported, issueNotes: form.issueNotes,
        status: form.status, totalAmount: Number(form.totalAmount) || 0,
        paidAmount: Number(form.paidAmount) || 0, paymentStatus: form.paymentStatus,
      }
      if (isEdit) {
        const r = await fetch(`/api/servicios/${ticketId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!r.ok) throw new Error(await r.text())
        toast.success('✅ Ticket actualizado')
        router.replace(`/admin/servicios/${ticketId}`)
        router.refresh()
      } else {
        const r = await fetch('/api/servicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!r.ok) throw new Error(await r.text())
        const d = await r.json()
        toast.success('✅ Servicio creado')
        // Use replace so the "nuevo" form is NOT in the browser history
        router.replace(`/admin/servicios/${d.id}`)
      }
    } catch (err: any) {
      toast.error('❌ Error: ' + err.message)
    } finally { setLoading(false) }
  }

  const physicalItems = PHYSICAL_BY_TYPE[form.deviceType] || PHYSICAL_DEFAULT
  const allAccKeys = [...BASE_ACCESSORIES, ...Object.keys(form.accessories).filter(k => !BASE_ACCESSORIES.includes(k))]

  return (
    <div className="space-y-6">

      {/* ROW 1: Cliente */}
      <Card icon={User} color="blue" title="1. Datos del Cliente">
        {form.clientId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 relative">
            <button type="button" onClick={clearClient} className="absolute top-4 right-4 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
              Cambiar Cliente
            </button>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Cliente Seleccionado</p>
            <p className="text-lg font-black text-gray-900">{form.clientName}</p>
            {(form.clientPhone || form.clientEmail) && (
              <p className="text-sm text-gray-600 mt-1">
                {form.clientPhone && <span>📞 {form.clientPhone}</span>}
                {form.clientPhone && form.clientEmail && <span className="mx-2">•</span>}
                {form.clientEmail && <span>✉️ {form.clientEmail}</span>}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="relative mb-5" ref={searchRef}>
              <Lbl>Buscar Cliente Existente</Lbl>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Escribe para buscar... o llena los datos abajo si es nuevo"
                  className={inpOk + " pl-12"}
                  value={clientSearch}
                  onChange={e => {
                    setClientSearch(e.target.value)
                    setShowClients(true)
                    setForm(f => ({ ...f, clientName: e.target.value })) // Link search text to new client name
                  }}
                  onFocus={() => setShowClients(true)}
                />
                {showClients && clientSearch.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
                    {filteredClients.map((c: any) => (
                      <button key={c.id} type="button" onClick={() => pickClient(c)}
                        className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold flex items-center justify-center rounded-full flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-500">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="px-5 py-4 text-center text-sm text-gray-500">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mr-1">TIPS</span> 
                        No existe este cliente. Llena el formulario abajo para registrarlo rápidamente.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Crear Nuevo Cliente Rápido
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Lbl>Nombre Completo</Lbl>
                  <Inp value={form.clientName} err={errors.clientName} onChange={e => {
                      setForm(f => ({ ...f, clientName: e.target.value }))
                      setClientSearch(e.target.value)
                      setErrors(er => ({ ...er, clientName: '' }))
                  }} placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <Lbl>DNI / RUC (Opcional)</Lbl>
                  <Inp value={form.clientDocument} err={errors.clientDocument} onChange={e => { setF('clientDocument')(e); setErrors(er => ({ ...er, clientDocument: '' })) }} placeholder="DNI (8) o RUC (11)" />
                </div>
                <div>
                  <Lbl>Teléfono</Lbl>
                  <Inp value={form.clientPhone} err={errors.clientPhone} onChange={e => { setF('clientPhone')(e); setErrors(er => ({ ...er, clientPhone: '' })) }} placeholder="9XXXXXXXX (9 dígitos)" maxLength={9} />
                </div>
                <div>
                  <Lbl>Correo (Opcional)</Lbl>
                  <Inp value={form.clientEmail} onChange={setF('clientEmail')} placeholder="@" type="email" />
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ROW 2: Equipo + Checklist Físico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 2. Equipo */}
        <Card icon={Monitor} color="purple" title="2 · Equipo">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Lbl>Tipo de equipo</Lbl>
              <Sel value={form.deviceType} onChange={setF('deviceType')}>
                {['Laptop', 'PC de Escritorio', 'All-in-One', 'Tablet', 'Smartphone', 'Impresora', 'Otro'].map(t => <option key={t}>{t}</option>)}
              </Sel>
            </div>
            <div>
              <Lbl>Marca</Lbl>
              <Inp list="brand-list" value={form.deviceBrand} err={errors.deviceBrand} 
                onChange={e => { setF('deviceBrand')(e); setErrors(er => ({ ...er, deviceBrand: '' })) }} 
                placeholder="HP, Lenovo, Dell..." />
              <datalist id="brand-list">{BRANDS.map(b => <option key={b} value={b} />)}</datalist>
            </div>
            <div>
              <Lbl>Modelo</Lbl>
              <Inp value={form.deviceModel} err={errors.deviceModel}
                onChange={e => { setF('deviceModel')(e); setErrors(er => ({ ...er, deviceModel: '' })) }}
                placeholder="ThinkPad E14, Pavilion 15..." />
            </div>
            <div>
              <Lbl>CPU / Procesador</Lbl>
              <Inp list="cpu-list" value={form.deviceProcessor} onChange={setF('deviceProcessor')}
                placeholder="Intel Core i5 12va gen..." />
              <datalist id="cpu-list">{CPUS.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <Lbl>Memoria RAM</Lbl>
              <Inp list="ram-list" value={form.deviceRam} onChange={setF('deviceRam')}
                placeholder="8GB DDR4" />
              <datalist id="ram-list">{RAMS.map(r => <option key={r} value={r} />)}</datalist>
            </div>
            <div>
              <Lbl>Disco / Almacenamiento</Lbl>
              <Inp list="disk-list" value={form.deviceDisks} onChange={setF('deviceDisks')}
                placeholder="SSD 512GB..." />
              <datalist id="disk-list">{DISKS.map(d => <option key={d} value={d} />)}</datalist>
            </div>
            <div>
              <Lbl>GPU / Gráficos (Opcional)</Lbl>
              <Inp list="gpu-list" value={form.deviceGpu} onChange={setF('deviceGpu')}
                placeholder="Integrados, GTX 1650, RTX 3060..." />
              <datalist id="gpu-list">{GPUS.map(g => <option key={g} value={g} />)}</datalist>
            </div>
          </div>
        </Card>

        {/* 3. Checklist Físico */}
        <Card icon={CheckCircle2} color="orange" title="3 · Condición Física">
          <p className="text-sm text-gray-400 mb-4">Toca varias veces para cambiar la condición:</p>
          <div className="space-y-3">
            {physicalItems.map(item => {
              const cur = form.physicalCondition[item.key]
              return (
                <div key={item.key} className={`rounded-2xl border-2 p-3 transition-all ${cur ? 'border-gray-100 bg-gray-50' : 'border-dashed border-gray-200'}`}>
                  <p className="font-bold text-gray-700 text-sm mb-2">{item.label}</p>
                  <div className="flex gap-2">
                    {(['Buena', 'Regular', 'Dañada'] as const).map(c => (
                      <button key={c} type="button" onClick={e => toggleCond(e, item.key, c)}
                        className={`flex-1 py-2 px-2 rounded-xl border-2 text-sm font-black transition-all active:scale-95
                          ${cur === c ? COND_ACTIVE[c] : COND_INACTIVE}`}>
                        {c === 'Buena' ? '✅' : c === 'Regular' ? '⚠️' : '❌'} {c}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ROW 3: Accesorios + Falla */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 4. Accesorios */}
        <Card icon={Package} color="teal" title="4 · Accesorios Recibidos">
          <p className="text-sm text-gray-400 mb-4">Toca para marcar lo que dejó el cliente:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {allAccKeys.map(name => {
              const active = !!form.accessories[name]
              return (
                <button key={name} type="button" onClick={e => toggleAcc(e, name)}
                  className={`py-2.5 px-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 select-none
                    ${active ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                  {active ? '✅' : '○'} {name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <Inp value={customAcc} onChange={e => setCustomAcc(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
              placeholder="Otro accesorio (Enter o + Agregar)" />
            <button type="button" onClick={addCustom}
              className="px-5 py-3 bg-teal-100 text-teal-700 font-bold rounded-2xl hover:bg-teal-200 transition-colors whitespace-nowrap text-sm">
              + Agregar
            </button>
          </div>
        </Card>

        {/* 5. Falla */}
        <Card icon={AlertCircle} color="rose" title="5 · Falla y Diagnóstico">
          <div className="space-y-5">
            {/* Quick-tap common issues */}
            <div>
              <Lbl>Problemas reportados (toca para seleccionar)</Lbl>
              <div className="flex flex-wrap gap-2">
                {COMMON_ISSUES.map(issue => {
                  const isSelected = form.issueReported.includes(issue)
                  return (
                    <button key={issue} type="button"
                      onClick={e => {
                        e.preventDefault()
                        setForm(f => {
                          const cur = f.issueReported
                          const updated = isSelected
                            ? cur.split('\n').filter((l: string) => l.trim() !== issue).join('\n').trim()
                            : (cur.trim() ? cur.trim() + '\n' + issue : issue)
                          return { ...f, issueReported: updated }
                        })
                      }}
                      className={`py-1.5 px-3 rounded-xl border-2 text-xs font-bold transition-all active:scale-95 select-none
                        ${isSelected ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-600'}`}>
                      {isSelected ? '✓ ' : ''}{issue}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Textarea to see / edit the composed description */}
            <div>
              <Lbl>Descripción completa del problema *</Lbl>
              <Txt value={form.issueReported} onChange={setF('issueReported')} rows={4}
                placeholder="La pantalla parpadea y se apaga sola... el cliente dice que lleva así varios días..." />
            </div>

            {/* Technician's observations */}
            <div>
              <Lbl>Diagnóstico / Observaciones del Técnico</Lbl>
              <Txt value={form.issueNotes} onChange={setF('issueNotes')} rows={3}
                placeholder="Al recibir: golpe en esquina, pantalla con rayaduras leves. Diagnóstico inicial: posible placa dañada..." />
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 4: Asignación y Pagos (full width) */}
      <Card icon={DollarSign} color="green" title="6 · Asignación y Pagos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div>
            <Lbl>Técnico asignado</Lbl>
            <Sel value={form.technicianId} onChange={setF('technicianId')}>
              <option value="">Sin asignar</option>
              {technicians.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Sel>
          </div>
          <div>
            <Lbl>Estado</Lbl>
            <Sel value={form.status} onChange={setF('status')}>
              <option value="PENDING">🟠 Pendiente</option>
              <option value="IN_PROGRESS">🔵 En Proceso</option>
              <option value="COMPLETED">🟢 Terminado</option>
              <option value="DELIVERED">⚫ Entregado</option>
              <option value="CANCELLED">🔴 Cancelado</option>
            </Sel>
          </div>
          <div>
            <Lbl>Presupuesto (S/)</Lbl>
            <Inp type="number" step="0.01" value={form.totalAmount} onChange={setF('totalAmount')} placeholder="0.00" />
          </div>
          <div>
            <Lbl>Abonado (S/)</Lbl>
            <Inp type="number" step="0.01" value={form.paidAmount} onChange={setF('paidAmount')} placeholder="0.00" />
          </div>
        </div>
        <div>
          <Lbl>Estado del pago</Lbl>
          <div className="flex gap-3">
            {[['PENDING', '⏳ Pendiente'], ['PARTIAL', '💵 Abono'], ['PAID', '✅ Pagado']].map(([v, l]) => (
              <button key={v} type="button"
                onClick={e => { e.preventDefault(); setForm(f => ({ ...f, paymentStatus: v })) }}
                className={`flex-1 py-3.5 text-base font-black rounded-2xl border-2 transition-all active:scale-95
                  ${form.paymentStatus === v ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tracking Link (Only when editing) */}
      {isEdit && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">🔗 Link de seguimiento público</p>
          <p className="text-sm text-blue-700 font-mono break-all selectivity-text">
            {typeof window !== "undefined" ? `${window.location.origin}/seguimiento/${ticketId}` : `/seguimiento/${ticketId}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Comparte este link con el cliente para que vea el estado de su equipo.</p>
        </div>
      )}

      {/* Buttons */}
      <div className="sticky bottom-4 z-20 flex gap-4 pt-4 mt-6 border-t border-gray-100 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl">
        <Link 
          href={isEdit ? `/admin/servicios/${ticketId}` : "/admin/servicios"}
          className="px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors text-center shadow-sm whitespace-nowrap"
        >
          Cancelar
        </Link>
        <button type="button" onClick={submit} disabled={loading}
          className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {isEdit ? 'Actualizar Orden' : 'Generar Orden'}
        </button>
      </div>

    </div>
  )
}
