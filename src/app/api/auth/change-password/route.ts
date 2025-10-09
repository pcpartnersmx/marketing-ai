import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// PUT /api/auth/change-password - Cambiar contraseña del usuario
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validar que se proporcionen ambas contraseñas
        if (!currentPassword || !newPassword) {
            return NextResponse.json({
                error: 'Contraseña actual y nueva contraseña son requeridas'
            }, { status: 400 });
        }

        // Validar longitud de la nueva contraseña
        if (newPassword.length < 6) {
            return NextResponse.json({
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            }, { status: 400 });
        }

        // Obtener el usuario actual
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar que la contraseña actual sea correcta
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return NextResponse.json({
                error: 'La contraseña actual es incorrecta'
            }, { status: 400 });
        }

        // Verificar que la nueva contraseña sea diferente a la actual
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json({
                error: 'La nueva contraseña debe ser diferente a la contraseña actual'
            }, { status: 400 });
        }

        // Hash de la nueva contraseña
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar la contraseña en la base de datos
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedNewPassword,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}
