'use client'

// import { signup } from './actions' // Disabled: Registration not allowed
import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect, use } from 'react'
import { Eye, EyeOff, Mail, LogIn, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; success?: string; 'auto-login'?: string }>
}) {
    const { data: session, status } = useSession()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    // Registration disabled - removed isCreatingAccount and activeTab states
    const [errors, setErrors] = useState<{email?: string, password?: string}>({})
    const [touched, setTouched] = useState<{email?: boolean, password?: boolean}>({})
    // Registration disabled - removed passwordStrength state
    const router = useRouter()
    // Unwrap searchParams using React.use()
    const params = use(searchParams)

    useEffect(()=>{
        if(status === 'authenticated'){
            router.push('/')
        }
    },[status])



    // Mostrar notificaciones basadas en searchParams
    useEffect(() => {
        // Registration disabled - removed account creation success handling
        if (params.error === 'login-failed') {
            toast.error('Error al iniciar sesión', {
                description: 'Verifica tus credenciales e inténtalo de nuevo.',
                duration: 4000,
            })
        }
        // Registration disabled - removed signup error handling
    }, [params])

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
            
            // Registration disabled - removed password strength calculation
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
    }

    const handleSubmit = async (formData: FormData) => {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        
        // Validar todos los campos
        const emailValid = validateField('email', email)
        const passwordValid = validateField('password', password)
        
        if (!emailValid || !passwordValid) {
            setTouched({ email: true, password: true })
            return
        }
        
            setIsLoading(true)
        setErrors({})
        
        try {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                })
                
                if (result?.error) {
                    setErrors({ email: 'Credenciales inválidas. Inténtalo de nuevo.' })
                } else {
                    window.location.href = '/'
            }
        } catch (error) {
            console.error('Error during authentication:', error)
            setErrors({ email: 'Error de autenticación. Inténtalo de nuevo.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex relative">
            {/* Registration disabled - removed loading overlay */}

            {/* Mobile Back Button */}
            <div className="lg:hidden absolute top-4 left-4 z-20">
                <motion.button
                    onClick={() => window.history.back()}
                    className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Left Section - Image and Testimonial */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/bg.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/10 to-transparent" />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-32 left-16 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
                    {/* Logo */}
                    <motion.div 
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Image
                            src="/logo.webp"
                            alt="Prompt Generator Logo"
                            width={150}
                            height={100}
                            className="object-contain"
                            priority
                        />
                        {/* <span className="text-2xl font-bold text-white">Prompt Generator</span> */}
                    </motion.div>
                    
                    {/* Testimonial */}
                    <motion.div 
                        className="max-w-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        
                        <blockquote className="text-2xl font-bold leading-tight mb-6 text-slate-900">
                            &quot;Genera prompts de IA profesionales y efectivos para cualquier tarea o proyecto.&quot;
                        </blockquote>
                        <div className="space-y-1">
                            <p className="text-lg font-medium text-slate-900">Prompt Generator</p>
                            <p className="text-sm text-slate-700">Herramienta de generación de prompts inteligentes</p>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Right Section - Login Form */}
            <div className="flex-1 lg:w-2/5 flex items-center justify-center p-8 bg-white relative">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
                <div className="lg:hidden absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
                <motion.div 
                    className="w-full max-w-md relative z-10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.h1 
                            className="text-3xl font-bold text-slate-900 mb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            Bienvenido de vuelta
                        </motion.h1>
                    </div>
                    
                    {/* Error Messages - Only for login */}
                    <AnimatePresence>
                        {params.error === 'login-failed' && (
                            <motion.div 
                                className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <div className="flex items-start">
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-red-800">
                                        <p className="font-medium">Error al iniciar sesión</p>
                                        <p className="mt-1">Verifica tus credenciales e inténtalo de nuevo.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Registration disabled - removed tab navigation */}

                    {/* Login Form Only */}
                    <motion.form 
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                            Correo electrónico
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            onChange={handleInputChange}
                                            className={`h-12 rounded-lg border-2 transition-all duration-200 ${
                                                errors.email && touched.email 
                                                    ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                    : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                            }`}
                                            placeholder="tu@email.com"
                                            aria-invalid={!!(errors.email && touched.email)}
                                        />
                                        <AnimatePresence>
                                            {errors.email && touched.email && (
                                                <motion.p 
                                                    className="text-sm text-red-600 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                            Contraseña
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                onChange={handleInputChange}
                                                className={`h-12 rounded-lg border-2 transition-all duration-200 ${
                                                    errors.password && touched.password 
                                                        ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                        : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                                }`}
                                                placeholder="••••••••"
                                                aria-invalid={!!(errors.password && touched.password)}
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                                        </div>
                                        <AnimatePresence>
                                            {errors.password && touched.password && (
                                                <motion.p 
                                                    className="text-sm text-red-600 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                    {errors.password}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="remember" className="text-sm text-slate-600">
                                            Recordar datos de inicio de sesión
                                        </label>
                                    </div>
                                    {/* <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        ¿Olvidaste tu contraseña?
                                    </a> */}
                                </div>

                                <Button
                                    formAction={(formData) => handleSubmit(formData)}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <motion.div 
                                            className="flex items-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <motion.div 
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Iniciando sesión...
                                        </motion.div>
                                    ) : (
                                        'Iniciar sesión'
                                    )}
                                </Button>
                            </motion.form>
                    {/* Registration disabled - removed signup form */}

                    {/* Registration disabled - removed signup/login toggle */}
                </motion.div>
            </div>
        </div>
    )
}