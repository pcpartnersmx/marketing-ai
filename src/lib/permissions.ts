import React from 'react'
import { 
  FiPackage, 
  FiTrendingUp, 
  FiEdit, 
  FiUsers, 
  FiSettings 
} from 'react-icons/fi'

// Definir todos los tipos de permisos del sistema
export const PERMISSIONS = {
  // Gestión de productos
  PRODUCTS: {
    VIEW: 'products:view',
    CREATE: 'products:create',
    EDIT: 'products:edit',
    DELETE: 'products:delete',
    RESEARCH: 'products:research',
    DATASHEET: 'products:datasheet',
    FINISH: 'products:finish'
  },
  // Gestión de marketing
  MARKETING: {
    VIEW: 'marketing:view',
    CREATE_CAMPAIGNS: 'marketing:create_campaigns',
    EDIT_CAMPAIGNS: 'marketing:edit_campaigns',
    DELETE_CAMPAIGNS: 'marketing:delete_campaigns'
  },
  // Gestión de blogs
  BLOGS: {
    VIEW: 'blogs:view',
    CREATE: 'blogs:create',
    EDIT: 'blogs:edit',
    DELETE: 'blogs:delete',
    PUBLISH: 'blogs:publish'
  },
  // Gestión de usuarios
  USERS: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
    MANAGE_PERMISSIONS: 'users:manage_permissions'
  },
  // Gestión del sistema
  SYSTEM: {
    VIEW_ANALYTICS: 'system:view_analytics',
    MANAGE_SETTINGS: 'system:manage_settings',
    BACKUP_RESTORE: 'system:backup_restore'
  }
} as const

// Definir el tipo para un permiso individual
export type Permission = {
  key: string;
  label: string;
  description: string;
}

// Agrupar permisos por categorías para la UI
export const PERMISSION_GROUPS: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
}[] = [
  {
    title: 'Gestión de Productos',
    description: 'Permisos relacionados con la investigación y fichas técnicas',
    icon: FiPackage,
    permissions: [
      { key: PERMISSIONS.PRODUCTS.VIEW, label: 'Ver productos', description: 'Visualizar la lista de productos' },
      { key: PERMISSIONS.PRODUCTS.CREATE, label: 'Crear productos', description: 'Agregar nuevos productos al sistema' },
      { key: PERMISSIONS.PRODUCTS.EDIT, label: 'Editar productos', description: 'Modificar información de productos existentes' },
      { key: PERMISSIONS.PRODUCTS.DELETE, label: 'Eliminar productos', description: 'Eliminar productos del sistema' },
      { key: PERMISSIONS.PRODUCTS.RESEARCH, label: 'Realizar investigación', description: 'Ejecutar investigaciones de productos' },
      { key: PERMISSIONS.PRODUCTS.DATASHEET, label: 'Generar fichas técnicas', description: 'Crear y editar fichas técnicas' },
      { key: PERMISSIONS.PRODUCTS.FINISH, label: 'Finalizar productos', description: 'Marcar productos como finalizados' }
    ]
  },
  {
    title: 'Marketing y Campañas',
    description: 'Permisos para gestionar estrategias de marketing',
    icon: FiTrendingUp,
    permissions: [
      { key: PERMISSIONS.MARKETING.VIEW, label: 'Ver marketing', description: 'Visualizar campañas y estrategias' },
      { key: PERMISSIONS.MARKETING.CREATE_CAMPAIGNS, label: 'Crear campañas', description: 'Diseñar nuevas campañas de marketing' },
      { key: PERMISSIONS.MARKETING.EDIT_CAMPAIGNS, label: 'Editar campañas', description: 'Modificar campañas existentes' },
      { key: PERMISSIONS.MARKETING.DELETE_CAMPAIGNS, label: 'Eliminar campañas', description: 'Eliminar campañas de marketing' }
    ]
  },
  {
    title: 'Gestión de Contenido',
    description: 'Permisos para crear y gestionar contenido de blogs',
    icon: FiEdit,
    permissions: [
      { key: PERMISSIONS.BLOGS.VIEW, label: 'Ver blogs', description: 'Visualizar contenido de blogs' },
      { key: PERMISSIONS.BLOGS.CREATE, label: 'Crear blogs', description: 'Escribir nuevos artículos de blog' },
      { key: PERMISSIONS.BLOGS.EDIT, label: 'Editar blogs', description: 'Modificar artículos existentes' },
      { key: PERMISSIONS.BLOGS.DELETE, label: 'Eliminar blogs', description: 'Eliminar artículos de blog' },
      { key: PERMISSIONS.BLOGS.PUBLISH, label: 'Publicar blogs', description: 'Publicar y programar artículos' }
    ]
  },
  {
    title: 'Administración de Usuarios',
    description: 'Permisos para gestionar usuarios del sistema',
    icon: FiUsers,
    permissions: [
      { key: PERMISSIONS.USERS.VIEW, label: 'Ver usuarios', description: 'Visualizar lista de usuarios' },
      { key: PERMISSIONS.USERS.CREATE, label: 'Crear usuarios', description: 'Registrar nuevos usuarios' },
      { key: PERMISSIONS.USERS.EDIT, label: 'Editar usuarios', description: 'Modificar información de usuarios' },
      { key: PERMISSIONS.USERS.DELETE, label: 'Eliminar usuarios', description: 'Eliminar usuarios del sistema' },
      { key: PERMISSIONS.USERS.MANAGE_PERMISSIONS, label: 'Gestionar permisos', description: 'Asignar y modificar permisos de usuarios' }
    ]
  },
  {
    title: 'Configuración del Sistema',
    description: 'Permisos avanzados para administración del sistema',
    icon: FiSettings,
    permissions: [
      { key: PERMISSIONS.SYSTEM.VIEW_ANALYTICS, label: 'Ver analíticas', description: 'Acceder a reportes y estadísticas' },
      { key: PERMISSIONS.SYSTEM.MANAGE_SETTINGS, label: 'Gestionar configuración', description: 'Modificar configuraciones del sistema' },
      { key: PERMISSIONS.SYSTEM.BACKUP_RESTORE, label: 'Backup y restauración', description: 'Realizar respaldos y restauraciones' }
    ]
  }
]

// Obtener todos los permisos disponibles
export const getAllPermissions = (): string[] => {
  return Object.values(PERMISSIONS).flatMap(group => Object.values(group))
}

// Verificar si un permiso es válido
export const isValidPermission = (permission: string): boolean => {
  return getAllPermissions().includes(permission)
}

// Verificar si un usuario tiene un permiso específico
export const hasPermission = (userPermissions: string[], permission: string): boolean => {
  return userPermissions.includes(permission)
}

// Verificar si un usuario tiene al menos uno de los permisos
export const hasAnyPermission = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.some(permission => userPermissions.includes(permission))
}

// Verificar si un usuario tiene todos los permisos
export const hasAllPermissions = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.every(permission => userPermissions.includes(permission))
}

// Obtener todos los permisos para un rol (para migración)
export const getPermissionsForRole = (role: string): string[] => {
  switch (role) {
    case 'ADMIN':
      return getAllPermissions()
    case 'VIEWER':
      return [
        PERMISSIONS.PRODUCTS.VIEW,
        PERMISSIONS.MARKETING.VIEW,
        PERMISSIONS.BLOGS.VIEW,
        PERMISSIONS.USERS.VIEW
      ]
    default:
      return []
  }
}
