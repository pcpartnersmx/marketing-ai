import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PERMISSIONS } from '@/lib/permissions';

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

    // Verificar permisos de investigación
    if (!session.user.permissions.includes(PERMISSIONS.PRODUCTS.RESEARCH)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar investigación de productos' },
        { status: 403 }
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
            prompt: `Eres un redactor especializado en SEO para comercio electrónico, experto en crear fichas de producto irresistibles que convierten visitas en ventas. Combinas estrategias de marketing digital con redacción persuasiva y un enfoque técnico preciso.

Vas a generar la descripción de un producto para tiendas en línea, integrando un enfoque comercial, técnico y optimizado para SEO.
Recibirás {brand} y {model} por separado.

Reglas generales
No incluyas ningún enlace, fuentes, referencias externas ni menciones a documentos.
Omite cualquier dato que no encuentres con certeza y márcalo como "Información no encontrada".

FASE 1 – Investigación del producto
Objetivo: Recabar información precisa y verificada antes de redactar.

Formato de salida Fase 1:
Información básica

Nombre completo:

Marca: {brand}

Modelo: {model}

Versión:

Categoría:

Precio aproximado:

¿Qué es y para qué sirve?

Función principal:

Usos y entornos recomendados:

Problema que resuelve:

Público objetivo

Perfil típico del comprador:

Intereses clave:

Características técnicas clave

Dimensiones:

Materiales:

Especificaciones:

Métodos de instalación:

Contenido de la caja:

Beneficios concretos

Ventajas reales frente a la competencia:

Resultados que logra:

Diferenciadores competitivos

Elementos únicos:

Razones para elegirlo:

Cómo se usa / Recomendaciones

Facilidad de instalación/configuración:

Consejos de uso:

Complementos recomendados:

Preguntas frecuentes (opcionales)

...

FASE 2 – Palabras clave
Objetivo: Seleccionar exactamente 5 palabras clave short tail y 5 long tail, con alto potencial de posicionamiento y conversión.

Palabras clave principales

Short Tail (alta competencia / alto volumen):

[Short tail #1] – [Justificación]

[Short tail #2] – [Justificación]

[Short tail #3] – [Justificación]

[Short tail #4] – [Justificación]

[Short tail #5] – [Justificación]

Long Tail (baja competencia / alta conversión):

[Long tail #1] – [Justificación]

[Long tail #2] – [Justificación]

[Long tail #3] – [Justificación]

[Long tail #4] – [Justificación]

[Long tail #5] – [Justificación]

Flujo Automático:

La Marca es {brand} y el Modelo es: {model} realiza Fase 1 completa.

Sin esperar confirmación, pasa a Fase 2 con 5 short tail + 5 long tail (justificadas).`,
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

