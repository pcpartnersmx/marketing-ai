import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';
import { PERMISSIONS } from '@/lib/permissions';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Verificar si tiene al menos uno de los permisos de productos
        const hasProductPermission = session.user.permissions.some(permission => 
            permission === PERMISSIONS.PRODUCTS.VIEW ||
            permission === PERMISSIONS.PRODUCTS.RESEARCH ||
            permission === PERMISSIONS.PRODUCTS.DATASHEET
        );

        if (!hasProductPermission) {
            return NextResponse.json(
                { error: 'No tienes permisos para ver productos' },
                { status: 403 }
            );
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Error al obtener productos' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        if (!session.user.permissions.includes(PERMISSIONS.PRODUCTS.CREATE)) {
            return NextResponse.json(
                { error: 'No tienes permisos para crear productos' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { brand, model, icon } = body;

        if (!brand || !model) {
            return NextResponse.json(
                { error: 'Marca y modelo son requeridos' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                brand,
                model,
                icon: icon || 'Package',
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Error al crear producto' },
            { status: 500 }
        );
    }
}

