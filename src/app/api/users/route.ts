import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated and is admin
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Solo los administradores pueden crear usuarios' }, { status: 403 })
        }

        const { email, password, name, role } = await request.json()

        // Validate required fields
        if (!email || !password || !name || !role) {
            return NextResponse.json({
                error: 'Todos los campos son requeridos'
            }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                error: 'Formato de email inválido'
            }, { status: 400 })
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            }, { status: 400 })
        }

        // Validate role
        if (!Object.values(UserRole).includes(role)) {
            return NextResponse.json({
                error: 'Rol inválido'
            }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({
                error: 'Ya existe un usuario con este email'
            }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role as UserRole,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        })

        return NextResponse.json({
            message: 'Usuario creado exitosamente',
            user
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and is admin
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Solo los administradores pueden ver la lista de usuarios' }, { status: 403 })
        }

        // Get all users (excluding passwords)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        projects: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ users })

    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
