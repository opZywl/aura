"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Download, Settings, Bot, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  id: string
  scenario: string
  input: string
  expectedOutput: string
  actualOutput: string
  status: "passed" | "failed" | "running" | "pending"
  executionTime: number
  timestamp: Date
}

const mockTestResults: TestResult[] = [
  {
    id: "1",
    scenario: "Consulta sobre vendas",
    input: "Como vocês podem ajudar a melhorar nossas vendas?",
    expectedOutput: "Posso ajudá-lo com automação de vendas através de qualificação de leads, follow-up automático...",
    actualOutput:
      "Posso ajudá-lo com automação de vendas através de qualificação de leads, follow-up automático e análise de conversões.",
    status: "passed",
    executionTime: 1.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    scenario: "Pergunta sobre preços",
    input: "Qual é o preço dos seus serviços?",
    expectedOutput: "Nossos preços são flexíveis e baseados no uso...",
    actualOutput: "Nossos preços são flexíveis e baseados no uso. Oferecemos planos desde R$ 299/mês.",
    status: "passed",
    executionTime: 0.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: "3",
    scenario: "Questão técnica complexa",
    input: "Como integrar com nosso CRM Salesforce?",
    expectedOutput: "Para integração com Salesforce, oferecemos conectores nativos...",
    actualOutput: "Sim, podemos ajudar com isso.",
    status: "failed",
    executionTime: 2.1,
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  },
]

export default function Teste() {
  const [activeTab, setActiveTab] = useState('interactive')
  const [testResults, setTestResults] = useState<TestResult[]>(mockTestResults)
  const [isRunning, setIsRunning] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('aura-v1')
  const [testScenario, setTestScenario] = useState('')
  const [expectedOutput, setExpectedOutput] = useState('')
  const { toast } = useToast()

  const runInteractiveTest = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem para testar.",
        variant: "destructive"
      })
      return
    }

    setIsRunning(true)
    
    try {
      // Simulate API call to AURA
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock response generation
      const mockResponse = generateMockResponse(userInput)
      
      toast({
        title: "Teste executado com sucesso",
        description: "Resposta gerada pelo modelo AURA."
      })

      // Add to results if this was part of a test scenario
      if (testScenario && expectedOutput) {
        const newResult: TestResult = {
          id: Date.now().toString(),
          scenario: testScenario,
          input: userInput,
          expectedOutput: expectedOutput,
          actualOutput: mockResponse,
          status: mockResponse.toLowerCase().includes(expectedOutput.toLowerCase().split(' ')[0]) ? 'passed' : 'failed',
          executionTime: 1.5,
          timestamp: new Date()
        }
        
        setTestResults(prev => [newResult, ...prev])
        setTestScenario('')
        setExpectedOutput('')
      }
      
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao executar o teste. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  const generateMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('vendas') || lowerInput.includes('venda')) {
      return 'Posso ajudá-lo com automação de vendas através de qualificação de leads, follow-up automático e análise de conversões. Nossos agentes podem identificar prospects qualificados e nutrir leads automaticamente.'
    }
    
    if (lowerInput.includes('preço') || lowerInput.includes('custo') || lowerInput.includes('valor')) {
      return 'Nossos preços são flexíveis e baseados no uso. Oferecemos planos desde R$ 299/mês para pequenas empresas até soluções enterprise personalizadas. Gostaria de agendar uma demonstração para discutirmos suas necessidades específicas?'
    }
    
    if (lowerInput.includes('suporte') || lowerInput.includes('atendimento')) {
      return 'Nossos agentes de IA podem revolucionar seu suporte ao cliente com atendimento 24/7, respostas instantâneas e escalação inteligente para humanos quando necessário. Isso resulta em maior satisfação do cliente e redução de custos operacionais.'
    }
    
    if (lowerInput.includes('integração') || lowerInput.includes('crm') || lowerInput.includes('sistema')) {
      return 'Oferecemos integrações nativas com os principais CRMs como Salesforce, HubSpot e Pipedrive. Nossos conectores permitem sincronização bidirecional de dados e automação de fluxos de trabalho sem necessidade de desenvolvimento técnico.'
    }
    
    return 'Entendo sua questão. Como especialista em agentes de IA para empresas, posso ajudá-lo a implementar soluções personalizadas que automatizam processos e aumentam a eficiência operacional. Que área específica da sua empresa gostaria de automatizar?'
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Reset all tests to pending
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const })))
    
    // Run tests sequentially
    for (let i = 0; i < testResults.length; i++) {
      setTestResults(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' as const } : test
      ))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate test result
      const passed = Math.random() > 0.3 // 70% pass rate
      setTestResults(prev => prev.map((test, index) => 
        index === i ? { 
          ...test, 
          status: passed ? 'passed' as const : 'failed' as const,
          executionTime: Math.random() * 3 + 0.5
        } : test
      ))
    }
    
    setIsRunning(false)
    toast({
      title: "Testes concluídos",
      description: "Todos os testes foram executados."
    })
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500">Passou</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      case 'running':
        return <Badge className="bg-blue-500">Executando</Badge>
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const passedTests = testResults.filter(t => t.status === 'passed').length
  const failedTests = testResults.filter(t => t.status === 'failed').length
  const passRate = testResults.length > 0 ? (passedTests / testResults.length * 100).toFixed(1) : '0'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste do AURA</h1>
          <p className="text-muted-foreground">
            Teste e valide as respostas do assistente de IA
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Resultados
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testes Executados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de cenários testados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passRate}%</div>
            <p className="text-xs text-muted-foreground">
              {passedTests} de {testResults.length} testes passaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testResults.length > 0 
                ? (testResults.reduce((sum, test) => sum + test.executionTime, 0) / testResults.length).toFixed(1)
                : '0'
              }s
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo Ativo</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AURA v1</div>
            <p className="text-xs text-muted-foreground">
              Modelo em produção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactive">Teste Interativo</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários de Teste</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="interactive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Teste Interativo
                </CardTitle>
                <CardDescription>
                  Digite uma mensagem para testar a resposta do AURA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aura-v1">AURA v1.0 (Produção)</SelectItem>
                      <SelectItem value="aura-v2">AURA v2.0 (Beta)</SelectItem>
                      <SelectItem value="aura-lite">AURA Lite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input">Mensagem de Teste</Label>
                  <Textarea
                    id="input"
                    placeholder="Digite sua mensagem aqui..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario">Cenário (Opcional)</Label>
                  <Input
                    id="scenario"
                    placeholder="Ex: Consulta sobre preços"
                    value={testScenario}
                    onChange={(e) => setTestScenario(e.target.value)}
                  />\
