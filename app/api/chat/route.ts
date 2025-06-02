import { StreamingTextResponse, type Message } from "ai"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Preparar o sistema de instruções para AURA
  const systemPrompt = `Você é AURA, um assistente de IA avançado especializado em ajudar empresas a implementar soluções de automação com agentes de IA.
  
  Informações importantes:
  - Seu nome é AURA
  - Você oferece soluções de automação para empresas através de agentes de IA
  - Pode ajudar em áreas como vendas, suporte ao cliente, cobrança, agendamento e operações
  - Você é amigável, profissional e sempre oferece respostas concisas e úteis
  - Se perguntarem sobre preços ou detalhes específicos, sugira agendar uma consultoria gratuita
  - Sempre mantenha um tom futurista e tecnológico em suas respostas
  
  Quando perguntarem como podem implementar agentes de IA em sua empresa, mencione que podem:
  1. Agendar uma consultoria gratuita
  2. Testar uma demo dos agentes
  3. Entrar em contato diretamente para uma proposta personalizada
  
  Limite suas respostas a 3-4 frases para manter a conversa ágil.`

  try {
    // Verificar que tenemos la clave API
    if (!process.env.GROQ_API_KEY) {
      console.error("Error: GROQ_API_KEY não está definida")
      return new Response(JSON.stringify({ error: "Configuração de API incompleta" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Convertir los mensajes al formato esperado por la API
    const formattedMessages: Message[] = messages.map((message: any) => ({
      role: message.role,
      content: message.content,
    }))

    // Generar la respuesta usando Groq
    const response = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
      temperature: 0.7,
      maxTokens: 500,
      stream: true,
    })

    // Devolver la respuesta como un stream
    return new StreamingTextResponse(response.textStream)
  } catch (error) {
    console.error("Erro ao processar a solicitação de chat:", error)
    return new Response(JSON.stringify({ error: "Erro ao processar a solicitação" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
