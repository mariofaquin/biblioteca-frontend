'use client';

import { DatabaseConfigForm } from '@/components/admin/database-config-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DatabaseConfigPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Parametrização de Banco de Dados
        </h1>
        <p className="text-gray-600">
          Configure e gerencie as conexões com PostgreSQL ou Supabase. 
          Acesso restrito a usuários root.
        </p>
      </div>
      
      <DatabaseConfigForm />
    </div>
  );
}