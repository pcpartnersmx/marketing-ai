import { useSession } from 'next-auth/react'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions'

export const usePermissions = () => {
  const { data: session } = useSession()
  
  const userPermissions = session?.user?.permissions || []

  return {
    permissions: userPermissions,
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),
    isAuthenticated: !!session?.user,
  }
}
