'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Check, 
  ArrowLeft,
  CreditCard,
  Shield,
  Clock,
  Users,
  Building2,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// Tipos de planos
type PlanType = 'free' | 'basic' | 'professional' | 'enterprise'

interface Plan {
  id: PlanType
  name: string
  price: number
  period: string
  description: string
  features: string[]
  limits: {
    books: number | 'unlimited'
    companies: number | 'unlimited'
    users: number | 'unlimited'
  }
  popular?: boolean
}

const plans: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'sempre',
    description: 'Para começar e testar',
    features: [
      'Até 50 livros',
      '1 empresa',
      'Até 5 usuários',
      'Relatórios básicos',
      'Suporte comunidade'
    ],
    limits: {
      books: 50,
      companies: 1,
      users: 5
    }
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    price: 99,
    period: 'mês',
    description: 'Para pequenas bibliotecas',
    features: [
      'Até 500 livros',
      '1 empresa',
      'Até 50 usuários',
      'Relatórios avançados',
      'Suporte por email'
    ],
    limits: {
      books: 500,
      companies: 1,
      users: 50
    }
  },
  professional: {
    id: 'professional',
    name: 'Profissional',
    price: 249,
    period: 'mês',
    description: 'Para bibliotecas em crescimento',
    features: [
      'Até 2.000 livros',
      'Até 3 empresas',
      'Usuários ilimitados',
      'Relatórios avançados',
      'Integração N8N',
      'Suporte prioritário'
    ],
    limits: {
      books: 2000,
      companies: 3,
      users: 'unlimited'
    },
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Personalizado
    period: 'personalizado',
    description: 'Para grandes organizações',
    features: [
      'Livros ilimitados',
      'Empresas ilimitadas',
      'Usuários ilimitados',
      'Customizações',
      'SLA garantido',
      'Suporte 24/7'
    ],
    limits: {
      books: 'unlimited',
      companies: 'unlimited',
      users: 'unlimited'
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = (searchParams.get('plan') as PlanType) || 'basic'
  
  const [loading, setLoading] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cnpjStatus, setCnpjStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle')
  const [cnpjMessage, setCnpjMessage] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepStatus, setCepStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [cepMessage, setCepMessage] = useState('')
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf')
  const [autoConsultaCNPJ, setAutoConsultaCNPJ] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    companyName: '',
    fantasyName: '',
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: ''
    }
  })

  const selectedPlan = plans[planId]

  // Redirect para plano free
  useEffect(() => {
    if (planId === 'free') {
      router.push('/login?plan=free')
      return
    }
    
    if (planId === 'enterprise') {
      // Redirecionar para contato de vendas
      window.open('mailto:vendas@bibliotech.com?subject=Interesse no Plano Enterprise', '_blank')
      router.push('/landing')
      return
    }
  }, [planId, router])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Para CNPJ, fazer consulta automática quando completar 14 dígitos
    if (field === 'document' && documentType === 'cnpj') {
      const cleanValue = value.replace(/\D/g, '')
      
      // Reset status quando documento muda
      setCnpjStatus('idle')
      setCnpjMessage('')
      
      // Consulta automática quando CNPJ estiver completo
      if (cleanValue.length === 14 && autoConsultaCNPJ) {
        setTimeout(() => {
          consultarCNPJAutomatico(cleanValue)
        }, 500) // Delay para evitar múltiplas consultas
      }
    }

    // Para CEP, fazer consulta automática quando completar 8 dígitos
    if (field === 'address.zipCode') {
      const cleanValue = value.replace(/\D/g, '')
      
      // Reset status quando CEP muda
      setCepStatus('idle')
      setCepMessage('')
      
      // Consulta automática quando CEP estiver completo
      if (cleanValue.length === 8) {
        setTimeout(() => {
          consultarCEPAutomatico(cleanValue)
        }, 500) // Delay para evitar múltiplas consultas
      }
    }
  }

  const handleDocumentTypeChange = (type: 'cpf' | 'cnpj') => {
    setDocumentType(type)
    setFormData(prev => ({ ...prev, document: '' }))
    setCnpjStatus('idle')
    setCnpjMessage('')
    
    // Ativar consulta automática para CNPJ
    if (type === 'cnpj') {
      setAutoConsultaCNPJ(true)
    } else {
      setAutoConsultaCNPJ(false)
    }
  }

  const formatDocument = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    
    if (cleanValue.length <= 11) {
      // Formato CPF: 000.000.000-00
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
  }

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    // Formato CEP: 00000-000
    return cleanValue
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value)
    handleInputChange('document', formatted)
  }

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value)
    handleInputChange('address.zipCode', formatted)
  }

  const consultarCNPJAutomatico = async (cnpj: string) => {
    if (cnpjLoading) return // Evitar múltiplas consultas simultâneas
    
    setCnpjLoading(true)
    setCnpjStatus('idle')
    setCnpjMessage('Consultando CNPJ...')

    try {
      const response = await fetch(`/api/cnpj/${cnpj}`)
      const result = await response.json()

      if (result.success) {
        // Preencher dados automaticamente
        setFormData(prev => ({
          ...prev,
          companyName: result.data.companyName || prev.companyName,
          fantasyName: result.data.fantasyName || prev.fantasyName,
          email: result.data.email || prev.email,
          phone: result.data.phone || prev.phone,
          address: {
            zipCode: result.data.address.zipCode || prev.address.zipCode,
            street: result.data.address.street || prev.address.street,
            number: result.data.address.number || prev.address.number,
            complement: result.data.address.complement || prev.address.complement,
            district: result.data.address.district || prev.address.district,
            city: result.data.address.city || prev.address.city,
            state: result.data.address.state || prev.address.state
          }
        }))

        if (result.warning) {
          setCnpjStatus('warning')
          setCnpjMessage(`Dados preenchidos. Atenção: ${result.error}`)
        } else {
          setCnpjStatus('success')
          setCnpjMessage('✅ Dados da empresa preenchidos automaticamente!')
        }
      } else {
        setCnpjStatus('error')
        setCnpjMessage(result.error || 'CNPJ não encontrado')
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      setCnpjStatus('error')
      setCnpjMessage('Erro ao consultar CNPJ')
    } finally {
      setCnpjLoading(false)
    }
  }

  const consultarCNPJ = async () => {
    const cleanCnpj = formData.document.replace(/\D/g, '')
    
    if (cleanCnpj.length !== 14) {
      setCnpjStatus('error')
      setCnpjMessage('CNPJ deve ter 14 dígitos')
      return
    }

    await consultarCNPJAutomatico(cleanCnpj)
  }

  const consultarCEPAutomatico = async (cep: string) => {
    if (cepLoading) return // Evitar múltiplas consultas simultâneas
    
    setCepLoading(true)
    setCepStatus('idle')
    setCepMessage('Consultando CEP...')

    try {
      const response = await fetch(`/api/cep/${cep}`)
      const result = await response.json()

      if (result.success) {
        // Preencher apenas campos vazios do endereço
        setFormData(prev => ({
          ...prev,
          address: {
            zipCode: result.data.address.zipCode || prev.address.zipCode,
            street: result.data.address.street || prev.address.street,
            number: prev.address.number, // Não sobrescrever número
            complement: result.data.address.complement || prev.address.complement,
            district: result.data.address.district || prev.address.district,
            city: result.data.address.city || prev.address.city,
            state: result.data.address.state || prev.address.state
          }
        }))

        setCepStatus('success')
        setCepMessage('✅ Endereço preenchido automaticamente!')
      } else {
        setCepStatus('error')
        setCepMessage(result.error || 'CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error)
      setCepStatus('error')
      setCepMessage('Erro ao consultar CEP')
    } finally {
      setCepLoading(false)
    }
  }

  const consultarCEP = async () => {
    const cleanCep = formData.address.zipCode.replace(/\D/g, '')
    
    if (cleanCep.length !== 8) {
      setCepStatus('error')
      setCepMessage('CEP deve ter 8 dígitos')
      return
    }

    await consultarCEPAutomatico(cleanCep)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Criar assinatura no Asaas
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan.id,
          customer: formData
        })
      })

      const result = await response.json()

      if (result.success) {
        // Redirecionar para página de pagamento do Asaas
        window.location.href = result.paymentUrl
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (planId === 'free' || planId === 'enterprise') {
    return null // Componente será redirecionado
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BiblioTech</span>
            </Link>
            
            <Link href="/landing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/landing" className="hover:text-blue-600">Planos</Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Finalizar Assinatura
                </h1>
                <p className="text-gray-600">
                  Complete seus dados para ativar o plano {selectedPlan.name}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Dados Pessoais
                    </CardTitle>
                    <CardDescription>
                      Escolha o tipo de cadastro e preencha seus dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Seleção de Tipo de Documento */}
                    <div>
                      <Label className="text-base font-semibold">Tipo de Cadastro *</Label>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => handleDocumentTypeChange('cpf')}
                          className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                            documentType === 'cpf'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <Users className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-semibold">Pessoa Física</div>
                            <div className="text-sm text-gray-600">CPF</div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDocumentTypeChange('cnpj')}
                          className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                            documentType === 'cnpj'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <Building2 className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-semibold">Pessoa Jurídica</div>
                            <div className="text-sm text-gray-600">CNPJ</div>
                          </div>
                        </button>
                      </div>
                      
                      {documentType === 'cnpj' && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center text-sm text-blue-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>Os dados da empresa serão preenchidos automaticamente ao digitar o CNPJ</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">
                          {documentType === 'cpf' ? 'Nome Completo' : 'Nome do Responsável'} *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder={documentType === 'cpf' ? 'Seu nome completo' : 'Nome do responsável pela empresa'}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="document">
                          {documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
                        </Label>
                        <div className="relative">
                          <Input
                            id="document"
                            value={formData.document}
                            onChange={(e) => handleDocumentChange(e.target.value)}
                            placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                            required
                            className={cnpjLoading ? 'pr-10' : ''}
                          />
                          {cnpjLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        {/* Status da consulta CNPJ */}
                        {cnpjStatus !== 'idle' && (
                          <div className={`flex items-center mt-2 text-sm ${
                            cnpjStatus === 'success' ? 'text-green-600' :
                            cnpjStatus === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {cnpjStatus === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
                            {cnpjStatus === 'warning' && <AlertCircle className="h-4 w-4 mr-1" />}
                            {cnpjStatus === 'error' && <AlertCircle className="h-4 w-4 mr-1" />}
                            <span>{cnpjMessage}</span>
                          </div>
                        )}
                        
                        {documentType === 'cnpj' && cnpjStatus === 'idle' && !cnpjLoading && (
                          <div className="mt-2 text-xs text-gray-500">
                            💡 Digite o CNPJ completo para buscar os dados automaticamente
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">
                          Nome da Empresa {documentType === 'cnpj' ? '*' : ''}
                        </Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Razão social da empresa"
                          required={documentType === 'cnpj'}
                        />
                      </div>
                      {documentType === 'cnpj' && (
                        <div>
                          <Label htmlFor="fantasyName">Nome Fantasia</Label>
                          <Input
                            id="fantasyName"
                            value={formData.fantasyName}
                            onChange={(e) => handleInputChange('fantasyName', e.target.value)}
                            placeholder="Nome fantasia (opcional)"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Endereço de Cobrança
                    </CardTitle>
                    <CardDescription>
                      <span className="text-blue-600 text-sm">
                        💡 Digite o CEP para preencher automaticamente o endereço
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="zipCode">CEP *</Label>
                        <div className="relative">
                          <Input
                            id="zipCode"
                            value={formData.address.zipCode}
                            onChange={(e) => handleCEPChange(e.target.value)}
                            placeholder="00000-000"
                            required
                            className={cepLoading ? 'pr-10' : ''}
                          />
                          {cepLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        {/* Status da consulta CEP */}
                        {cepStatus !== 'idle' && (
                          <div className={`flex items-center mt-2 text-sm ${
                            cepStatus === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {cepStatus === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
                            {cepStatus === 'error' && <AlertCircle className="h-4 w-4 mr-1" />}
                            <span>{cepMessage}</span>
                          </div>
                        )}
                        
                        {cepStatus === 'idle' && !cepLoading && (
                          <div className="mt-2 text-xs text-gray-500">
                            💡 Digite o CEP para preencher o endereço
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          value={formData.address.number}
                          onChange={(e) => handleInputChange('address.number', e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={formData.address.complement}
                          onChange={(e) => handleInputChange('address.complement', e.target.value)}
                          placeholder="Apto 45"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="district">Bairro *</Label>
                        <Input
                          id="district"
                          value={formData.address.district}
                          onChange={(e) => handleInputChange('address.district', e.target.value)}
                          placeholder="Nome do bairro"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          placeholder="Nome da cidade"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          placeholder="SP"
                          maxLength={2}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Pagamento */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Prosseguir para Pagamento
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Você será redirecionado para a página segura de pagamento do Asaas
                </p>
              </form>
            </div>

            {/* Resumo do Plano */}
            <div>
              <div className="sticky top-24">
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Resumo do Pedido</CardTitle>
                      {selectedPlan.popular && (
                        <Badge className="bg-blue-600">Mais Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Plano Selecionado */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedPlan.name}
                      </h3>
                      <p className="text-gray-600">{selectedPlan.description}</p>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-blue-600">
                            R$ {selectedPlan.price}
                          </span>
                          <span className="text-gray-600 ml-2">/{selectedPlan.period}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Recursos Inclusos */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Recursos Inclusos:
                      </h4>
                      <ul className="space-y-2">
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Garantias */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                        <span>Pagamento 100% seguro</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        <span>Cancele quando quiser</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span>Suporte especializado</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {selectedPlan.price}/{selectedPlan.period}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cobrança recorrente mensal
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Dúvidas */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Dúvidas sobre o plano?
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:suporte@bibliotech.com">
                      Falar com Suporte
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}