import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { prompt } = await request.json();

        const product = await prisma.product.update({
            where: { id },
            data: { customPrompt: prompt },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el prompt' },
            { status: 500 }
        );
    }
}

