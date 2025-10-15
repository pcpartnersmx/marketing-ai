import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '@/lib/permissions';

const prisma = new PrismaClient();

// GET /api/projects - Obtener todos los proyectos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    interface ProjectWhereClause {
      isPublic?: boolean;
      userId?: string;
    }
    let whereClause: ProjectWhereClause = {};

    // Users with system permissions can see their own projects
    // Users without system permissions can only see public projects
    if (session.user.permissions.includes(PERMISSIONS.SYSTEM.MANAGE_SETTINGS)) {
      whereClause = {
        userId: session.user.id
      };
    } else {
      whereClause = {
        isPublic: true
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/projects - Crear un nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!session.user.permissions.includes(PERMISSIONS.SYSTEM.MANAGE_SETTINGS)) {
      return NextResponse.json({ error: 'No tienes permisos para crear proyectos' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, tags = [], availableVariables = [], responseMode = 'PROMPT' } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Nombre y descripción son requeridos' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        tags,
        availableVariables,
        responseMode,
        userId: session.user.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
