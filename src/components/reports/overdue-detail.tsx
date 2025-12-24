'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Mail, Download, Clock, Book, User, Phone, DollarSign } from 'lucide-react'
import { useDetailedReports } from '@/hooks/use-detailed-reports'
import { useToast } from '@/hooks/use-toast'

export function OverdueDetail() {
  const { usersWithOverdueBooks, isLoading, sendReminderEmail, generateDetailedReport } = useDetailedReports()
  const { toast } = useToast()
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  const handleSendReminder = async (userId: string, userName: string) => {
    setSendingReminder(userId)
    try {
      const result = await sendReminderEmail(userId, 'overdue')
      if (result.success) {
        toast({
          title: "Lembrete enviado!",
          description: `Email de cobrança enviado para ${userName}`,
        })
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } finally {
      setSendingReminder(null)
    }
  }

  const handleGenerateReport = async () => {
    const result = await generateDetailedReport('overdue')
    if (result.success) {
      toast({
        title: "Relatório gerado!",
        description: result.message,
      })
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const getTotalFines = () => {
    return usersWithOverdueBooks?.reduce((total, user) => total + (user.fine || 0), 0) || 0
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Carregando empréstimos em atraso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle>Usuários com Empréstimos em Atraso</CardTitle>
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              {usersWithOverdueBooks?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total em multas:</p>
              <p className="font-bold text-red-600">R$ {getTotalFines().toFixed(2)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 mr-2" />
              Relatório de Cobrança
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!usersWithOverdueBooks || usersWithOverdueBooks.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum empréstimo em atraso</p>
            <p className="text-sm text-gray-500">Todos os livros foram devolvidos no prazo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usersWithOverdueBooks.map((overdue) => (
              <div key={`${overdue.id}-${overdue.book.id}`} className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Informações do usuário */}
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{overdue.name}</p>
                        <p className="text-sm text-gray-600">{overdue.email}</p>
                        {overdue.phone && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <p className="text-xs text-gray-500">{overdue.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informações do livro */}
                    <div className="flex items-start space-x-2">
                      <Book className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{overdue.book.title}</p>
                        <p className="text-xs text-gray-600">por {overdue.book.author}</p>
                        <p className="text-xs text-gray-500">ISBN: {overdue.book.isbn}</p>
                      </div>
                    </div>

                    {/* Datas e atraso */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600">Data do empréstimo:</p>
                        <p className="font-medium">{new Date(overdue.loanDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data de vencimento:</p>
                        <p className="font-medium text-red-600">{new Date(overdue.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Tempo de atraso */}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-red-700">
                          {overdue.daysOverdue} {overdue.daysOverdue === 1 ? 'dia' : 'dias'} em atraso
                        </span>
                        <Badge 
                          variant="destructive"
                          className={`text-xs ${
                            overdue.daysOverdue > 14 ? 'bg-red-600' : 
                            overdue.daysOverdue > 7 ? 'bg-red-500' : 'bg-red-400'
                          }`}
                        >
                          {overdue.daysOverdue > 14 ? 'Crítico' : overdue.daysOverdue > 7 ? 'Grave' : 'Moderado'}
                        </Badge>
                      </div>
                    </div>

                    {/* Multa */}
                    {overdue.fine && overdue.fine > 0 && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Multa: R$ {overdue.fine.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                          R$ {(overdue.fine / overdue.daysOverdue).toFixed(2)}/dia
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSendReminder(overdue.id, overdue.name)}
                      disabled={sendingReminder === overdue.id}
                      className="text-xs"
                    >
                      {sendingReminder === overdue.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        <Mail className="h-3 w-3 mr-1" />
                      )}
                      Cobrar
                    </Button>
                    
                    <Badge 
                      variant="destructive" 
                      className={`text-xs justify-center ${
                        overdue.daysOverdue > 14 
                          ? 'bg-red-600' 
                          : overdue.daysOverdue > 7 
                          ? 'bg-red-500' 
                          : 'bg-red-400'
                      }`}
                    >
                      {overdue.daysOverdue > 14 ? 'Urgentíssimo' : overdue.daysOverdue > 7 ? 'Urgente' : 'Atenção'}
                    </Badge>

                    {overdue.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          // Simular ligação
                          toast({
                            title: "Ligação iniciada",
                            description: `Ligando para ${overdue.name}...`,
                          })
                        }}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Ligar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}