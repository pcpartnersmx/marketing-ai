'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Shield,
  Search,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Settings,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions'

interface User {
  id: string
  email: string
  name: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

type SortField = 'name' | 'email' | 'createdAt' | 'permissions'
type SortDirection = 'asc' | 'desc'

export default function ManageUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editPermissionsOpen, setEditPermissionsOpen] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [updating, setUpdating] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchUsers()
  }, [])

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

  if (!session?.user?.permissions?.includes(PERMISSIONS.USERS.VIEW)) {
    router.push('/')
    return null
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPermissions = (user: User) => {
    setSelectedUser(user)
    setSelectedPermissions([...user.permissions])
    setEditPermissionsOpen(true)
  }

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: selectedPermissions
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar permisos')
      }

      toast.success('Permisos actualizados exitosamente')
      setEditPermissionsOpen(false)
      fetchUsers() // Refresh the users list
    } catch (error) {
      console.error('Error updating permissions:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar permisos')
    } finally {
      setUpdating(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'permissions':
        aValue = a.permissions.length
        bValue = b.permissions.length
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4" /> :
      <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Administrar usuarios y permisos del sistema
            </p>
          </div>
        </div>
      </motion.div>
      {/* Search and Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-slate-200 text-slate-700">
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
              </Badge>
              {totalPages > 1 && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700">
                  Página {currentPage} de {totalPages}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-slate-500 font-medium">Cargando usuarios...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {searchQuery ? 'Intenta con otros términos de búsqueda o revisa la ortografía' : 'Los usuarios aparecerán aquí cuando se registren en el sistema'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-200">
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 select-none py-4 px-6 font-semibold text-slate-700"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Usuario
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 select-none py-4 px-6 font-semibold text-slate-700"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 select-none py-4 px-6 font-semibold text-slate-700"
                      onClick={() => handleSort('permissions')}
                    >
                      <div className="flex items-center gap-2">
                        Permisos
                        {getSortIcon('permissions')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 select-none py-4 px-6 font-semibold text-slate-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Fecha de Creación
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-center py-4 px-6 font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="text-center py-4 px-6 font-semibold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500 font-medium">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {user.permissions.length > 0 ? (
                            <>
                              {user.permissions.slice(0, 2).map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                                  {permission.split(':')[1] || permission}
                                </Badge>
                              ))}
                              {user.permissions.length > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-1 border-slate-200 text-slate-600">
                                  +{user.permissions.length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs px-2 py-1 border-slate-200 text-slate-500 bg-slate-50">
                              Sin permisos
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 px-6">
                        <Badge
                          variant={user.permissions.length > 0 ? "default" : "secondary"}
                          className={`text-xs px-3 py-1 font-medium ${user.permissions.length > 0
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          {user.permissions.length > 0 ? 'Activo' : 'Sin acceso'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4 px-6">
                        {session?.user?.permissions?.includes(PERMISSIONS.USERS.MANAGE_PERMISSIONS) && (
                          <Dialog open={editPermissionsOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            if (!open) {
                              setEditPermissionsOpen(false)
                              setSelectedUser(null)
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPermissions(user)}
                                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Shield className="h-5 w-5" />
                                  Editar Permisos - {selectedUser?.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div>
                                <div className="space-y-6 grid grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                                  {PERMISSION_GROUPS.map((group) => (
                                    <Card key={group.title}>
                                      <CardHeader className="">
                                        <div className="flex items-center gap-2">
                                          <group.icon className="h-5 w-5 text-blue-600" />
                                          <div>
                                            <h3 className="font-medium">{group.title}</h3>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="space-y-3 -mt-4">
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
                                                className="text-sm font-medium text-gray-900 cursor-pointer block"
                                              >
                                                {permission.label}
                                              </label>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {permission.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                                <div className="mt-10 flex justify-end gap-3 pt-4 border-t">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditPermissionsOpen(false)
                                      setSelectedUser(null)
                                    }}
                                    disabled={updating}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleUpdatePermissions}
                                    disabled={updating}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {updating ? 'Actualizando...' : 'Actualizar Permisos'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 font-medium">
              Mostrando <span className="font-semibold text-slate-900">{startIndex + 1}</span> a{' '}
              <span className="font-semibold text-slate-900">{Math.min(endIndex, filteredUsers.length)}</span> de{' '}
              <span className="font-semibold text-slate-900">{filteredUsers.length}</span> usuarios
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 p-0 font-medium ${currentPage === page
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 px-3 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}