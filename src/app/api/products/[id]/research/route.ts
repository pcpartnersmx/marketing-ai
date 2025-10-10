import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const prisma = new PrismaClient();

export async function POST(
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
    const { prompt: customPrompt } = body;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    let finalPrompt;

    // Si se proporciona un prompt personalizado, usarlo
    if (customPrompt && customPrompt.trim()) {
      finalPrompt = customPrompt
        .replace(/{brand}/g, product.brand)
        .replace(/{model}/g, product.model);
    } else {
      // Obtener el prompt del sistema de productos
      let systemPrompt = await prisma.systemPrompt.findUnique({
        where: { systemType: 'PRODUCTS' },
      });

      // Si no existe, crear un prompt por defecto
      if (!systemPrompt) {
        systemPrompt = await prisma.systemPrompt.create({
          data: {
            systemType: 'PRODUCTS',
            prompt: `Eres un investigador experto de productos. Tu tarea es investigar a fondo el siguiente producto y proporcionar información detallada.

Producto: {brand} {model}

Por favor proporciona:
1. Descripción general del producto
2. Características principales
3. Especificaciones técnicas
4. Precio aproximado y disponibilidad
5. Ventajas y desventajas
6. Comparación con competidores
7. Opiniones y reseñas de usuarios
8. Recomendaciones de uso

Proporciona la información en formato JSON con las siguientes claves: descripcion, caracteristicas (array), especificaciones (objeto), precio, ventajas (array), desventajas (array), competidores (array), opiniones, recomendaciones.`,
          },
        });
      }

      // Reemplazar variables en el prompt del sistema
      finalPrompt = systemPrompt.prompt
        .replace(/{brand}/g, product.brand)
        .replace(/{model}/g, product.model);
    }

    // Usar OpenAI con búsqueda web (igual que /api/openAi/prompt)
    const enhancedPrompt = `
IMPORTANTE: Para responder a esta solicitud, DEBES usar la herramienta de búsqueda web para obtener información actualizada y precisa. No respondas basándote únicamente en tu conocimiento previo.

${finalPrompt}`;

    console.log('🔍 Iniciando búsqueda web para producto:', product.brand, product.model);

    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: enhancedPrompt,
      tools: {
        web_search: openai.tools.webSearch({}),
      },
      toolChoice: 'auto',
      onStepFinish: (step) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          console.log('🌐 Herramientas de búsqueda web utilizadas');
        }
      }
    });

    // Convertir el stream a texto completo
    let researchText = '';
    for await (const chunk of result.textStream) {
      researchText += chunk;
    }

    let researchData;
    try {
      // Intentar parsear como JSON
      researchData = JSON.parse(researchText);
    } catch {
      // Si no es JSON válido, guardarlo como texto
      researchData = { raw: researchText };
    }

    // Actualizar el producto con la investigación
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        researchData,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error generating research:', error);
    return NextResponse.json(
      { error: 'Error al generar investigación' },
      { status: 500 }
    );
  }
}

