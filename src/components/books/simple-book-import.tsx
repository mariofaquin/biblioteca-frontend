'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalFooter } from '@/components/ui/simple-modal'
import { useToast } from '@/hooks/use-toast'
import { useCreateBook } from '@/hooks/use-books'

interface SimpleBookImportProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CSVColumn {
  index: number
  name: string
  sample: string
  mappedTo: string | null
}

interface ImportResult {
  success: number
  errors: string[]
  processed: number
}

// Mapeamento de colunas - ORDEM ALFABÉTICA com descrições v2.1
const FIELD_OPTIONS = [
  { value: '', label: '--- Não mapear ---', description: '' },
  { value: 'year', label: 'Ano', description: 'Ano de publicação' },
  { value: 'author', label: 'Autor Principal *', description: 'Autor principal do livro (obrigatório)' },
  { value: 'author2', label: 'Autor 2', description: 'Segundo autor ou coautor' },
  { value: 'author3', label: 'Autor 3', description: 'Terceiro autor' },
  { value: 'author_initials', label: 'Autor - Iniciais', description: 'Iniciais do nome do autor' },
  { value: 'category', label: 'Categoria *', description: 'Categoria do livro (obrigatório)' },
  { value: 'classification', label: 'Classificação', description: 'Sistema de classificação (CDD, CDU, etc.)' },
  { value: 'qr_code', label: 'Código QR', description: 'Código QR único para identificação rápida' },
  { value: 'condition', label: 'Conservação', description: 'Estado físico do livro (Novo, Bom, Regular, Ruim)' },
  { value: 'available_copies', label: 'Cópias Disponíveis', description: 'Número de exemplares disponíveis para empréstimo' },
  { value: 'publication_date', label: 'Data de Publicação', description: 'Data completa de publicação' },
  { value: 'edition', label: 'Edição', description: 'Edição do livro (texto livre)' },
  { value: 'edition_number', label: 'Edição - Número', description: 'Número da edição (1ª, 2ª, etc.)' },
  { value: 'publisher', label: 'Editora', description: 'Nome da editora' },
  { value: 'copy', label: 'Exemplar', description: 'Número do exemplar (Ex: Exemplar 1, Cópia A)' },
  { value: 'total_copies', label: 'Exemplares - Total *', description: 'Número total de exemplares (obrigatório)' },
  { value: 'genre', label: 'Gênero', description: 'Gênero literário (Romance, Ficção, etc.)' },
  { value: 'isbn', label: 'ISBN', description: 'Código ISBN do livro' },
  { value: 'initials_title', label: 'Iniciais do Título', description: 'Iniciais do título do livro' },
  { value: 'place_of_publication', label: 'Local de Publicação', description: 'Cidade/país de publicação' },
  { value: 'location', label: 'Localização', description: 'Localização física na biblioteca (Estante, Sala, etc.)' },
  { value: 'tombo', label: 'Número de Tombo', description: 'Número de registro/patrimônio (único)' },
  { value: 'notes', label: 'Observações', description: 'Notas e observações gerais' },
  { value: 'number_of_pages', label: 'Páginas', description: 'Quantidade de páginas' },
  { value: 'synopsis', label: 'Sinopse', description: 'Resumo ou descrição do livro' },
  { value: 'sublocation', label: 'Sublocalização', description: 'Localização mais específica (Prateleira, Seção)' },
  { value: 'subtitle', label: 'Subtítulo', description: 'Subtítulo do livro' },
  { value: 'type', label: 'Tipo', description: 'Tipo de material (Livro, Revista, Periódico, etc.)' },
  { value: 'title', label: 'Título *', description: 'Título principal do livro (obrigatório)' },
  { value: 'original_title', label: 'Título Original', description: 'Título original (para livros traduzidos)' },
  { value: 'translation', label: 'Tradutor', description: 'Nome do tradutor' },
  { value: 'volume', label: 'Volume', description: 'Volume da obra (para coleções)' }
]

export function SimpleBookImport({ onSuccess, onCancel }: SimpleBookImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [columns, setColumns] = useState<CSVColumn[]>([])
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'result'>('upload')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const createBookMutation = useCreateBook()

  // Função para detectar separador do CSV
  const detectSeparator = (text: string): string => {
    const separators = [',', ';', '\t', '|']
    const firstLine = text.split('\n')[0]
    
    let bestSeparator = ','
    let maxColumns = 0
    
    for (const sep of separators) {
      const columns = firstLine.split(sep).length
      if (columns > maxColumns) {
        maxColumns = columns
        bestSeparator = sep
      }
    }
    
    return bestSeparator
  }

  // Função para mapear colunas automaticamente
  const autoMapColumns = (headers: string[]): CSVColumn[] => {
    return headers.map((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      let mappedTo: string | null = null

      // Mapeamento simples baseado em palavras-chave
      if (normalizedHeader.includes('titulo') || normalizedHeader.includes('title') || normalizedHeader.includes('nome')) {
        mappedTo = 'title'
      } else if (normalizedHeader.includes('autor') || normalizedHeader.includes('author') || normalizedHeader.includes('escritor')) {
        mappedTo = 'author'
      } else if (normalizedHeader.includes('isbn') || normalizedHeader.includes('codigo')) {
        mappedTo = 'isbn'
      } else if (normalizedHeader.includes('categoria') || normalizedHeader.includes('category') || normalizedHeader.includes('genero')) {
        mappedTo = 'category'
      } else if (normalizedHeader.includes('sinopse') || normalizedHeader.includes('synopsis') || normalizedHeader.includes('descricao')) {
        mappedTo = 'synopsis'
      } else if (normalizedHeader.includes('exemplares') || normalizedHeader.includes('copies') || normalizedHeader.includes('quantidade') || normalizedHeader.includes('total')) {
        mappedTo = 'total_copies'
      } else if (normalizedHeader.includes('disponiveis') || normalizedHeader.includes('available')) {
        mappedTo = 'available_copies'
      }

      return {
        index,
        name: header,
        sample: csvData[1] ? csvData[1][index] || '' : '',
        mappedTo
      }
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const text = await selectedFile.text()
      const separator = detectSeparator(text)
      const lines = text.split('\n').filter(line => line.trim())
      const data = lines.map(line => line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, '')))
      
      setCsvData(data)
      
      if (data.length > 0) {
        const detectedColumns = autoMapColumns(data[0])
        setColumns(detectedColumns)
        setStep('mapping')
        
        toast({
          title: 'Arquivo processado',
          description: `${data.length - 1} linhas detectadas. Verifique o mapeamento das colunas.`,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao processar arquivo',
        description: 'Não foi possível ler o arquivo CSV',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const updateColumnMapping = (columnIndex: number, mappedTo: string) => {
    setColumns(prev => prev.map(col => 
      col.index === columnIndex ? { ...col, mappedTo: mappedTo || null } : col
    ))
  }

  const validateMapping = (): string[] => {
    const errors: string[] = []
    const requiredFields = ['title', 'author', 'category', 'total_copies']
    const mappedFields = columns
      .filter(col => col.mappedTo)
      .map(col => col.mappedTo!)

    for (const required of requiredFields) {
      if (!mappedFields.includes(required)) {
        const fieldName = required === 'title' ? 'Título' :
                         required === 'author' ? 'Autor' :
                         required === 'category' ? 'Categoria' :
                         required === 'total_copies' ? 'Exemplares' : required
        errors.push(`Campo obrigatório não mapeado: ${fieldName}`)
      }
    }

    return errors
  }

  const startImport = async () => {
    console.log('🚀 BOTÃO INICIAR IMPORTAÇÃO CLICADO!')
    console.log('📊 Estado atual:', { 
      step, 
      isProcessing, 
      totalLinhas: csvData.length,
      totalColunas: columns.length 
    })
    console.log('📋 Colunas mapeadas:', columns.map(c => ({ 
      nome: c.name, 
      mapeadoPara: c.mappedTo 
    })))
    
    const validationErrors = validateMapping()
    console.log('✅ Resultado da validação:', validationErrors)
    console.log('📊 Campos obrigatórios:', ['title', 'author', 'category', 'total_copies'])
    console.log('📊 Campos mapeados:', columns.filter(c => c.mappedTo).map(c => c.mappedTo))
    
    if (validationErrors.length > 0) {
      console.log('❌ Erros de validação encontrados:', validationErrors)
      console.log('⚠️ IMPORTAÇÃO BLOQUEADA - Campos obrigatórios não mapeados!')
      alert('⚠️ ATENÇÃO!\n\nVocê precisa mapear TODOS os 4 campos obrigatórios:\n\n' + validationErrors.join('\n'))
      toast({
        title: '⚠️ Mapeamento Incompleto',
        description: validationErrors.join(', '),
        variant: 'destructive',
      })
      return
    }

    console.log('✅ Validação OK! Iniciando importação...')
    setStep('importing')
    setIsProcessing(true)

    const result: ImportResult = {
      success: 0,
      errors: [],
      processed: 0
    }

    try {
      // Processar cada linha (exceto cabeçalho)
      for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i]
        result.processed++

        try {
          // Mapear dados da linha
          const bookData: any = {}
          
          columns.forEach(col => {
            if (col.mappedTo && row[col.index]) {
              bookData[col.mappedTo] = row[col.index]
            }
          })

          // Validar dados obrigatórios
          if (!bookData.title || !bookData.author || !bookData.category) {
            result.errors.push(`Linha ${i + 1}: Campos obrigatórios em branco`)
            continue
          }

          // Definir valores padrão
          bookData.total_copies = parseInt(bookData.total_copies) || 1
          bookData.available_copies = parseInt(bookData.available_copies) || bookData.total_copies
          bookData.isbn = bookData.isbn || ''
          bookData.synopsis = bookData.synopsis || ''

          // Criar livro
          console.log(`📚 Criando livro ${i}/${csvData.length - 1}:`, bookData.title)
          await createBookMutation.mutateAsync(bookData)
          result.success++
          console.log(`✅ Livro ${i} criado com sucesso!`)

        } catch (error: any) {
          console.error(`❌ Erro na linha ${i + 1}:`, error)
          result.errors.push(`Linha ${i + 1}: ${error.message || 'Erro ao criar livro'}`)
        }
      }

      setImportResult(result)
      setStep('result')

      toast({
        title: 'Importação concluída',
        description: `${result.success} de ${result.processed} livros importados com sucesso`,
      })

    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro durante a importação',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setCsvData([])
    setColumns([])
    setStep('upload')
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = `titulo,autor,isbn,categoria,sinopse,exemplares
Clean Code,Robert C. Martin,978-0132350884,Tecnologia,"Um guia para escrever código limpo",3
O Alquimista,Paulo Coelho,978-8576657224,Literatura,"História de Santiago em busca do tesouro",2
Sapiens,Yuval Noah Harari,978-8535926279,História,"Uma breve história da humanidade",1`
    
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
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📁 Importação Inteligente de Livros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* AVISO IMPORTANTE */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  ⚠️ ATENÇÃO: Campos Obrigatórios
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  Seu arquivo CSV <strong>DEVE ter colunas</strong> para mapear estes 4 campos obrigatórios:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>✓ <strong>Título</strong> - Nome do livro</li>
                  <li>✓ <strong>Autor</strong> - Nome do autor principal</li>
                  <li>✓ <strong>Categoria</strong> - Categoria do livro</li>
                  <li>✓ <strong>Exemplares</strong> - Quantidade total de exemplares</li>
                </ul>
                <p className="text-sm text-red-700 mt-3">
                  <strong>Exemplo:</strong> Se sua planilha tem uma coluna "Assunto", você pode mapeá-la para "Categoria".
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Baixe o template abaixo para ver um exemplo de CSV com todos os campos.
                </p>
              </div>
              
              <Button variant="outline" onClick={downloadTemplate} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Baixar Template de Exemplo
              </Button>

              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {file ? file.name : 'Selecione seu arquivo CSV'}
                </p>
                <p className="text-sm text-gray-500">
                  Qualquer formato de CSV será detectado automaticamente
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🎯 Mapeamento Automático Detectado
              <Button variant="ghost" size="sm" onClick={resetImport} className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-1" />
                Novo Arquivo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Arquivo: <strong>{file?.name}</strong> • {csvData.length - 1} registros detectados
              </p>
              
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{column.name}</div>
                      <div className="text-xs text-gray-500">
                        Exemplo: "{column.sample}"
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    
                    <div className="flex-1">
                      <select
                        value={column.mappedTo || ''}
                        onChange={(e) => updateColumnMapping(column.index, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        {FIELD_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {column.mappedTo && (
                        <div className="text-xs text-blue-600 mt-1">
                          {FIELD_OPTIONS.find(opt => opt.value === column.mappedTo)?.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Campos Obrigatórios (*)
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  Você <strong>DEVE mapear</strong> estes 4 campos para continuar:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                  <div>✓ <strong>Título *</strong></div>
                  <div>✓ <strong>Autor Principal *</strong></div>
                  <div>✓ <strong>Categoria *</strong></div>
                  <div>✓ <strong>Exemplares - Total *</strong></div>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Se seu CSV não tem uma coluna específica, mapeie a coluna mais próxima. 
                  Exemplo: "Assunto" → "Categoria"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Importando Livros...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-600">
                Processando {csvData.length - 1} registros...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Result */}
      {step === 'result' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Importação Concluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-sm text-green-700">Importados</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-700">Erros</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.processed}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-700">Erros encontrados:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <ModalFooter>
        <Button variant="outline" onClick={onCancel}>
          {step === 'result' ? 'Fechar' : 'Cancelar'}
        </Button>
        
        {step === 'mapping' && (
          <Button onClick={startImport} disabled={isProcessing}>
            Iniciar Importação
          </Button>
        )}
        
        {step === 'result' && (
          <Button onClick={onSuccess}>
            Concluir
          </Button>
        )}
      </ModalFooter>
    </div>
  )
}