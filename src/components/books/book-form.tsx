'use client'
import { useForm } from 'react-hook-form'
import { useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/simple-select'
import { ModalFooter } from '@/components/ui/simple-modal'

import { useCreateBook, useUpdateBook } from '@/hooks/use-books'
import { Book, CreateBookData } from '@/lib/services/books'
import { ImageUpload } from '@/components/ui/image-upload'
import { usePermissions } from '@/hooks/use-permissions'

interface BookFormProps {
  book?: Book
  onSuccess: () => void
  onCancel: () => void
  readOnly?: boolean
}

export function BookForm({ book, onSuccess, onCancel, readOnly = false }: BookFormProps) {
  const isEditing = !!book
  const { canManageBooks } = usePermissions()
  
  // Memoizar o valor de isReadOnly para evitar recálculos
  const isReadOnly = useMemo(() => {
    return readOnly || !canManageBooks()
  }, [readOnly, canManageBooks])

  const createBookMutation = useCreateBook()
  const updateBookMutation = useUpdateBook()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookData>({
    defaultValues: book ? {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      synopsis: book.synopsis || '',
      cover_image: book.cover_image || '',
      cover_url: book.cover_url || '',
      number: book.number || '',
      total_copies: book.total_copies || 0,
      available_copies: book.available_copies || 0,
      is_available: book.is_available,
    } : {
      title: '',
      author: '',
      isbn: '',
      category: '',
      synopsis: '',
      cover_image: '',
      cover_url: '',
      number: '',
      total_copies: 1,
      available_copies: 1,
      is_available: true,
    }
  })

  const category = watch('category')
  const coverImage = watch('cover_image')

  const onSubmit = async (data: CreateBookData) => {
    try {
      // Pegar a URL da capa (pode estar em cover_url ou cover_image)
      const coverUrl = watch('cover_url') || watch('cover_image') || data.cover_url || data.cover_image || ''
      
      // Garantir que a imagem seja salva corretamente
      const formData = {
        ...data,
        cover_url: coverUrl,
        cover_image: coverUrl
      }
      
      console.log('📝 onSubmit chamado!')
      console.log('📝 Dados originais (data):', data)
      console.log('📝 Dados do formulário (formData):', formData)
      console.log('📝 cover_url calculado:', coverUrl)
      console.log('📝 watch cover_url:', watch('cover_url'))
      console.log('📝 watch cover_image:', watch('cover_image'))
      console.log('📝 Erros de validação:', errors)
      console.log('📝 isEditing:', isEditing)
      console.log('📝 isSubmitting:', isSubmitting)
      
      if (isEditing && book) {
        console.log('📝 Atualizando livro existente...')
        await updateBookMutation.mutateAsync({
          id: book.id,
          data: formData
        })
      } else {
        console.log('📝 Criando novo livro...')
        await createBookMutation.mutateAsync(formData)
      }
      console.log('📝 Operação concluída, chamando onSuccess...')
      onSuccess()
    } catch (error) {
      console.error('❌ Erro no onSubmit:', error)
      // Error handling is done in the mutation hooks
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          {...register('title', { 
            required: !isReadOnly ? 'Título é obrigatório' : false,
            maxLength: { value: 500, message: 'Título deve ter no máximo 500 caracteres' }
          })}
          placeholder="Digite o título do livro"
          disabled={isReadOnly}
          readOnly={isReadOnly}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Autor</Label>
        <Input
          id="author"
          {...register('author', { 
            required: !isReadOnly ? 'Autor é obrigatório' : false,
            maxLength: { value: 255, message: 'Autor deve ter no máximo 255 caracteres' }
          })}
          placeholder="Digite o nome do autor"
          disabled={isReadOnly}
          readOnly={isReadOnly}
        />
        {errors.author && (
          <p className="text-sm text-red-600">{errors.author.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            {...register('isbn', { 
              maxLength: { value: 50, message: 'ISBN deve ter no máximo 50 caracteres' }
            })}
            placeholder="Digite o ISBN (opcional)"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          {errors.isbn && (
            <p className="text-sm text-red-600">{errors.isbn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Número/Código</Label>
          <Input
            id="number"
            {...register('number')}
            placeholder="Número ou código do livro (opcional)"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          {errors.number && (
            <p className="text-sm text-red-600">{errors.number.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={category}
          onValueChange={isReadOnly ? undefined : (value: string) => setValue('category', value)}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tecnologia">Tecnologia</SelectItem>
            <SelectItem value="Literatura">Literatura</SelectItem>
            <SelectItem value="História">História</SelectItem>
            <SelectItem value="Ciência">Ciência</SelectItem>
            <SelectItem value="Filosofia">Filosofia</SelectItem>
            <SelectItem value="Arte">Arte</SelectItem>
            <SelectItem value="Biografia">Biografia</SelectItem>
            <SelectItem value="Ficção">Ficção</SelectItem>
            <SelectItem value="Romance">Romance</SelectItem>
            <SelectItem value="Suspense">Suspense</SelectItem>
            <SelectItem value="Autoajuda">Autoajuda</SelectItem>
            <SelectItem value="Negócios">Negócios</SelectItem>
            <SelectItem value="Educação">Educação</SelectItem>
            <SelectItem value="Saúde">Saúde</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_copies">Total de Exemplares</Label>
          <Input
            id="total_copies"
            type="number"
            min="0"
            {...register('total_copies', { 
              required: !isReadOnly ? 'Total de exemplares é obrigatório' : false,
              min: { value: 0, message: 'Deve ser um número positivo' },
              valueAsNumber: true
            })}
            placeholder="0"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          {errors.total_copies && (
            <p className="text-sm text-red-600">{errors.total_copies.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="available_copies">Exemplares Disponíveis</Label>
          <Input
            id="available_copies"
            type="number"
            min="0"
            {...register('available_copies', { 
              required: !isReadOnly ? 'Exemplares disponíveis é obrigatório' : false,
              min: { value: 0, message: 'Deve ser um número positivo' },
              valueAsNumber: true
            })}
            placeholder="0"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          {errors.available_copies && (
            <p className="text-sm text-red-600">{errors.available_copies.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status de Disponibilidade</Label>
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${watch('available_copies') > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {watch('available_copies') > 0 ? 'Disponível para empréstimo' : 'Indisponível'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            A disponibilidade é calculada automaticamente baseada na quantidade de exemplares disponíveis
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsis">Sinopse (Opcional)</Label>
        <textarea
          id="synopsis"
          {...register('synopsis')}
          placeholder="Digite uma breve descrição do livro..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
          disabled={isReadOnly}
          readOnly={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_url">URL da Capa (Opcional)</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="cover_url"
              {...register('cover_url')}
              placeholder="https://exemplo.com/imagem.jpg ou selecione um arquivo"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              className="font-mono text-sm flex-1"
            />
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      console.log('📁 Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'bytes')
                      
                      // Mostrar loading
                      setValue('cover_url', '⏳ Fazendo upload...')
                      
                      try {
                        // Fazer upload para o servidor
                        const formData = new FormData()
                        formData.append('file', file)
                        
                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        })
                        
                        if (!response.ok) {
                          throw new Error('Erro no upload')
                        }
                        
                        const result = await response.json()
                        console.log('✅ Upload concluído:', result.url)
                        
                        // Salvar o caminho público nos dois campos
                        setValue('cover_url', result.url)
                        setValue('cover_image', result.url)
                        
                        // Forçar atualização do formulário
                        console.log('📝 Valores atualizados:', {
                          cover_url: result.url,
                          cover_image: result.url
                        })
                        
                      } catch (error) {
                        console.error('❌ Erro no upload:', error)
                        setValue('cover_url', '')
                        alert('Erro ao fazer upload da imagem. Tente novamente.')
                      }
                    }
                  }
                  input.click()
                }}
                className="whitespace-nowrap"
              >
                📁 Procurar Arquivo
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            💡 Cole uma URL da internet OU clique em "Procurar Arquivo" para selecionar do seu computador
          </p>
          {(watch('cover_url') || watch('cover_image')) && (
            <div className="mt-2 p-2 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Preview:</p>
              <img 
                src={watch('cover_image') || watch('cover_url')} 
                alt="Preview da capa" 
                className="w-32 h-48 object-cover rounded shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%23ddd" width="100" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EURL inválida%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          )}
        </div>
        {errors.cover_url && (
          <p className="text-sm text-red-600">{errors.cover_url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <ImageUpload
          label="Capa do Livro (Upload)"
          description={isReadOnly ? "Imagem da capa do livro" : "Ou faça upload de uma imagem"}
          value={coverImage}
          onChange={isReadOnly ? () => {} : (value) => setValue('cover_image', value || '')}
          disabled={isReadOnly}
        />
      </div>

      <ModalFooter className="pt-4 mt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {isReadOnly ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isReadOnly && (
          <Button 
            type="submit" 
            disabled={isSubmitting || createBookMutation.isPending || updateBookMutation.isPending}
          >
            {isSubmitting || createBookMutation.isPending || updateBookMutation.isPending
              ? (isEditing ? 'Atualizando...' : 'Criando...')
              : (isEditing ? 'Atualizar' : 'Criar Livro')
            }
          </Button>
        )}
      </ModalFooter>
    </form>
  )
}