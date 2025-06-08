import { StreamingTextResponse, type Message } from "ai"
import { groq } from "@ai-sdk/groq"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `Você é AURA, um assistente de IA avançado especializado em ajudar empresas a implementar soluções de automação com agentes de IA.

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

interface ChatRequestBody {
  messages?: { role: string; content: string }[]
}

export async function POST(req: Request) {
  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return new Response(JSON.stringify({ error: "Corpo JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "mensagens são obrigatórias" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

}
