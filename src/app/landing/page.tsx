'use client'

import React from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Check, 
  ArrowRight,
  Building2,
  Bell,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BiblioTech</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Planos</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">Sobre</a>
              <Link href="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link href="/login">
                <Button>Começar Grátis</Button>
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link href="/login">
                <Button size="sm">Acessar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão de Biblioteca
              <span className="text-blue-600"> Simplificada</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistema completo para gerenciar sua biblioteca empresarial. 
              Controle empréstimos, reservas e relatórios em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Demonstração
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✓ Teste grátis por 14 dias • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Clean Code</p>
                      <p className="text-sm text-gray-500">Robert C. Martin</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Disponível
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exemplares</span>
                    <span className="font-semibold">3/5</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Categoria</span>
                    <span className="font-semibold">Tecnologia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos completos para gerenciar sua biblioteca com eficiência e praticidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Gestão de Acervo</CardTitle>
                <CardDescription>
                  Cadastre e organize livros com facilidade. Importação em massa via CSV.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Controle de Empréstimos</CardTitle>
                <CardDescription>
                  Gerencie empréstimos, devoluções e renovações de forma automatizada.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Sistema de Reservas</CardTitle>
                <CardDescription>
                  Fila de espera inteligente com notificações automáticas.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Análises e métricas completas sobre uso da biblioteca.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Multi-empresa</CardTitle>
                <CardDescription>
                  Gerencie múltiplas bibliotecas com isolamento total de dados.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>PWA Mobile</CardTitle>
                <CardDescription>
                  Acesse de qualquer dispositivo. Funciona offline como app nativo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos para cada necessidade
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para sua biblioteca
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Plano Free */}
            <Card className="border-2 border-green-500 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Grátis
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Para começar e testar</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ 0</span>
                  <span className="text-gray-600">/sempre</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 50 livros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>1 empresa</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 5 usuários</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Suporte comunidade</span>
                  </li>
                </ul>
                <Link href="/login" className="block mt-6">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Básico */}
            <Card className="border-2 hover:border-blue-500 transition">
              <CardHeader>
                <CardTitle className="text-2xl">Básico</CardTitle>
                <CardDescription>Para pequenas bibliotecas</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ 99</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 500 livros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>1 empresa</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 50 usuários</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6" 
                  variant="outline"
                  onClick={() => window.open('/checkout?plan=basic', '_blank')}
                >
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Plano Profissional */}
            <Card className="border-2 border-blue-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Profissional</CardTitle>
                <CardDescription>Para bibliotecas em crescimento</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ 249</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 2.000 livros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Até 3 empresas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Integração N8N</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={() => window.open('/checkout?plan=professional', '_blank')}
                >
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-2 hover:border-blue-500 transition">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>Para grandes organizações</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Personalizado</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Livros ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Empresas ilimitadas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Customizações</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>SLA garantido</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span>Suporte 24/7</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">BiblioTech</span>
              </div>
              <p className="text-sm">
                Sistema completo de gestão de bibliotecas empresariais.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">Demonstração</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2024 BiblioTech. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
