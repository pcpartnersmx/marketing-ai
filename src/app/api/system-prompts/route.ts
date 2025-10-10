import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, SystemType } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

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

    const { searchParams } = new URL(request.url);
    const systemType = searchParams.get('systemType');

    if (systemType) {
      const systemPrompt = await prisma.systemPrompt.findUnique({
        where: { systemType: systemType as SystemType },
      });

      return NextResponse.json(systemPrompt);
    }

    const systemPrompts = await prisma.systemPrompt.findMany();
    return NextResponse.json(systemPrompts);
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json(
      { error: 'Error al obtener prompts del sistema' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { systemType, prompt } = body;

    if (!systemType || !prompt) {
      return NextResponse.json(
        { error: 'systemType y prompt son requeridos' },
        { status: 400 }
      );
    }

    const systemPrompt = await prisma.systemPrompt.upsert({
      where: { systemType },
      update: { prompt },
      create: { systemType, prompt },
    });

    return NextResponse.json(systemPrompt);
  } catch (error) {
    console.error('Error creating/updating system prompt:', error);
    return NextResponse.json(
      { error: 'Error al crear/actualizar prompt del sistema' },
      { status: 500 }
    );
  }
}

