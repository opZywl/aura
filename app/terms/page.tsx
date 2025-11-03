import Link from "next/link"

const sections = [
    {
        title: "1. Termos Gerais",
        body: [
            "Ao acessar a plataforma Aura você concorda em utilizar o sistema conforme as leis vigentes e a política acadêmica do projeto.",
            "O conteúdo apresentado tem caráter educacional e demonstra o protótipo descrito no artigo \"Chatbot inteligente para oficinas mecânicas\".",
        ],
    },
    {
        title: "2. Uso do Software",
        body: [
            "O Aura é distribuído como software livre para fins de estudo e pesquisa. Não oferecemos garantias comerciais nem suporte dedicado.",
            "Toda interação deve respeitar boas práticas de segurança e privacidade dos dados administrados pela oficina usuária.",
        ],
    },
    {
        title: "3. Limitações de Responsabilidade",
        body: [
            "Os autores não se responsabilizam por danos diretos ou indiretos decorrentes do uso do sistema em ambientes produtivos.",
            "Recomenda-se testar a solução em ambiente controlado antes de sua adoção comercial.",
        ],
    },
    {
        title: "4. Atualizações",
        body: [
            "O código fonte pode receber melhorias contínuas conforme novas pesquisas dos estudantes e orientadora.",
            "Mudanças relevantes serão documentadas no repositório oficial no GitHub.",
        ],
    },
]

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-gray-200">
            <div className="mx-auto max-w-4xl px-4 py-16 space-y-10">
                <header className="space-y-4">
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
                        ← Voltar para o início
                    </Link>
                    <h1 className="text-3xl font-semibold text-white">Termos de Uso do Aura</h1>
                    <p className="text-sm text-gray-400">
                        Documento acadêmico alinhado ao projeto descrito no artigo sobre automação de oficinas mecânicas.
                    </p>
                </header>

                <div className="space-y-8">
                    {sections.map((section) => (
                        <section key={section.title} className="space-y-3 border-b border-white/10 pb-6">
                            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                            {section.body.map((paragraph, index) => (
                                <p key={index} className="text-sm leading-relaxed text-gray-300">
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}
                </div>

                <footer className="text-xs text-gray-500">
                    Última revisão: alinhada à versão do artigo disponibilizada em 2025.
                </footer>
            </div>
        </main>
    )
}