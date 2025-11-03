import Link from "next/link"

const commitments = [
    "Não coletamos nem armazenamos dados pessoais dos visitantes do site institucional.",
    "Os registros operacionais do chatbot utilizados em demonstrações locais permanecem sob controle da oficina responsável.",
    "Qualquer integração com bancos de dados, como PostgreSQL, deve seguir as normas da empresa que implanta o Aura.",
    "Logs gerados pelo protótipo acadêmico destinam-se exclusivamente a testes e podem ser apagados a qualquer momento.",
]

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-gray-200">
            <div className="mx-auto max-w-4xl px-4 py-16 space-y-10">
                <header className="space-y-4">
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
                        ← Voltar para o início
                    </Link>
                    <h1 className="text-3xl font-semibold text-white">Política de Privacidade</h1>
                    <p className="text-sm text-gray-400">
                        Transparência inspirada no artigo acadêmico: o Aura é um projeto open source para oficinas mecânicas.
                    </p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Compromissos essenciais</h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-300">
                        {commitments.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-white">Uso de dados em ambientes reais</h2>
                    <p className="text-sm leading-relaxed text-gray-300">
                        Ao implantar o Aura em produção, recomenda-se configurar políticas internas de retenção, backup e descarte de dados.
                        A equipe responsável deve informar aos clientes como as conversas são monitoradas e armazenadas.
                    </p>
                    <p className="text-sm leading-relaxed text-gray-300">
                        Em consonância com a orientação acadêmica, a responsabilidade pelo tratamento de dados pertence à oficina que opera o sistema.
                    </p>
                </section>

                <footer className="text-xs text-gray-500">
                    Última revisão: 2025. Em caso de dúvidas, consulte o repositório público ou a orientadora do projeto.
                </footer>
            </div>
        </main>
    )
}
