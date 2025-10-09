import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {  
    const { prompt } = await request.json();

    console.log("es es el prompt", prompt)

    console.log("se esta generando la respuesta con IA")
    
    return NextResponse.json({ 
        message: "Endpoint temporalmente deshabilitado" 
    }, { 
        status: 200 
    });
}


// export async function POST(request: NextRequest) {
//     try {
//         const session = await getServerSession(authOptions);

//         if (!session?.user?.id) {
//             return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
//         }

//         const { prompt } = await request.json();

//         if (!prompt) {
//             return NextResponse.json({ error: "No se proporcionó el prompt" }, {
//                 status: 400,
//                 headers: { "Content-Type": "application/json" },
//             });
//         }

//         const completion = await openai.chat.completions.create({
//             model: "gpt-4o-search-preview", // Modelo con soporte web search
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//             max_tokens: 7000,
//             temperature: 0.7,
//             web_search_options: { search_context_size: "medium" },
//             // stream: true,
//         });


//         // const response = await openai.responses.create({
//         //     model: "gpt-5",
//         //     reasoning: { effort: "low" },
//         //     tools: [
//         //         {
//         //             type: "web_search",
//         //         },
//         //     ],
//         //     tool_choice: "auto",
//         //     input: prompt,
//         // });


//         const aiResponse = completion.choices[0].message.content || 'No se pudo generar una respuesta';

//         return NextResponse.json({
//             aiResponse
//         }, {
//             status: 200,
//             headers: { "Content-Type": "application/json" },
//         });
//     } catch (error) {
//         console.error("Error en API de OpenAI:", error);
//         return NextResponse.json(
//             { error: "Error interno del servidor" },
//             {
//                 status: 500,
//                 headers: { "Content-Type": "application/json" },
//             }
//         );
//     }
// }
