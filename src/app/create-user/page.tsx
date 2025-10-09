'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle, XCircle, User, Mail, Lock, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRole } from '@prisma/client'

export default function CreateUserPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string, password?: string, name?: string, role?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean, password?: boolean, name?: boolean, role?: boolean }>({})
  const formRef = useRef<HTMLFormElement>(null)

    // Redirect if not authenticated or not admin
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        router.push('/login')
        return null
    }

    if (session?.user?.role !== 'ADMIN') {
        router.push('/')
        return null
    }

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors }

        if (name === 'email') {
            if (!value) {
                newErrors.email = 'El email es requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors.email = 'Formato de email inválido'
            } else {
                delete newErrors.email
            }
        }

        if (name === 'password') {
            if (!value) {
                newErrors.password = 'La contraseña es requerida'
            } else if (value.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
            } else {
                delete newErrors.password
            }
        }

        if (name === 'name') {
            if (!value) {
                newErrors.name = 'El nombre es requerido'
            } else if (value.length < 2) {
                newErrors.name = 'El nombre debe tener al menos 2 caracteres'
            } else {
                delete newErrors.name
            }
        }

        if (name === 'role') {
            if (!value) {
                newErrors.role = 'El rol es requerido'
            } else {
                delete newErrors.role
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
    }

    const handleSelectChange = (value: string) => {
        setTouched(prev => ({ ...prev, role: true }))
        validateField('role', value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string
        const role = formData.get('role') as string

        // Validate all fields
        const emailValid = validateField('email', email)
        const passwordValid = validateField('password', password)
        const nameValid = validateField('name', name)
        const roleValid = validateField('role', role)

        if (!emailValid || !passwordValid || !nameValid || !roleValid) {
            setTouched({ email: true, password: true, name: true, role: true })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role: role as UserRole,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear el usuario')
            }

      toast.success('Usuario creado exitosamente', {
        description: `El usuario ${email} ha sido creado correctamente.`,
        duration: 5000,
        className: 'toast-success',
        style: {
          background: '#fff',
          color: '#000',
        },
      })

      // Reset form
      if (formRef.current) {
        formRef.current.reset()
      }
      setTouched({})
      setErrors({})

        } catch (error) {
            console.error('Error creating user:', error)
      toast.error('Error al crear el usuario', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
        duration: 4000,
        className: 'toast-error',
        style: {
          background: '#fff',
          color: '#000',
        },
      })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="px-4 lg:px-6 h-full flex flex-col">
            {/* Modern Header */}
            <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sidebar-accent rounded-lg">
                            <UserPlus className="w-5 h-5 text-sidebar-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-sidebar-foreground">Crear Usuario</h1>
                            <p className="text-sm text-muted-foreground">Agregar un nuevo usuario al sistema</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 min-h-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm"
                >
                    <div className="p-6 h-full">
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-black">Información del Usuario</h2>
                                    <p className="text-gray-600 text-sm">Completa los datos para crear un nuevo usuario</p>
                                </div>
                            </div>
                            
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Nombre completo
                                            <span className="text-red-500 text-xs">(requerido)</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.name && touched.name
                                                        ? 'border-red-500 bg-red-50' 
                                                        : 'border-gray-300 hover:border-gray-400 group-focus-within:border-blue-500'
                                                }`}
                                                placeholder="Juan Pérez"
                                                aria-invalid={!!(errors.name && touched.name)}
                                            />
                                            {!errors.name && touched.name && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {errors.name && touched.name && (
                                                <motion.div
                                                    className="flex items-center gap-2 mt-2 text-sm text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {errors.name}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Email Field */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            Correo electrónico
                                            <span className="text-red-500 text-xs">(requerido)</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.email && touched.email
                                                        ? 'border-red-500 bg-red-50' 
                                                        : 'border-gray-300 hover:border-gray-400 group-focus-within:border-blue-500'
                                                }`}
                                                placeholder="usuario@ejemplo.com"
                                                aria-invalid={!!(errors.email && touched.email)}
                                            />
                                            {!errors.email && touched.email && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {errors.email && touched.email && (
                                                <motion.div
                                                    className="flex items-center gap-2 mt-2 text-sm text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {errors.email}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Password Field */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 text-blue-500" />
                                            Contraseña
                                            <span className="text-red-500 text-xs">(requerido)</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                                                    errors.password && touched.password
                                                        ? 'border-red-500 bg-red-50' 
                                                        : 'border-gray-300 hover:border-gray-400 group-focus-within:border-blue-500'
                                                }`}
                                                placeholder="••••••••"
                                                aria-invalid={!!(errors.password && touched.password)}
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={showPassword ? 'hide' : 'show'}
                                                        initial={{ rotate: -90, opacity: 0 }}
                                                        animate={{ rotate: 0, opacity: 1 }}
                                                        exit={{ rotate: 90, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </motion.button>
                                            {!errors.password && touched.password && (
                                                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {errors.password && touched.password && (
                                                <motion.div
                                                    className="flex items-center gap-2 mt-2 text-sm text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {errors.password}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Role Field */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            Rol
                                            <span className="text-red-500 text-xs">(requerido)</span>
                                        </label>
                                        <div className="relative">
                                            <Select name="role" onValueChange={handleSelectChange}>
                                                <SelectTrigger className={`w-full px-4 py-3 bg-white border rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.role && touched.role
                                                        ? 'border-red-500 bg-red-50' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                                    <SelectValue placeholder="Seleccionar rol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VIEWER">Viewer - Solo lectura</SelectItem>
                                                    <SelectItem value="ADMIN">Admin - Acceso completo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {!errors.role && touched.role && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {errors.role && touched.role && (
                                                <motion.div
                                                    className="flex items-center gap-2 mt-2 text-sm text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {errors.role}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="pt-6">
                                    <div className="flex justify-end gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            disabled={isLoading}
                                            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <motion.div
                                                    className="flex items-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <motion.div
                                                        className="w-4 h-4 border-2 border-sidebar-accent-foreground/30 border-t-sidebar-accent-foreground rounded-full mr-2"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Creando usuario...
                                                </motion.div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4" />
                                                    Crear Usuario
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
