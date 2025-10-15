import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { PERMISSIONS, isValidPermission } from '@/lib/permissions'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user has permission to manage user permissions
    if (!session.user.permissions.includes(PERMISSIONS.USERS.MANAGE_PERMISSIONS)) {
      return NextResponse.json({ 
        error: 'No tienes permisos para gestionar permisos de usuarios' 
      }, { status: 403 })
    }

    const userId = params.id
    const { permissions } = await request.json()

    // Validate permissions
    if (!Array.isArray(permissions)) {
      return NextResponse.json({
        error: 'Los permisos deben ser un array'
      }, { status: 400 })
    }

    // Validate each permission
    const invalidPermissions = permissions.filter(permission => !isValidPermission(permission))
    if (invalidPermissions.length > 0) {
      return NextResponse.json({
        error: `Permisos inválidos: ${invalidPermissions.join(', ')}`
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!existingUser) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Prevent user from modifying their own permissions
    if (session.user.id === userId) {
      return NextResponse.json({
        error: 'No puedes modificar tus propios permisos'
      }, { status: 403 })
    }

    // Update user permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: permissions
      },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Permisos actualizados exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user permissions:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user has permission to view users
    if (!session.user.permissions.includes(PERMISSIONS.USERS.VIEW)) {
      return NextResponse.json({ 
        error: 'No tienes permisos para ver usuarios' 
      }, { status: 403 })
    }

    const userId = params.id

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user has permission to delete users
    if (!session.user.permissions.includes(PERMISSIONS.USERS.DELETE)) {
      return NextResponse.json({ 
        error: 'No tienes permisos para eliminar usuarios' 
      }, { status: 403 })
    }

    const userId = params.id

    // Prevent user from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json({
        error: 'No puedes eliminar tu propia cuenta'
      }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!existingUser) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
