
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input) {
            return new Response(JSON.stringify({ error: "No se proporcionó input" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log("🔍 Iniciando búsqueda web para:", input);

        // Modificar el prompt para forzar búsqueda web
        const enhancedPrompt = `${input} 
         
         IMPORTANTE: Para responder a esta solicitud, DEBES usar la herramienta de búsqueda web para obtener información actualizada y precisa. No respondas basándote únicamente en tu conocimiento previo.
         IMPORTANTE: No utilices ningun formato de respuesta, solo responde en texto plano.
         CRÍTICO: Si el prompt tiene múltiples fases (FASE 1, FASE 2, FASE 3, etc.), DEBES completar TODAS las fases en una sola respuesta continua. NO te detengas después de la primera fase. Continúa automáticamente con todas las fases siguientes sin esperar confirmación del usuario.
         
         INSTRUCCIONES DE CONTINUIDAD:
         - Completa FASE 1, luego inmediatamente continúa con FASE 2
         - Después de FASE 2, inmediatamente continúa con FASE 3
         - No escribas "Listo, hemos completado..." o "Ahora continúo automáticamente..."
         - Simplemente continúa con la siguiente fase sin pausas ni confirmaciones
         `;

        const result = await streamText({
            model: openai('gpt-4o'),
            prompt: enhancedPrompt,
            tools: {
                web_search: openai.tools.webSearch({}),
            },
            toolChoice: 'auto',
            onStepFinish: (step) => {
                console.log(`📝 Paso completado`);
                if (step.toolCalls && step.toolCalls.length > 0) {
                    console.log("🌐 Herramientas de búsqueda web utilizadas:", step.toolCalls);
                    step.toolCalls.forEach(call => {
                        if (call.toolName === 'web_search') {
                            console.log("🔍 Búsqueda realizada:", call);
                        }
                    });
                }
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error en API de OpenAI:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
