'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalFooter } from '@/components/ui/simple-modal'
import { useToast } from '@/hooks/use-toast'

interface BookImportProps {
  onSuccess: () => void
  onCancel: () => void
}

export function BookImport({ onSuccess, onCancel }: BookImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setUploadResult(null)
      } else {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione um arquivo CSV',
          variant: 'destructive',
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    
    try {
      // Simular upload e processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular resultado do processamento
      const mockResult = {
        success: Math.floor(Math.random() * 50) + 10,
        errors: [
          'Linha 5: ISBN já existe no sistema',
          'Linha 12: Título é obrigatório',
          'Linha 18: Categoria inválida'
        ].slice(0, Math.floor(Math.random() * 4))
      }
      
      setUploadResult(mockResult)
      
      toast({
        title: 'Importação concluída',
        description: `${mockResult.success} livros importados com sucesso`,
      })
      
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro ao processar o arquivo',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Criar CSV template
    const csvContent = `titulo,autor,isbn,categoria,sinopse,exemplares
Clean Code,Robert C. Martin,978-0132350884,Tecnologia,"Um guia para escrever código limpo",3
O Alquimista,Paulo Coelho,978-8576657224,Literatura,"História de Santiago em busca do tesouro",2`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-livros.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Baixar Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Baixe o template CSV com o formato correto para importação
          </p>
          <Button variant="outline" onClick={downloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Baixar Template CSV
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Selecionar Arquivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {file ? file.name : 'Clique para selecionar um arquivo CSV'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: .csv
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Processando...' : 'Importar'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {uploadResult.success} livros importados com sucesso
                </span>
              </div>
              
              {uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      {uploadResult.errors.length} erros encontrados:
                    </span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} className="list-disc">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Format Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formato do CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Colunas obrigatórias:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>titulo:</strong> Título do livro</li>
              <li><strong>autor:</strong> Nome do autor</li>
              <li><strong>categoria:</strong> Categoria do livro</li>
              <li><strong>exemplares:</strong> Número de exemplares</li>
            </ul>
            <p className="mt-3"><strong>Colunas opcionais:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>isbn:</strong> Código ISBN</li>
              <li><strong>sinopse:</strong> Descrição do livro</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <ModalFooter>
        <Button variant="outline" onClick={onCancel}>
          Fechar
        </Button>
        {uploadResult && (
          <Button onClick={onSuccess}>
            Concluir
          </Button>
        )}
      </ModalFooter>
    </div>
  )
}