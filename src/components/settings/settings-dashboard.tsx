'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanySettings } from './company-settings'
import { DatabaseConfigForm } from '@/components/admin/database-config-form'
import { Building2, Database, Shield, AlertTriangle } from 'lucide-react'

export function SettingsDashboard() {
  const { isRoot, isAdmin } = usePermissions()
  const [activeTab, setActiveTab] = useState('company')

  // Verificar permissões
  const canAccessCompanySettings = isRoot() || isAdmin()
  const canAccessDatabaseSettings = isRoot()

  console.log('🔧 [SettingsDashboard] Permissões:', {
    isRoot: isRoot(),
    isAdmin: isAdmin(),
    canAccessCompanySettings,
    canAccessDatabaseSettings
  })

  // Se não tem acesso a nenhuma configuração
  if (!canAccessCompanySettings && !canAccessDatabaseSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurações
          </h1>
          <p className="text-gray-600">
            Gerencie as configurações do sistema.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Você não tem permissão para acessar as configurações do sistema. 
              Entre em contato com um administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Gerencie as configurações do sistema e da empresa.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {canAccessCompanySettings && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações da Empresa</span>
              <span className="sm:hidden">Empresa</span>
            </TabsTrigger>
          )}
          
          {canAccessDatabaseSettings && (
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações do Banco</span>
              <span className="sm:hidden">Banco</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                ROOT
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {canAccessCompanySettings && (
          <TabsContent value="company" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Configurações da Empresa
                </CardTitle>
                <CardDescription>
                  Gerencie as informações e configurações da sua empresa.
                  {!isRoot() && (
                    <span className="block mt-1 text-blue-600">
                      💡 Acesso de Administrador
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanySettings />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canAccessDatabaseSettings && (
          <TabsContent value="database" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Configurações do Banco de Dados
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    ROOT ONLY
                  </span>
                </CardTitle>
                <CardDescription>
                  Configure a conexão com PostgreSQL e Supabase. 
                  <span className="flex items-center gap-1 mt-1 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    Acesso restrito apenas para usuários ROOT
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseConfigForm />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}