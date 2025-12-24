'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Key, Plus, Trash2, Copy, CheckCircle, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useN8NApiKeys, useCreateN8NApiKey, useRevokeN8NApiKey } from '@/hooks/use-n8n-api-keys'
import { CreateN8NApiKeyData } from '@/lib/services/n8n-api-keys'

interface CreateApiKeyForm {
  name: string
  expires_in_days: number
  rate_limit: number
}

export function N8NApiKeys() {
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Hooks para gerenciar API Keys
  const { data: apiKeysData, isLoading, refetch } = useN8NApiKeys()
  const createApiKeyMutation = useCreateN8NApiKey()
  const revokeApiKeyMutation = useRevokeN8NApiKey()

  const apiKeys = apiKeysData?.data || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateApiKeyForm>({
    defaultValues: {
      name: 'N8N Production',
      expires_in_days: 365,
      rate_limit: 100,
    },
  })

  // Criar nova API Key
  const onSubmit = async (data: CreateApiKeyForm) => {
    try {
      const result = await createApiKeyMutation.mutateAsync(data)
      setNewApiKey(result.data.api_key || null)
      setShowCreateForm(false)
      reset()
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  // Revogar API Key
  const revokeApiKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar esta API Key? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await revokeApiKeyMutation.mutateAsync(id)
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  // Copiar API Key
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(keyId)
      toast({
        title: 'Copiado!',
        description: 'API Key copiada para a área de transferência',
      })
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Keys N8N
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie chaves de API para integração com N8N e automações externas
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova API Key
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Como usar no N8N
              </p>
              <p className="text-sm text-blue-700">
                Adicione os seguintes headers em seus nós HTTP Request:
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs bg-white p-3 rounded border border-blue-200">
                <div><span className="text-blue-600">x-api-key:</span> sua-chave-de-64-caracteres</div>
                <div><span className="text-blue-600">x-company-id:</span> {apiKeys[0]?.company_id || 'seu-company-id'}</div>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Endpoints disponíveis: <code className="bg-white px-1 py-0.5 rounded">/api/external/*</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova API Key</CardTitle>
            <CardDescription>
              Preencha os dados para gerar uma nova chave de API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSubmit(onSubmit)(e)
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da API Key *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Nome é obrigatório' })}
                    placeholder="Ex: N8N Production"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_in_days">Validade (dias)</Label>
                  <select
                    id="expires_in_days"
                    {...register('expires_in_days', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={30}>30 dias</option>
                    <option value={90}>90 dias</option>
                    <option value={180}>180 dias</option>
                    <option value={365}>365 dias (1 ano)</option>
                    <option value={730}>730 dias (2 anos)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate_limit">Rate Limit (req/min)</Label>
                  <select
                    id="rate_limit"
                    {...register('rate_limit', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={50}>50 req/min</option>
                    <option value={100}>100 req/min</option>
                    <option value={200}>200 req/min</option>
                    <option value={500}>500 req/min</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createApiKeyMutation.isPending}>
                  {createApiKeyMutation.isPending ? 'Gerando...' : 'Gerar API Key'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Nova API Key Gerada */}
      {newApiKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              API Key Gerada com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠️ ATENÇÃO: Copie esta chave agora!
                </p>
                <p className="text-sm text-yellow-700">
                  Por motivos de segurança, esta chave não será exibida novamente.
                </p>
              </div>

              <div className="relative">
                <div className="bg-white border-2 border-green-300 rounded-lg p-4 pr-12 font-mono text-sm break-all">
                  {newApiKey}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(newApiKey, 'new')}
                >
                  {copiedKey === 'new' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setNewApiKey(null)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>API Keys Ativas</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma API Key criada ainda</p>
              <p className="text-sm mt-1">Clique em "Nova API Key" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Rate Limit</p>
                          <p className="font-medium">{key.rate_limit} req/min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expira em</p>
                          <p className="font-medium">
                            {new Date(key.expires_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Criada em</p>
                          <p className="font-medium">
                            {new Date(key.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Último uso</p>
                          <p className="font-medium">
                            {key.last_used_at
                              ? new Date(key.last_used_at).toLocaleDateString('pt-BR')
                              : 'Nunca'}
                          </p>
                        </div>
                      </div>

                      {key.api_key && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono">
                              {key.api_key}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(key.api_key!, key.id)}
                            >
                              {copiedKey === key.id ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implementar visualização de estatísticas
                          toast({
                            title: 'Em breve',
                            description: 'Estatísticas de uso em desenvolvimento',
                          })
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeApiKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
