'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FiUser,
    FiShield,
    FiCalendar,
    FiEdit3,
    FiSave,
    FiX,
    FiLogOut,
    FiKey,
    FiGlobe,
    FiLock,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function AccountPage() {
    const { data: session, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSave = async () => {
        try {
            // Aquí podrías implementar la lógica para actualizar el perfil
            await update({ name: formData.name });
            setIsEditing(false);
            toast.success('Perfil actualizado exitosamente');
        } catch (error) {
            toast.error('Error al actualizar el perfil');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: session?.user?.name || '',
            email: session?.user?.email || '',
        });
        setIsEditing(false);
    };

    const handleLogout = async () => {
        try {
            await signOut({ callbackUrl: '/login' });
            toast.success('Sesión cerrada exitosamente');
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    const handleChangePassword = async () => {
        // Validaciones
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Todos los campos son requeridos');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            toast.error('La nueva contraseña debe ser diferente a la actual');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al cambiar contraseña');
            }

            toast.success('Contraseña cambiada exitosamente');
            setShowPasswordDialog(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al cambiar contraseña');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancelPasswordChange = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordDialog(false);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'EDITOR':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'VIEWER':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <FiShield className="w-4 h-4" />;
            case 'EDITOR':
                return <FiEdit3 className="w-4 h-4" />;
            case 'VIEWER':
                return <FiGlobe className="w-4 h-4" />;
            default:
                return <FiUser className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-sidebar-accent rounded-xl">
                        <FiUser className="w-6 h-6 text-sidebar-accent-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-sidebar-foreground">Mi Cuenta</h1>
                        <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Información Personal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiUser className="w-5 h-5" />
                                        Información Personal
                                    </CardTitle>
                                    <CardDescription>
                                        Tu información de perfil y datos de contacto
                                    </CardDescription>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <FiEdit3 className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled
                                            className="mt-1 bg-muted"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            El email no se puede cambiar
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSave}
                                            size="sm"
                                            className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground"
                                        >
                                            <FiSave className="w-4 h-4 mr-2" />
                                            Guardar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                        >
                                            <FiX className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                                        <p className="text-lg font-medium">{session?.user?.name || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <p className="text-lg font-medium">{session?.user?.email}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Información de Cuenta */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiShield className="w-5 h-5" />
                                Información de Cuenta
                            </CardTitle>
                            <CardDescription>
                                Detalles de tu cuenta y permisos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
                                <div className="mt-2">
                                    <Badge className={`${getRoleBadgeColor(session?.user?.role || '')} flex items-center gap-1 w-fit`}>
                                        {getRoleIcon(session?.user?.role || '')}
                                        {session?.user?.role || 'USER'}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                                <p className="text-lg font-medium flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4" />
                                    {new Date().toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Estado de la Cuenta</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">Activa</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Acciones de Cuenta */}
                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiKey className="w-5 h-5" />
                                Acciones de Cuenta
                            </CardTitle>
                            <CardDescription>
                                Gestiona tu sesión y configuración de seguridad
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <FiLogOut className="w-4 h-4 mr-2" />
                                    Cerrar Sesión
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordDialog(true)}
                                    className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <FiLock className="w-4 h-4 mr-2" />
                                    Cambiar Contraseña
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                * Para cambiar tu contraseña, haz clic en el botón de arriba
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Dialog de Confirmación de Logout */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FiLogOut className="w-5 h-5 text-red-600" />
                            Confirmar Cierre de Sesión
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a la aplicación.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="w-full sm:w-auto"
                        >
                            <FiLogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Cambio de Contraseña */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FiLock className="w-5 h-5 text-blue-600" />
                            Cambiar Contraseña
                        </DialogTitle>
                        <DialogDescription>
                            Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <FiEyeOff className="h-4 w-4" />
                                    ) : (
                                        <FiEye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <FiEyeOff className="h-4 w-4" />
                                    ) : (
                                        <FiEye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Mínimo 6 caracteres
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff className="h-4 w-4" />
                                    ) : (
                                        <FiEye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancelPasswordChange}
                            className="w-full sm:w-auto"
                            disabled={isChangingPassword}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            className="w-full sm:w-auto bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-sidebar-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                    Cambiando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" />
                                    Cambiar Contraseña
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}