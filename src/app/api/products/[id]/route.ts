import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PERMISSIONS } from '@/lib/permissions';

const prisma = new PrismaClient();

export async function GET(
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

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!session.user.permissions.includes(PERMISSIONS.PRODUCTS.DELETE)) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar productos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const { brand, model, icon, finished } = body;

    // Verificar permisos según el tipo de actualización
    const hasEditPermission = session.user.permissions.includes(PERMISSIONS.PRODUCTS.EDIT);
    const hasFinishPermission = session.user.permissions.includes(PERMISSIONS.PRODUCTS.FINISH);
    
    // Si se está actualizando el campo 'finished', permitir con permiso FINISH
    if (finished !== undefined && !hasFinishPermission && !hasEditPermission) {
      return NextResponse.json(
        { error: 'No tienes permisos para finalizar productos' },
        { status: 403 }
      );
    }
    
    // Para otros campos, requerir permiso EDIT
    if (finished === undefined && !hasEditPermission) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar productos' },
        { status: 403 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(brand && { brand }),
        ...(model && { model }),
        ...(icon && { icon }),
        ...(finished !== undefined && { finished }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

