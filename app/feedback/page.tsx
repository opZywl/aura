import Link from "next/link"

const issuesUrl = "https://github.com/opzywl/aura/issues/new/choose"

export default function FeedbackPage() {
    return (
        <main className="min-h-screen bg-black text-gray-200">
            <div className="mx-auto max-w-3xl px-4 py-16 space-y-10">
                <header className="space-y-4">
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
                        ← Voltar para o início
                    </Link>
                    <h1 className="text-3xl font-semibold text-white">Feedback oficial</h1>
                    <p className="text-sm text-gray-400">
                        Utilize o repositório público para compartilhar ideias, problemas ou sugestões de melhoria do Aura.
                    </p>
                </header>

                <section className="space-y-4 text-sm leading-relaxed text-gray-300">
                    <p>
                        A equipe acompanha as contribuições por meio das Issues do GitHub. Prefira este canal para manter o histórico do projeto e facilitar a revisão pelos orientadores.
                    </p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>Faça login no GitHub com sua conta.</li>
                        <li>Abra uma nova issue descrevendo o feedback com o máximo de detalhes.</li>
                        <li>Anexe capturas de tela ou logs que ajudem a reproduzir o cenário.</li>
                    </ol>
                    <p>
                        Mensagens enviadas por outros meios podem não ser monitoradas com a mesma frequência.
                    </p>
                </section>

                <section>
                    <a
                        href={issuesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40"
                    >
                        Abrir uma issue no GitHub
                    </a>
                </section>

                <footer className="text-xs text-gray-500">
                    Esta página não utiliza animações nem rastreadores. Última revisão: 2025.
                </footer>
            </div>
        </main>
    )
}