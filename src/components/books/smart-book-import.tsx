'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalFooter } from '@/components/ui/simple-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/simple-select'
import { useToast } from '@/hooks/use-toast'
import { useCreateBook } from '@/hooks/use-books'

interface SmartBookImportProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CSVColumn {
  index: number
  name: string
  sample: string
  mappedTo: string | null
  confidence: number
}

interface ImportResult {
  success: number
  errors: string[]
  processed: number
}

// Mapeamento inteligente de colunas
const COLUMN_MAPPINGS = {
  title: {
    keywords: ['titulo', 'title', 'nome', 'livro', 'book', 'name'],
    required: true
  },
  author: {
    keywords: ['autor', 'author', 'escritor', 'writer'],
    required: true
  },
  isbn: {
    keywords: ['isbn', 'codigo', 'code'],
    required: false
  },
  category: {
    keywords: ['categoria', 'category', 'genero', 'genre', 'tipo', 'type'],
    required: true
  },
  synopsis: {
    keywords: ['sinopse', 'synopsis', 'descricao', 'description', 'resumo', 'summary'],
    required: false
  },
  total_copies: {
    keywords: ['exemplares', 'copies', 'quantidade', 'quantity', 'total', 'qtd'],
    required: true
  },
  available_copies: {
    keywords: ['disponiveis', 'available', 'livres', 'free'],
    required: false
  }
}

export function SmartBookImport({ onSuccess, onCancel }: SmartBookImportProps) {
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
      let bestMatch: string | null = null
      let bestConfidence = 0

      // Procurar melhor correspondência
      for (const [field, config] of Object.entries(COLUMN_MAPPINGS)) {
        for (const keyword of config.keywords) {
          if (normalizedHeader.includes(keyword)) {
            const confidence = normalizedHeader === keyword ? 100 : 
                             normalizedHeader.startsWith(keyword) ? 80 : 60
            if (confidence > bestConfidence) {
              bestMatch = field
              bestConfidence = confidence
            }
          }
        }
      }

      return {
        index,
        name: header,
        sample: csvData[1] ? csvData[1][index] || '' : '',
        mappedTo: bestConfidence > 50 ? bestMatch : null,
        confidence: bestConfidence
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

  const updateColumnMapping = (columnIndex: number, mappedTo: string | null) => {
    setColumns(prev => prev.map(col => 
      col.index === columnIndex ? { ...col, mappedTo } : col
    ))
  }

  const validateMapping = (): string[] => {
    const errors: string[] = []
    const requiredFields = Object.entries(COLUMN_MAPPINGS)
      .filter(([_, config]) => config.required)
      .map(([field]) => field)

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
    const validationErrors = validateMapping()
    if (validationErrors.length > 0) {
      toast({
        title: 'Mapeamento incompleto',
        description: validationErrors.join(', '),
        variant: 'destructive',
      })
      return
    }

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
          await createBookMutation.mutateAsync(bookData)
          result.success++

        } catch (error: any) {
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
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📁 Importação Inteligente de Livros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  O sistema detectará automaticamente as colunas do seu CSV e fará o mapeamento inteligente dos campos.
                </p>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate} size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Baixar Template
                  </Button>
                </div>

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
        </>
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
                      <Select
                        value={column.mappedTo || 'none'}
                        onValueChange={(value) => updateColumnMapping(column.index, value === 'none' ? null : value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não mapear</SelectItem>
                          <SelectItem value="title">📖 Título *</SelectItem>
                          <SelectItem value="author">👤 Autor *</SelectItem>
                          <SelectItem value="isbn">🔢 ISBN</SelectItem>
                          <SelectItem value="category">📚 Categoria *</SelectItem>
                          <SelectItem value="synopsis">📝 Sinopse</SelectItem>
                          <SelectItem value="total_copies">📊 Total Exemplares *</SelectItem>
                          <SelectItem value="available_copies">✅ Exemplares Disponíveis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {column.confidence > 0 && (
                      <div className={`text-xs px-2 py-1 rounded ${
                        column.confidence >= 80 ? 'bg-green-100 text-green-700' :
                        column.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {column.confidence}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Campos obrigatórios (*):</strong> Título, Autor, Categoria, Total de Exemplares
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