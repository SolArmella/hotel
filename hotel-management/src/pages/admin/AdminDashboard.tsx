import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Habitacion, Usuario, Reserva } from '@/types'
import { Home, Users, BarChart3, Plus, Edit, Trash2, X, Save, TrendingUp, DollarSign, Calendar } from 'lucide-react'

export const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'habitaciones' | 'operadores' | 'estadisticas'>('habitaciones')
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
  const [operadores, setOperadores] = useState<Usuario[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: habData } = await supabase
        .from('habitaciones')
        .select('*')
        .order('numero')

      const { data: opData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('rol', 'operador')
        .order('nombre')

      const { data: resData } = await supabase
        .from('reservas')
        .select('*')
        .order('fecha_reserva', { ascending: false })

      setHabitaciones(habData || [])
      setOperadores(opData || [])
      setReservas(resData || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Panel de Administrador
          </h1>
          <p className="text-slate-600">Gestión completa del hotel</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('habitaciones')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'habitaciones'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="h-5 w-5" />
            Habitaciones
          </button>
          <button
            onClick={() => setActiveTab('operadores')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'operadores'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-5 w-5" />
            Operadores ({operadores.length})
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'estadisticas'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Estadísticas
          </button>
        </div>

        {/* Contenido */}
        {activeTab === 'habitaciones' && (
          <GestionHabitaciones habitaciones={habitaciones} onRecargar={cargarDatos} />
        )}
        {activeTab === 'operadores' && (
          <GestionOperadores operadores={operadores} onRecargar={cargarDatos} />
        )}
        {activeTab === 'estadisticas' && (
          <Estadisticas habitaciones={habitaciones} reservas={reservas} />
        )}
      </div>
    </div>
  )
}

// --------------------------
// 🔸 GESTIÓN DE HABITACIONES
// --------------------------
const GestionHabitaciones = ({ habitaciones, onRecargar }: { habitaciones: Habitacion[]; onRecargar: () => void }) => {
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Habitacion | null>(null)
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    precio_noche: '',
    capacidad: '',
    amenidades: '',
    descripcion: '',
    estado: 'disponible'
  })

  const resetForm = () => {
    setFormData({
      numero: '',
      tipo: '',
      precio_noche: '',
      capacidad: '',
      amenidades: '',
      descripcion: '',
      estado: 'disponible'
    })
    setEditando(null)
    setShowModal(false)
  }

  const handleEdit = (hab: Habitacion) => {
    setEditando(hab)
    setFormData({
      numero: hab.numero,
      tipo: hab.tipo,
      precio_noche: hab.precio_noche?.toString() || '',
      capacidad: hab.capacidad?.toString() || '',
      amenidades: hab.amenidades?.join(', ') || '',
      descripcion: hab.descripcion || '',
      estado: hab.estado
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dataToSave = {
      numero: formData.numero,
      tipo: formData.tipo,
      precio_noche: parseFloat(formData.precio_noche),
      capacidad: parseInt(formData.capacidad),
      amenidades: formData.amenidades.split(',').map(a => a.trim()),
      descripcion: formData.descripcion,
      estado: formData.estado
    }

    try {
      if (editando) {
        await supabase.from('habitaciones').update(dataToSave).eq('id', editando.id)
      } else {
        await supabase.from('habitaciones').insert([dataToSave])
      }

      resetForm()
      onRecargar()
    } catch (error) {
      console.error('Error guardando habitación:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta habitación?')) return
    try {
      await supabase.from('habitaciones').delete().eq('id', id)
      onRecargar()
    } catch (error) {
      console.error('Error eliminando habitación:', error)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Nueva Habitación
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map(hab => (
          <div key={hab.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">Habitación {hab.numero}</h3>
                <p className="text-sm text-slate-600">{hab.tipo}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hab.estado === 'disponible'
                    ? 'bg-green-100 text-green-700'
                    : hab.estado === 'ocupada'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {hab.estado}
              </span>
            </div>
            <div className="mb-4 space-y-1 text-sm text-slate-600">
              <p>Capacidad: {hab.capacidad} personas</p>
              <p className="font-semibold text-amber-600">${hab.precio_noche?.toLocaleString('es-ES')} / noche</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(hab)}
                className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(hab.id)}
                className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editando ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* campos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={e => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Precio por Noche</label>
                  <input
                    type="number"
                    value={formData.precio_noche}
                    onChange={e => setFormData({ ...formData, precio_noche: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Capacidad</label>
                  <input
                    type="number"
                    value={formData.capacidad}
                    onChange={e => setFormData({ ...formData, capacidad: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------
// 🔸 GESTIÓN DE OPERADORES
// --------------------------
const GestionOperadores = ({ operadores, onRecargar }: { operadores: Usuario[]; onRecargar: () => void }) => {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', nombre: '', password: '' })
  const [errores, setErrores] = useState<{ nombre?: string; email?: string; password?: string }>({})

  const validarFormulario = () => {
    const nuevosErrores: { nombre?: string; email?: string; password?: string } = {}
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/

    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre no puede estar vacío.'
    else if (!soloLetras.test(formData.nombre.trim()))
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios.'
    else if (formData.nombre.trim().length < 3)
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.'

    if (!formData.email.trim()) nuevosErrores.email = 'El email es obligatorio.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nuevosErrores.email = 'El formato del email no es válido.'

    if (!formData.password.trim()) nuevosErrores.password = 'La contraseña es obligatoria.'
    else if (formData.password.trim().length < 6)
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return
    try {
      await supabase.from('usuarios').insert([{ ...formData, rol: 'operador' }])
      setFormData({ email: '', nombre: '', password: '' })
      setShowModal(false)
      onRecargar()
    } catch (error) {
      console.error('Error creando operador:', error)
    }
  }

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/
    if (soloLetras.test(valor)) {
      setFormData({ ...formData, nombre: valor })
      setErrores({ ...errores, nombre: undefined })
    } else {
      setErrores({ ...errores, nombre: 'Solo se permiten letras y espacios.' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este operador?')) return
    try {
      await supabase.from('usuarios').delete().eq('id', id)
      onRecargar()
    } catch (error) {
      console.error('Error eliminando operador:', error)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Nuevo Operador
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operadores.map(op => (
          <div key={op.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="mb-4">
              <h3 className="font-bold text-lg">{op.nombre}</h3>
              <p className="text-sm text-slate-600">{op.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Creado: {new Date(op.fecha_creacion || '').toLocaleDateString('es-ES')}
              </p>
            </div>
            <button
              onClick={() => handleDelete(op.id)}
              className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Nuevo Operador</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={handleNombreChange}
                  className={`w-full px-4 py-2 border ${
                    errores.nombre ? 'border-red-400' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-amber-500 outline-none`}
                  placeholder="Ingrese nombre"
                  required
                />
                {errores.nombre && <p className="text-red-600 text-sm mt-1">{errores.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border ${
                    errores.email ? 'border-red-400' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-amber-500 outline-none`}
                  placeholder="admin@hotel.com"
                  required
                />
                {errores.email && <p className="text-red-600 text-sm mt-1">{errores.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border ${
                    errores.password ? 'border-red-400' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-amber-500 outline-none`}
                  placeholder="********"
                  required
                />
                {errores.password && <p className="text-red-600 text-sm mt-1">{errores.password}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------
// 🔸 ESTADÍSTICAS
// --------------------------
const Estadisticas = ({ habitaciones, reservas }: { habitaciones: Habitacion[]; reservas: Reserva[] }) => {
  const ingresosCompletadas = reservas.filter(r => r.estado === 'completada').reduce((sum, r) => sum + r.total, 0)
  const ingresosPendientes = reservas.filter(r => r.estado === 'activa').reduce((sum, r) => sum + r.total, 0)
  const tiposHabitaciones = habitaciones.reduce((acc: any, hab) => {
    acc[hab.tipo] = (acc[hab.tipo] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600">Total Habitaciones</p>
          <p className="text-3xl font-bold text-slate-900">{habitaciones.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200 bg-green-50">
          <p className="text-sm text-green-700">Disponibles</p>
          <p className="text-3xl font-bold text-green-900">
            {habitaciones.filter(h => h.estado === 'disponible').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">Reservas Activas</p>
          <p className="text-3xl font-bold text-amber-900">
            {reservas.filter(r => r.estado === 'activa').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-700">Ingresos Totales</p>
          <p className="text-2xl font-bold text-blue-900">${ingresosCompletadas.toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  )
}
