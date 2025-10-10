import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const prisma = new PrismaClient();

const DATASHEET_SYSTEM_PROMPT = `Objetivo: Redactar la ficha de producto final siguiendo la estructura obligatoria y usando las palabras clave (marcadas en negritas).

IMPORTANTE: Debes devolver la ficha técnica en formato HTML válido usando las siguientes etiquetas:
- h1 para el título principal
- h2 para los títulos de secciones principales
- h3 para subtítulos
- p para párrafos de texto
- strong para texto en negrita (palabras clave)
- em para texto en cursiva
- ul y li para listas con viñetas
- ol y li para listas numeradas
- NO uses markdown (asteriscos, hashtags, etc.), SOLO HTML

Reglas generales
No incluyas enlaces, fuentes, referencias externas ni menciones a documentos en ninguna parte de la ficha de producto final.

**Reglas de uso de palabras clave**
1. Las short tail deben aparecer prioritariamente en el título, descripción resumida, subtítulos y primeros párrafos de las secciones.
2. Las long tail deben integrarse de forma natural en el cuerpo de la descripción detallada, secciones de beneficios, FAQs y casos de uso.
3. Cada short tail debe aparecer al menos una vez en el texto completo, y cada long tail al menos una vez en la sección donde tenga más sentido.
4. Evitar la sobreoptimización (keyword stuffing): no repetir más de 2 veces seguidas una misma keyword.
5. Usar variaciones naturales cuando sea posible (plural/singular, sinónimos, etc.) para mantener fluidez.

**Reglas especial para uso del [modelo del producto]**
1. El [modelo del producto] se mencionará únicamente:
2. En el título (una sola vez, normalmente al final). En la primera frase de la descripción detallada, después del nombre del producto.
3. En especificaciones técnicas.
4. No se repetirá en beneficios, ventajas, secciones de contenido únicas, FAQs o conclusión, salvo que sea necesario para claridad.

ESTRUCTURA DE LA FICHA (en HTML):

Título principal (h1): Título optimizado para SEO que incluya el nombre del producto, categoría, función y una palabra clave relevante

Sección 1 - Descripción resumida:
- Título (h2): Subtítulo llamativo
- Párrafo (p): Descripción breve y concisa del producto. Usar strong para keywords importantes.

Sección 2 - Contenido único 1:
- Título (h2): Título llamativo personalizado
- Párrafo (p): Contenido centrado en palabras clave relevantes con strong

Sección 3 - Características y Beneficios:
- Título (h2): Características y Beneficios
- Párrafo (p): Descripción amplia (mínimo 1000 palabras total)
- Subtítulo (h3): Características Principales
- Lista (ul con li): Lista de características con strong en keywords
- Subtítulo (h3): Beneficios del Producto
- Párrafo (p): Descripción de beneficios
- Subtítulo (h3): Diferenciadores
- Párrafo (p): Qué hace único al producto

Sección 4 - Contenido único 2:
- Título (h2): Título llamativo personalizado
- Párrafo (p): Contenido adicional con strong en keywords

Sección 5 - Cómo se usa:
- Título (h2): ¿Cómo se usa?
- Párrafo (p): Recomendaciones de uso e instalación

Sección 6 - Preguntas Frecuentes:
- Título (h2): Preguntas Frecuentes
- Para cada pregunta (total 10):
  - Subtítulo (h3): Pregunta
  - Párrafo (p): Respuesta

Sección 7 - Contenido único 3:
- Título (h2): Título llamativo personalizado
- Párrafo (p): Contenido final con strong en keywords

Sección 8 - Uso Ideal:
- Título (h2): Uso Ideal
- Párrafo (p): Perfil del comprador ideal

Sección 9 - Conclusión:
- Título (h2): Conclusión
- Párrafo (p): Resumen y puntos destacados

Sección 10 - Call to Action:
- Título (h2): Contáctanos
- Párrafo (p): Invitación a contactar para más información`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener el producto con su investigación
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    if (!product.researchData) {
      return NextResponse.json(
        { error: 'El producto no tiene datos de investigación' },
        { status: 400 }
      );
    }

    // Preparar el prompt con los datos del producto
    const userPrompt = `${DATASHEET_SYSTEM_PROMPT}

Genera una ficha técnica completa para el siguiente producto usando la información de investigación disponible:

Producto: ${product.brand} ${product.model}

Datos de investigación:
${JSON.stringify(product.researchData, null, 2)}

IMPORTANTE: 
- Tu respuesta debe ser ÚNICAMENTE el código HTML de la ficha técnica
- NO incluyas backticks ni ningún otro marcador de código
- Empieza directamente con la etiqueta h1 del título
- Usa SOLO las etiquetas HTML mencionadas: h1, h2, h3, p, strong, em, ul, ol, li
- Cada sección debe estar claramente estructurada con las etiquetas apropiadas
- Las palabras clave importantes deben estar en strong

Por favor, genera la ficha técnica siguiendo estrictamente la estructura y reglas proporcionadas.`;

    // Llamar a OpenAI usando Vercel AI SDK
    const result = await generateText({
      model: openai('gpt-4o'),
      prompt: userPrompt,
    });

    let datasheetContent = result.text;

    // Limpiar el contenido: eliminar marcadores de código si los hubiera
    datasheetContent = datasheetContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Guardar la ficha técnica en la base de datos
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        datasheetContent,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      datasheet: datasheetContent,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error generating datasheet:', error);
    return NextResponse.json(
      { error: 'Error al generar la ficha técnica' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el contenido de la ficha técnica
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        datasheetContent: content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating datasheet:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la ficha técnica' },
      { status: 500 }
    );
  }
}

