'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle, XCircle, User, Mail, Lock, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSIONS, PERMISSION_GROUPS, Permission } from '@/lib/permissions'

export default function CreateUserPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string, password?: string, name?: string }>({})
    const [touched, setTouched] = useState<{ email?: boolean, password?: boolean, name?: boolean }>({})
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
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

    if (!session?.user?.permissions?.includes(PERMISSIONS.USERS.CREATE)) {
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


        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
    }


    const handlePermissionToggle = (permissionKey: string) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionKey)) {
                return prev.filter(p => p !== permissionKey)
            } else {
                return [...prev, permissionKey]
            }
        })
    }

    const handleSelectAllInGroup = (groupPermissions: Permission[]) => {
        const allSelected = groupPermissions.every(permission => selectedPermissions.includes(permission.key))

        if (allSelected) {
            // Deseleccionar todos los permisos del grupo
            setSelectedPermissions(prev => prev.filter(p => !groupPermissions.some(gp => gp.key === p)))
        } else {
            // Seleccionar todos los permisos del grupo
            setSelectedPermissions(prev => {
                const newPermissions = [...prev]
                groupPermissions.forEach(permission => {
                    if (!newPermissions.includes(permission.key)) {
                        newPermissions.push(permission.key)
                    }
                })
                return newPermissions
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        // Validate all fields
        const emailValid = validateField('email', email)
        const passwordValid = validateField('password', password)
        const nameValid = validateField('name', name)

        if (!emailValid || !passwordValid || !nameValid) {
            setTouched({ email: true, password: true, name: true })
            return
        }

        // Validate permissions
        if (selectedPermissions.length === 0) {
            toast.error('Debe seleccionar al menos un permiso')
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
                    permissions: selectedPermissions,
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
            setSelectedPermissions([])

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
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name && touched.name
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
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email && touched.email
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
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${errors.password && touched.password
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

                                </div>

                                {/* Permissions Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                                            <Shield className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-black">Permisos Personalizados</h3>
                                            <p className="text-gray-600 text-sm">Selecciona los permisos específicos para este usuario</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {PERMISSION_GROUPS.map((group, groupIndex) => (
                                            <Card key={groupIndex} className="border border-gray-200 hover:border-blue-300 transition-colors">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{group.icon}</span>
                                                            <div>
                                                                <CardTitle className="text-base font-medium text-black">
                                                                    {group.title}
                                                                </CardTitle>
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {group.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSelectAllInGroup(group.permissions)}
                                                            className="text-xs h-7 px-2"
                                                        >
                                                            {group.permissions.every(p => selectedPermissions.includes(p.key)) ? 'Deseleccionar' : 'Seleccionar todos'}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {group.permissions.map((permission) => (
                                                        <div key={permission.key} className="flex items-start gap-3">
                                                            <Checkbox
                                                                id={permission.key}
                                                                checked={selectedPermissions.includes(permission.key)}
                                                                onCheckedChange={() => handlePermissionToggle(permission.key)}
                                                                className="mt-0.5"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <label
                                                                    htmlFor={permission.key}
                                                                    className="text-sm font-medium text-black cursor-pointer block"
                                                                >
                                                                    {permission.label}
                                                                </label>
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {permission.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Permission Summary */}
                                    {selectedPermissions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800">
                                                    Permisos seleccionados ({selectedPermissions.length})
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPermissions.map((permission) => {
                                                    const permissionInfo = PERMISSION_GROUPS
                                                        .flatMap(group => group.permissions)
                                                        .find(p => p.key === permission)
                                                    return (
                                                        <span
                                                            key={permission}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                                                        >
                                                            {permissionInfo?.label || permission}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
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
