import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient, Prisma } from '@prisma/client';
import { PERMISSIONS } from '@/lib/permissions';

const prisma = new PrismaClient();

// GET /api/projects/[id] - Obtener un proyecto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Actualizar un proyecto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!session.user.permissions.includes(PERMISSIONS.SYSTEM.MANAGE_SETTINGS)) {
      return NextResponse.json({ error: 'No tienes permisos para editar proyectos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      tags, 
      availableVariables, 
      template,
      isPublic,
      responseMode
    } = body;

    // Verificar que el proyecto existe y pertenece al usuario
    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const updateData: Prisma.ProjectUpdateInput = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (availableVariables !== undefined) updateData.availableVariables = availableVariables;
    if (template !== undefined) updateData.template = template;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (responseMode !== undefined) updateData.responseMode = responseMode;

    const project = await prisma.project.update({
      where: {
        id: id
      },
      data: updateData
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Eliminar un proyecto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!session.user.permissions.includes(PERMISSIONS.SYSTEM.MANAGE_SETTINGS)) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar proyectos' }, { status: 403 });
    }

    const { id } = await params;

    // Verificar que el proyecto existe y pertenece al usuario
    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    await prisma.project.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
