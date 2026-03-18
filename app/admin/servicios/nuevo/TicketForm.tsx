"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Monitor, AlertCircle, DollarSign, Save, Loader2, 
  Search, PlusCircle, CheckCircle2, ChevronRight, Shield, Package
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Estructura de condición física
const CONDITION_OPTIONS = ['Buena', 'Regular', 'Dañada']
const PHYSICAL_ITEMS = [
  { key: 'pantalla', label: 'Pantalla / Display' },
  { key: 'teclado', label: 'Teclado' },
  { key: 'touchpad', label: 'Touchpad / Trackpad' },
  { key: 'carcasa', label: 'Carcasa / Chasis' },
  { key: 'bateria', label: 'Batería / Autonomía' },
  { key: 'puertos', label: 'Puertos (USB, HDMI, etc.)' },
  { key: 'camaraWeb', label: 'Cámara Web' },
  { key: 'altavoces', label: 'Altavoces / Sonido' },
]
const ACCESSORIES = ['Cargador', 'Bolsa o Mochila', 'Mouse', 'Auriculares', 'Cable USB', 'Adaptador', 'Manual']

export default function TicketForm({ initialData = null, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [technicians, setTechnicians] = useState([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)

  // Buscador de clientes
  const [searchClientQuery, setSearchClientQuery] = useState('')
  const [clients, setClients] = useState([])
  const [isSearchingClients, setIsSearchingClients] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState(initialData || {
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientDocument: '',
    
    technicianId: '',
    deviceType: 'Laptop',
    deviceBrand: '',
    deviceModel: '',
    deviceProcessor: '',
    deviceRam: '',
    deviceGpu: '',
    deviceDisks: '',
    devicePowerSupply: '',
    deviceHasCharger: false,
    
    physicalCondition: {} as Record<string, string>,  // key -> 'Buena'|'Regular'|'Dañada'
    accessories: {} as Record<string, boolean>,        // 'Cargador' -> true/false
    
    issueReported: '',
    issueNotes: '',
    
    status: 'PENDING',
    totalAmount: '',
    paidAmount: '',
    paymentStatus: 'PENDING',
  })

  useEffect(() => {
    fetch('/api/tecnicos').then(res => res.json()).then(setTechnicians).catch(console.error)
  }, [])

  useEffect(() => {
    if (searchClientQuery.length >= 3) {
      setIsSearchingClients(true)
      const t = setTimeout(() => {
        fetch(`/api/clientes?q=${searchClientQuery}`)
          .then(res => res.json()).then(setClients).catch(console.error)
          .finally(() => setIsSearchingClients(false))
      }, 500)
      return () => clearTimeout(t)
    } else { setClients([]) }
  }, [searchClientQuery])

  const selectClient = (client: any) => {
    setFormData((p: any) => ({ ...p, clientId: client.id, clientName: client.name, clientPhone: client.phone || '', clientEmail: client.email || '', clientDocument: client.document || '' }))
    setSearchClientQuery('')
    setClients([])
    setErrors(e => ({ ...e, clientId: '' }))
  }

  const handleCreateClient = async () => {
    if (!formData.clientName || !formData.clientPhone) {
      toast.error("Ingresa al menos nombre y teléfono del cliente")
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.clientName, phone: formData.clientPhone, email: formData.clientEmail, document: formData.clientDocument })
      })
      if (!res.ok) throw new Error(await res.text())
      const newClient = await res.json()
      setFormData((p: any) => ({ ...p, clientId: newClient.id }))
      toast.success("✅ Cliente creado y asignado")
    } catch (e: any) {
      toast.error("Error al crear cliente: " + e.message)
    } finally { setLoading(false) }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((p: any) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const setCondition = (key: string, value: string) => {
    setFormData((p: any) => ({ ...p, physicalCondition: { ...p.physicalCondition, [key]: value } }))
  }

  const toggleAccessory = (acc: string) => {
    setFormData((p: any) => ({ ...p, accessories: { ...p.accessories, [acc]: !p.accessories[acc] } }))
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}
    if (currentStep === 1 && !formData.clientId) newErrors.clientId = 'Debes seleccionar o crear un cliente'
    if (currentStep === 2) {
      if (!formData.deviceBrand) newErrors.deviceBrand = 'La marca es obligatoria'
      if (!formData.deviceModel) newErrors.deviceModel = 'El modelo es obligatorio'
    }
    if (currentStep === 3 && !formData.issueReported) newErrors.issueReported = 'Describe el problema reportado'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 4))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return
    if (!formData.clientId) { toast.error("Debes seleccionar un cliente"); return }

    setLoading(true)
    try {
      const url = isEdit ? `/api/servicios/${initialData.id}` : '/api/servicios'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error(await res.text())
      const saved = await res.json()
      toast.success(isEdit ? "✅ Ticket actualizado" : "✅ Ticket creado exitosamente")
      router.push(`/admin/servicios/${saved.id}`)
      router.refresh()
    } catch (e: any) {
      toast.error("Error: " + e.message)
      setLoading(false)
    }
  }

  // ─── Steps Label ───────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: 'Cliente' },
    { n: 2, label: 'Equipo' },
    { n: 3, label: 'Diagnóstico' },
    { n: 4, label: 'Finalizar' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((s, idx) => (
          <div key={s.n} className="flex items-center">
            <button type="button" onClick={() => step > s.n && setStep(s.n)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                ${step === s.n ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                  step > s.n ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' :
                  'bg-gray-100 text-gray-400 cursor-default'}`}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">{s.n}</span>}
              {s.label}
            </button>
            {idx < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.n ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* ══════════════ PASO 1: CLIENTE ══════════════ */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">1. Datos del Cliente</h2>
          </div>
          <div className="p-6">
            {!formData.clientId ? (
              <div className="space-y-5">
                {/* Buscar */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar cliente existente</label>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchClientQuery} onChange={e => setSearchClientQuery(e.target.value)}
                      placeholder="Escribe nombre, teléfono o DNI..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {isSearchingClients && <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                  </div>
                  {clients.length > 0 && (
                    <div className="mt-1 border border-gray-200 rounded-lg shadow-xl bg-white z-10 absolute w-full">
                      {(clients as any[]).map((c: any) => (
                        <div key={c.id} onClick={() => selectClient(c)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{c.name} <span className="text-gray-400 font-normal text-sm">{c.document ? `(${c.document})` : ''}</span></p>
                            <p className="text-sm text-gray-500">{c.phone}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-gray-300 self-center" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">O crea un nuevo cliente rápido</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nombre Completo *</label>
                    <input type="text" name="clientName" value={formData.clientName} onChange={handleChange}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
                    <input type="text" name="clientPhone" value={formData.clientPhone} onChange={handleChange}
                      placeholder="Ej. 924076526"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">DNI / RUC (Opcional)</label>
                    <input type="text" name="clientDocument" value={formData.clientDocument} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Correo (Opcional)</label>
                    <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>
                <button type="button" onClick={handleCreateClient} disabled={loading}
                  className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  <PlusCircle className="w-4 h-4" /> Crear y Asignar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-bold text-gray-900">{formData.clientName}</p>
                    <p className="text-sm text-gray-500">{formData.clientPhone} {formData.clientDocument && `· DNI/RUC: ${formData.clientDocument}`}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFormData((p: any) => ({ ...p, clientId: '', clientName: '', clientPhone: '' }))}
                  className="text-sm text-red-500 hover:text-red-600 underline">Cambiar</button>
              </div>
            )}
            {errors.clientId && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.clientId}</p>}
          </div>
        </div>
      )}

      {/* ══════════════ PASO 2: EQUIPO ══════════════ */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Datos del equipo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">2a. Datos del Equipo</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipo</label>
                <select name="deviceType" value={formData.deviceType} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                  {['Laptop', 'PC', 'Apple', 'All-in-One', 'Servidor', 'Tablet', 'Otro'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input type="text" list="brands" name="deviceBrand" value={formData.deviceBrand} onChange={handleChange}
                  placeholder="Ej. Lenovo, HP, Dell..."
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.deviceBrand ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                <datalist id="brands"><option value="Lenovo"/><option value="HP"/><option value="Dell"/><option value="Asus"/><option value="Acer"/><option value="Apple"/><option value="MSI"/><option value="Toshiba"/><option value="Samsung"/></datalist>
                {errors.deviceBrand && <p className="text-red-500 text-xs mt-1">{errors.deviceBrand}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input type="text" name="deviceModel" value={formData.deviceModel} onChange={handleChange}
                  placeholder="Ej. ThinkPad T480, Pavilion 15..."
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.deviceModel ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                {errors.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.deviceModel}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Procesador</label>
                <input type="text" list="processors" name="deviceProcessor" value={formData.deviceProcessor} onChange={handleChange}
                  placeholder="Ej. Core i5-8250U"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                <datalist id="processors"><option value="Intel Core i3"/><option value="Intel Core i5"/><option value="Intel Core i7"/><option value="Intel Core i9"/><option value="AMD Ryzen 3"/><option value="AMD Ryzen 5"/><option value="AMD Ryzen 7"/><option value="Apple M1"/><option value="Apple M2"/><option value="Apple M3"/></datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memoria RAM</label>
                <input type="text" list="rams" name="deviceRam" value={formData.deviceRam} onChange={handleChange}
                  placeholder="Ej. 16GB DDR4"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                <datalist id="rams"><option value="4GB DDR3"/><option value="8GB DDR4"/><option value="16GB DDR4"/><option value="32GB DDR4"/><option value="16GB DDR5"/><option value="32GB DDR5"/><option value="Unified Memory (Apple)"/></datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarjeta Gráfica</label>
                <input type="text" list="gpus" name="deviceGpu" value={formData.deviceGpu} onChange={handleChange}
                  placeholder="Ej. RTX 3060 / Integrada"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                <datalist id="gpus"><option value="Gráficos Integrados"/><option value="AMD Radeon"/><option value="NVIDIA GTX 1650"/><option value="NVIDIA RTX 3050"/><option value="NVIDIA RTX 3060"/><option value="NVIDIA RTX 4060"/></datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Almacenamiento</label>
                <input type="text" list="disks" name="deviceDisks" value={formData.deviceDisks} onChange={handleChange}
                  placeholder="Ej. M.2 NVMe 512GB + HDD 1TB"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                <datalist id="disks"><option value="SSD 256GB"/><option value="SSD 512GB"/><option value="SSD 1TB"/><option value="HDD 1TB"/><option value="M.2 NVMe 512GB"/><option value="M.2 NVMe 1TB"/></datalist>
              </div>
              {formData.deviceType === 'PC' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Poder</label>
                  <input type="text" list="psus" name="devicePowerSupply" value={formData.devicePowerSupply} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  <datalist id="psus"><option value="Genérica 500W"/><option value="Genérica 600W"/><option value="Certificada 80+ Bronze 500W"/><option value="Certificada 80+ Gold 750W"/></datalist>
                </div>
              )}
            </div>
          </div>

          {/* Checklist de condición física */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">2b. Condición Física — Inspección de Ingreso</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Marca el estado de cada componente al momento de recibir el equipo:</p>
              <div className="space-y-3">
                {PHYSICAL_ITEMS.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-700 w-44">{item.label}</span>
                    <div className="flex gap-2">
                      {CONDITION_OPTIONS.map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setCondition(item.key, opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                            ${formData.physicalCondition[item.key] === opt
                              ? opt === 'Buena' ? 'bg-green-100 border-green-400 text-green-800'
                                : opt === 'Regular' ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                                : 'bg-red-100 border-red-400 text-red-800'
                              : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                          {opt}
                        </button>
                      ))}
                      <button type="button"
                        onClick={() => setCondition(item.key, '')}
                        className={`px-2 py-1.5 rounded-lg text-xs border transition-all text-gray-400 hover:bg-gray-50 ${!formData.physicalCondition[item.key] ? 'bg-gray-100 border-gray-300' : 'border-gray-200'}`}>
                        N/A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accesorios */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">2c. Accesorios Recibidos</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Marca los accesorios que entregó el cliente junto con el equipo:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ACCESSORIES.map(acc => (
                  <label key={acc}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none
                      ${formData.accessories[acc] ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="sr-only" checked={!!formData.accessories[acc]} onChange={() => toggleAccessory(acc)} />
                    <span className="text-lg">{formData.accessories[acc] ? '✅' : '⬜'}</span>
                    <span className="text-sm font-medium">{acc}</span>
                  </label>
                ))}

                {/* Toggle cargador especial */}
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none
                    ${formData.deviceHasCharger ? 'bg-green-50 border-green-300 text-green-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="sr-only" name="deviceHasCharger" checked={formData.deviceHasCharger} onChange={handleChange} />
                  <span className="text-lg">{formData.deviceHasCharger ? '✅' : '⬜'}</span>
                  <span className="text-sm font-medium">Cargador (registrado)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PASO 3: DIAGNÓSTICO ══════════════ */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">3. Problema Reportado y Diagnóstico</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problema reportado por el cliente * <span className="text-gray-400 font-normal">(describe el síntoma tal como lo expresó)</span></label>
              <textarea name="issueReported" value={formData.issueReported} onChange={handleChange} rows={4}
                placeholder="Ej. El equipo no enciende. Cuando presiona el botón de encendido, hace un sonido y se apaga inmediatamente..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.issueReported ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {errors.issueReported && <p className="text-red-500 text-xs mt-1">⚠️ {errors.issueReported}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones físicas del técnico <span className="text-gray-400 font-normal">(golpes, rayones, daños visibles en la recepción)</span></label>
              <textarea name="issueNotes" value={formData.issueNotes} onChange={handleChange} rows={3}
                placeholder="Ej. Pantalla con grieta en esquina inferior. Bisagra derecha suelta. Sin tornillo en tapa inferior..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PASO 4: ASIGNACIÓN Y PAGO ══════════════ */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">4. Asignación y Pagos</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
              <select name="technicianId" value={formData.technicianId} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                <option value="">Sin asignar</option>
                {(technicians as any[]).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Ticket</label>
              <div className="flex flex-col gap-2">
                {[
                  { v: 'PENDING', l: 'Pendiente', cls: 'orange' },
                  { v: 'IN_PROGRESS', l: 'En Proceso', cls: 'blue' },
                  { v: 'COMPLETED', l: 'Terminado', cls: 'green' },
                ].map(s => (
                  <button key={s.v} type="button" onClick={() => setFormData((p: any) => ({ ...p, status: s.v }))}
                    className={`py-2 px-3 text-sm font-bold rounded-lg border transition-all text-left
                      ${formData.status === s.v
                        ? s.cls === 'orange' ? 'bg-orange-100 border-orange-300 text-orange-800'
                          : s.cls === 'blue' ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Total ($)</label>
              <input type="number" step="0.01" name="totalAmount" value={formData.totalAmount} onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adelanto / Abono ($)</label>
              <input type="number" step="0.01" name="paidAmount" value={formData.paidAmount} onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-green-700 font-bold text-sm" />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pago</label>
              <div className="flex gap-4">
                {[['PENDING', 'Pendiente'], ['PARTIAL', 'Abono Parcial'], ['PAID', 'Pagado Total']].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paymentStatus" value={v} checked={formData.paymentStatus === v} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navegación entre pasos ─────────────────────── */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg sticky bottom-0">
        <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
          {step === 1 ? 'Cancelar' : '← Anterior'}
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          Paso {step} de {steps.length}
        </div>
        {step < 4 ? (
          <button type="button" onClick={nextStep}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm">
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 text-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Guardar Cambios' : 'Generar Ticket'}
          </button>
        )}
      </div>
    </form>
  )
}
