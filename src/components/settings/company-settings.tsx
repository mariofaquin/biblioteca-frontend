'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Settings, Save, RotateCcw, Building, Clock, Bell, DollarSign, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import { Switch } from '@/components/ui/simple-switch'
import { Textarea } from '@/components/ui/simple-textarea'
import { useCompanySettings, useUpdateCompanySettings, useResetCompanySettings } from '@/hooks/use-company-settings'
import { UpdateCompanySettingsData } from '@/lib/services/company-settings'
import { ImageUpload } from '@/components/ui/image-upload'
import { N8NApiKeys } from './n8n-api-keys'
import { usePermissions } from '@/hooks/use-permissions'

export function CompanySettings() {
  const [activeTab, setActiveTab] = useState('general')
  const { isAdmin } = usePermissions()

  const { data: settingsData, isLoading } = useCompanySettings()
  const updateSettingsMutation = useUpdateCompanySettings()
  const resetSettingsMutation = useResetCompanySettings()

  const settings = settingsData?.data

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateCompanySettingsData>({
    defaultValues: settings,
  })

  // Atualizar form quando os dados carregarem
  React.useEffect(() => {
    if (settings) {
      reset(settings)
    }
  }, [settings, reset])

  const onSubmit = async (data: UpdateCompanySettingsData) => {
    await updateSettingsMutation.mutateAsync(data)
  }

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
      await resetSettingsMutation.mutateAsync()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações e parâmetros da sua biblioteca
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetSettingsMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar Padrões
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="general">
            <Building className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="loans">
            <Clock className="h-4 w-4 mr-2" />
            Empréstimos
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="n8n">
              <Settings className="h-4 w-4 mr-2" />
              API Keys N8N
            </TabsTrigger>
          )}
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Configurações Gerais */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nome da Empresa (Opcional)</Label>
                    <Input
                      id="company_name"
                      {...register('company_name')}
                      placeholder="Nome da sua biblioteca"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contato (Opcional)</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...register('contact_email')}
                      placeholder="contato@biblioteca.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone (Opcional)</Label>
                    <Input
                      id="contact_phone"
                      {...register('contact_phone')}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço (Opcional)</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="Endereço completo da biblioteca"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    label="Logo da Empresa (Opcional)"
                    description="Selecione o logo da sua biblioteca"
                    value={watch('company_logo_url')}
                    onChange={(value) => setValue('company_logo_url', value || undefined)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Empréstimos */}
          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regras de Empréstimo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan_duration_days">Duração do Empréstimo (dias)</Label>
                    <Input
                      id="loan_duration_days"
                      type="number"
                      min="1"
                      max="365"
                      {...register('loan_duration_days', {
                        required: 'Duração é obrigatória',
                        min: { value: 1, message: 'Mínimo 1 dia' },
                        max: { value: 365, message: 'Máximo 365 dias' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.loan_duration_days && (
                      <p className="text-sm text-red-600">{errors.loan_duration_days.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_renewals">Máximo de Renovações</Label>
                    <Input
                      id="max_renewals"
                      type="number"
                      min="0"
                      max="10"
                      {...register('max_renewals', {
                        required: 'Máximo de renovações é obrigatório',
                        min: { value: 0, message: 'Mínimo 0' },
                        max: { value: 10, message: 'Máximo 10' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.max_renewals && (
                      <p className="text-sm text-red-600">{errors.max_renewals.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="renewal_duration_days">Duração da Renovação (dias)</Label>
                    <Input
                      id="renewal_duration_days"
                      type="number"
                      min="1"
                      max="365"
                      {...register('renewal_duration_days', {
                        required: 'Duração da renovação é obrigatória',
                        min: { value: 1, message: 'Mínimo 1 dia' },
                        max: { value: 365, message: 'Máximo 365 dias' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.renewal_duration_days && (
                      <p className="text-sm text-red-600">{errors.renewal_duration_days.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_books_per_user">Máximo de Livros por Usuário</Label>
                    <Input
                      id="max_books_per_user"
                      type="number"
                      min="1"
                      max="50"
                      {...register('max_books_per_user', {
                        required: 'Máximo de livros é obrigatório',
                        min: { value: 1, message: 'Mínimo 1 livro' },
                        max: { value: 50, message: 'Máximo 50 livros' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.max_books_per_user && (
                      <p className="text-sm text-red-600">{errors.max_books_per_user.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overdue_fine_per_day">Multa por Dia de Atraso (R$)</Label>
                    <Input
                      id="overdue_fine_per_day"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('overdue_fine_per_day', {
                        required: 'Multa é obrigatória',
                        min: { value: 0, message: 'Mínimo R$ 0,00' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.overdue_fine_per_day && (
                      <p className="text-sm text-red-600">{errors.overdue_fine_per_day.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regras de Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservation_expiry_hours">Expiração da Reserva (horas)</Label>
                    <Input
                      id="reservation_expiry_hours"
                      type="number"
                      min="1"
                      max="168"
                      {...register('reservation_expiry_hours', {
                        required: 'Expiração é obrigatória',
                        min: { value: 1, message: 'Mínimo 1 hora' },
                        max: { value: 168, message: 'Máximo 168 horas (7 dias)' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.reservation_expiry_hours && (
                      <p className="text-sm text-red-600">{errors.reservation_expiry_hours.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_reservations_per_user">Máximo de Reservas por Usuário</Label>
                    <Input
                      id="max_reservations_per_user"
                      type="number"
                      min="1"
                      max="20"
                      {...register('max_reservations_per_user', {
                        required: 'Máximo de reservas é obrigatório',
                        min: { value: 1, message: 'Mínimo 1 reserva' },
                        max: { value: 20, message: 'Máximo 20 reservas' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.max_reservations_per_user && (
                      <p className="text-sm text-red-600">{errors.max_reservations_per_user.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações por email para usuários
                    </p>
                  </div>
                  <Switch
                    checked={watch('email_notifications_enabled')}
                    onCheckedChange={(checked) => setValue('email_notifications_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações por SMS para usuários
                    </p>
                  </div>
                  <Switch
                    checked={watch('sms_notifications_enabled')}
                    onCheckedChange={(checked) => setValue('sms_notifications_enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder_days_before_due">Lembrete Antes do Vencimento (dias)</Label>
                    <Input
                      id="reminder_days_before_due"
                      type="number"
                      min="0"
                      max="30"
                      {...register('reminder_days_before_due', {
                        required: 'Dias de lembrete é obrigatório',
                        min: { value: 0, message: 'Mínimo 0 dias' },
                        max: { value: 30, message: 'Máximo 30 dias' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.reminder_days_before_due && (
                      <p className="text-sm text-red-600">{errors.reminder_days_before_due.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification_hours_before_expiry">Notificação Antes da Expiração (horas)</Label>
                    <Input
                      id="notification_hours_before_expiry"
                      type="number"
                      min="1"
                      max="72"
                      {...register('notification_hours_before_expiry', {
                        required: 'Horas de notificação é obrigatório',
                        min: { value: 1, message: 'Mínimo 1 hora' },
                        max: { value: 72, message: 'Máximo 72 horas' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.notification_hours_before_expiry && (
                      <p className="text-sm text-red-600">{errors.notification_hours_before_expiry.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Financeiras */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integração Asaas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar Asaas</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar integração com gateway de pagamento Asaas
                    </p>
                  </div>
                  <Switch
                    checked={watch('asaas_enabled')}
                    onCheckedChange={(checked) => setValue('asaas_enabled', checked)}
                  />
                </div>

                {watch('asaas_enabled') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="asaas_api_key">Chave API do Asaas</Label>
                      <Input
                        id="asaas_api_key"
                        type="password"
                        {...register('asaas_api_key')}
                        placeholder="Sua chave API do Asaas"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Assinatura Obrigatória</Label>
                        <p className="text-sm text-muted-foreground">
                          Exigir assinatura paga para usar a biblioteca
                        </p>
                      </div>
                      <Switch
                        checked={watch('subscription_required')}
                        onCheckedChange={(checked) => setValue('subscription_required', checked)}
                      />
                    </div>

                    {watch('subscription_required') && (
                      <div className="space-y-2">
                        <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
                        <Input
                          id="monthly_fee"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('monthly_fee', {
                            min: { value: 0, message: 'Mínimo R$ 0,00' },
                            valueAsNumber: true
                          })}
                        />
                        {errors.monthly_fee && (
                          <p className="text-sm text-red-600">{errors.monthly_fee.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Aparência */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personalização Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primary_color"
                        type="color"
                        {...register('primary_color')}
                        className="w-16 h-10"
                      />
                      <Input
                        {...register('primary_color')}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        {...register('secondary_color')}
                        className="w-16 h-10"
                      />
                      <Input
                        {...register('secondary_color')}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Botão de Salvar - Apenas para abas de configurações */}
          {activeTab !== 'n8n' && (
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={!isDirty || updateSettingsMutation.isPending}
                className="min-w-32"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          )}
        </form>

        {/* API Keys N8N - Apenas para Admins - FORA DO FORMULÁRIO */}
        {isAdmin && (
          <TabsContent value="n8n" className="space-y-4">
            <N8NApiKeys />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}