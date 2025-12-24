'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/simple-badge'
import { Switch } from '@/components/ui/simple-switch'
import { Textarea } from '@/components/ui/simple-textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { usePermissions } from '@/hooks/use-permissions'
import { Book } from '@/types'
import { BookOpen, MapPin, Package, Settings, FileText, Calendar } from 'lucide-react'

interface BookFormExpandidoData {
  // Identificação
  titulo: string
  subtitulo?: string
  autor: string
  coautor?: string
  isbn?: string
  codigo_interno?: string
  codigo_barras?: string

  // Publicação
  editora?: string
  ano_publicacao?: number
  edicao?: string
  idioma: string
  numero_paginas?: number

  // Classificação
  categoria: string
  genero?: string
  assunto?: string
  classificacao_etaria?: string
  nivel_dificuldade?: string
  tags?: string

  // Descrição
  sinopse?: string
  descricao?: string
  observacoes?: string

  // Localização
  localizacao_estante?: string
  secao?: string
  andar?: string
  sala?: string

  // Controle de Exemplares
  exemplares_total: number
  estado_conservacao?: string

  // Aquisição
  data_aquisicao?: string
  preco_aquisicao?: number
  fornecedor?: string

  // Status
  ativo: boolean
  destaque: boolean
  emprestavel: boolean

  // Mídia
  url_capa?: string
  url_arquivo_digital?: string
}

interface BookFormExpandidoProps {
  book?: Book
  onSuccess: () => void
  onCancel: () => void
  readOnly?: boolean
}

export function BookFormExpandido({ book, onSuccess, onCancel, readOnly = false }: BookFormExpandidoProps) {
  const isEditing = !!book
  const { canManageBooks } = usePermissions()
  const isReadOnly = readOnly || !canManageBooks()
  const [activeTab, setActiveTab] = useState('basico')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormExpandidoData>({
    defaultValues: book ? {
      titulo: book.titulo,
      subtitulo: book.subtitulo || '',
      autor: book.autor,
      coautor: book.coautor || '',
      isbn: book.isbn || '',
      codigo_interno: book.codigo_interno || '',
      codigo_barras: book.codigo_barras || '',
      editora: book.editora || '',
      ano_publicacao: book.ano_publicacao || new Date().getFullYear(),
      edicao: book.edicao || '',
      idioma: book.idioma || 'Português',
      numero_paginas: book.numero_paginas || 0,
      categoria: book.categoria,
      genero: book.genero || '',
      assunto: book.assunto || '',
      classificacao_etaria: book.classificacao_etaria || '',
      nivel_dificuldade: book.nivel_dificuldade || '',
      tags: book.tags?.join(', ') || '',
      sinopse: book.sinopse || '',
      descricao: book.descricao || '',
      observacoes: book.observacoes || '',
      localizacao_estante: book.localizacao_estante || '',
      secao: book.secao || '',
      andar: book.andar || '',
      sala: book.sala || '',
      exemplares_total: book.exemplares_total || 1,
      estado_conservacao: book.estado_conservacao || 'Bom',
      data_aquisicao: book.data_aquisicao || '',
      preco_aquisicao: book.preco_aquisicao || 0,
      fornecedor: book.fornecedor || '',
      ativo: book.ativo ?? true,
      destaque: book.destaque ?? false,
      emprestavel: book.emprestavel ?? true,
      url_capa: book.url_capa || '',
      url_arquivo_digital: book.url_arquivo_digital || '',
    } : {
      titulo: '',
      subtitulo: '',
      autor: '',
      coautor: '',
      isbn: '',
      codigo_interno: '',
      codigo_barras: '',
      editora: '',
      ano_publicacao: new Date().getFullYear(),
      edicao: '1ª',
      idioma: 'Português',
      numero_paginas: 0,
      categoria: '',
      genero: '',
      assunto: '',
      classificacao_etaria: 'Livre',
      nivel_dificuldade: 'Básico',
      tags: '',
      sinopse: '',
      descricao: '',
      observacoes: '',
      localizacao_estante: '',
      secao: '',
      andar: '',
      sala: '',
      exemplares_total: 1,
      estado_conservacao: 'Novo',
      data_aquisicao: new Date().toISOString().split('T')[0],
      preco_aquisicao: 0,
      fornecedor: '',
      ativo: true,
      destaque: false,
      emprestavel: true,
      url_capa: '',
      url_arquivo_digital: '',
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: BookFormExpandidoData) => {
    try {
      // Processar tags
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      
      const bookData = {
        ...data,
        tags: tagsArray,
        ano_publicacao: data.ano_publicacao || undefined,
        numero_paginas: data.numero_paginas || undefined,
        preco_aquisicao: data.preco_aquisicao || undefined,
      }

      console.log('📚 Dados do livro para salvar:', bookData)
      
      // Aqui você integraria com a API
      // if (isEditing && book) {
      //   await updateBookMutation.mutateAsync({ id: book.id, data: bookData })
      // } else {
      //   await createBookMutation.mutateAsync(bookData)
      // }
      
      onSuccess()
    } catch (error) {
      console.error('❌ Erro ao salvar livro:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basico" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="publicacao" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Publicação
            </TabsTrigger>
            <TabsTrigger value="classificacao" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Localização
            </TabsTrigger>
            <TabsTrigger value="controle" className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              Controle
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* ABA BÁSICO */}
          <TabsContent value="basico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do livro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      {...register('titulo', { required: 'Título é obrigatório' })}
                      placeholder="Digite o título do livro"
                      disabled={isReadOnly}
                    />
                    {errors.titulo && <p className="text-sm text-red-600">{errors.titulo.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitulo">Subtítulo</Label>
                    <Input
                      id="subtitulo"
                      {...register('subtitulo')}
                      placeholder="Subtítulo (opcional)"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autor">Autor *</Label>
                    <Input
                      id="autor"
                      {...register('autor', { required: 'Autor é obrigatório' })}
                      placeholder="Nome do autor principal"
                      disabled={isReadOnly}
                    />
                    {errors.autor && <p className="text-sm text-red-600">{errors.autor.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coautor">Coautor</Label>
                    <Input
                      id="coautor"
                      {...register('coautor')}
                      placeholder="Nome do coautor (opcional)"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      {...register('isbn')}
                      placeholder="978-85-123-4567-8"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo_interno">Código Interno</Label>
                    <Input
                      id="codigo_interno"
                      {...register('codigo_interno')}
                      placeholder="LIV-001"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo_barras">Código de Barras</Label>
                    <Input
                      id="codigo_barras"
                      {...register('codigo_barras')}
                      placeholder="123456789012"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sinopse">Sinopse</Label>
                  <Textarea
                    id="sinopse"
                    {...register('sinopse')}
                    placeholder="Breve descrição do livro..."
                    rows={4}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    label="Capa do Livro"
                    description="Imagem da capa (opcional)"
                    value={watchedValues.url_capa}
                    onChange={(value) => setValue('url_capa', value || '')}
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA PUBLICAÇÃO */}
          <TabsContent value="publicacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Publicação</CardTitle>
                <CardDescription>Informações sobre a edição e publicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editora">Editora</Label>
                    <Input
                      id="editora"
                      {...register('editora')}
                      placeholder="Nome da editora"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ano_publicacao">Ano de Publicação</Label>
                    <Input
                      id="ano_publicacao"
                      type="number"
                      {...register('ano_publicacao', { 
                        min: { value: 1000, message: 'Ano inválido' },
                        max: { value: new Date().getFullYear() + 1, message: 'Ano não pode ser futuro' }
                      })}
                      placeholder="2024"
                      disabled={isReadOnly}
                    />
                    {errors.ano_publicacao && <p className="text-sm text-red-600">{errors.ano_publicacao.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edicao">Edição</Label>
                    <Input
                      id="edicao"
                      {...register('edicao')}
                      placeholder="1ª, 2ª, etc."
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idioma">Idioma</Label>
                    <Select
                      value={watchedValues.idioma}
                      onValueChange={(value) => setValue('idioma', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Português">Português</SelectItem>
                        <SelectItem value="Inglês">Inglês</SelectItem>
                        <SelectItem value="Espanhol">Espanhol</SelectItem>
                        <SelectItem value="Francês">Francês</SelectItem>
                        <SelectItem value="Alemão">Alemão</SelectItem>
                        <SelectItem value="Italiano">Italiano</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_paginas">Número de Páginas</Label>
                    <Input
                      id="numero_paginas"
                      type="number"
                      {...register('numero_paginas', { min: { value: 1, message: 'Deve ter pelo menos 1 página' } })}
                      placeholder="250"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA CLASSIFICAÇÃO */}
          <TabsContent value="classificacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classificação e Categorização</CardTitle>
                <CardDescription>Como o livro será organizado e encontrado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={watchedValues.categoria}
                      onValueChange={(value) => setValue('categoria', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Literatura Brasileira">Literatura Brasileira</SelectItem>
                        <SelectItem value="Literatura Estrangeira">Literatura Estrangeira</SelectItem>
                        <SelectItem value="Ficção Científica">Ficção Científica</SelectItem>
                        <SelectItem value="Romance">Romance</SelectItem>
                        <SelectItem value="Suspense/Thriller">Suspense/Thriller</SelectItem>
                        <SelectItem value="Biografia">Biografia</SelectItem>
                        <SelectItem value="História">História</SelectItem>
                        <SelectItem value="Ciências">Ciências</SelectItem>
                        <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="Filosofia">Filosofia</SelectItem>
                        <SelectItem value="Religião">Religião</SelectItem>
                        <SelectItem value="Arte">Arte</SelectItem>
                        <SelectItem value="Autoajuda">Autoajuda</SelectItem>
                        <SelectItem value="Negócios">Negócios</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                        <SelectItem value="Saúde">Saúde</SelectItem>
                        <SelectItem value="Culinária">Culinária</SelectItem>
                        <SelectItem value="Esportes">Esportes</SelectItem>
                        <SelectItem value="Infantil">Infantil</SelectItem>
                        <SelectItem value="Juvenil">Juvenil</SelectItem>
                        <SelectItem value="Didático">Didático</SelectItem>
                        <SelectItem value="Referência">Referência</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <Input
                      id="genero"
                      {...register('genero')}
                      placeholder="Drama, Comédia, Aventura..."
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classificacao_etaria">Classificação Etária</Label>
                    <Select
                      value={watchedValues.classificacao_etaria}
                      onValueChange={(value) => setValue('classificacao_etaria', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Livre">Livre</SelectItem>
                        <SelectItem value="10 anos">10 anos</SelectItem>
                        <SelectItem value="12 anos">12 anos</SelectItem>
                        <SelectItem value="14 anos">14 anos</SelectItem>
                        <SelectItem value="16 anos">16 anos</SelectItem>
                        <SelectItem value="18 anos">18 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel_dificuldade">Nível de Dificuldade</Label>
                    <Select
                      value={watchedValues.nivel_dificuldade}
                      onValueChange={(value) => setValue('nivel_dificuldade', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto</Label>
                  <Input
                    id="assunto"
                    {...register('assunto')}
                    placeholder="Tema principal do livro"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register('tags')}
                    placeholder="Palavras-chave separadas por vírgula"
                    disabled={isReadOnly}
                  />
                  <p className="text-xs text-gray-500">
                    Exemplo: programação, javascript, web development
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição Detalhada</Label>
                  <Textarea
                    id="descricao"
                    {...register('descricao')}
                    placeholder="Descrição mais completa do conteúdo..."
                    rows={4}
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA LOCALIZAÇÃO */}
          <TabsContent value="localizacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Localização Física</CardTitle>
                <CardDescription>Onde o livro está localizado na biblioteca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secao">Seção</Label>
                    <Input
                      id="secao"
                      {...register('secao')}
                      placeholder="Literatura, Ciências, etc."
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localizacao_estante">Localização na Estante</Label>
                    <Input
                      id="localizacao_estante"
                      {...register('localizacao_estante')}
                      placeholder="A1-B2, Estante 5 Prateleira 3"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="andar">Andar</Label>
                    <Select
                      value={watchedValues.andar}
                      onValueChange={(value) => setValue('andar', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o andar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Térreo">Térreo</SelectItem>
                        <SelectItem value="1º Andar">1º Andar</SelectItem>
                        <SelectItem value="2º Andar">2º Andar</SelectItem>
                        <SelectItem value="3º Andar">3º Andar</SelectItem>
                        <SelectItem value="Subsolo">Subsolo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sala">Sala</Label>
                    <Input
                      id="sala"
                      {...register('sala')}
                      placeholder="Sala 101, Acervo Principal"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA CONTROLE */}
          <TabsContent value="controle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Exemplares</CardTitle>
                <CardDescription>Gestão de quantidade e estado dos livros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exemplares_total">Exemplares Total *</Label>
                    <Input
                      id="exemplares_total"
                      type="number"
                      {...register('exemplares_total', { 
                        required: 'Número de exemplares é obrigatório',
                        min: { value: 1, message: 'Deve ter pelo menos 1 exemplar' }
                      })}
                      placeholder="1"
                      disabled={isReadOnly}
                    />
                    {errors.exemplares_total && <p className="text-sm text-red-600">{errors.exemplares_total.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
                    <Select
                      value={watchedValues.estado_conservacao}
                      onValueChange={(value) => setValue('estado_conservacao', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Bom">Bom</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Ruim">Ruim</SelectItem>
                        <SelectItem value="Péssimo">Péssimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                    <Input
                      id="data_aquisicao"
                      type="date"
                      {...register('data_aquisicao')}
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco_aquisicao">Preço de Aquisição (R$)</Label>
                    <Input
                      id="preco_aquisicao"
                      type="number"
                      step="0.01"
                      {...register('preco_aquisicao', { min: { value: 0, message: 'Preço não pode ser negativo' } })}
                      placeholder="0.00"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      {...register('fornecedor')}
                      placeholder="Livraria, editora, doação..."
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    {...register('observacoes')}
                    placeholder="Observações internas sobre o livro..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA CONFIGURAÇÕES */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações e Status</CardTitle>
                <CardDescription>Configurações de disponibilidade e destaque</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ativo">Livro Ativo</Label>
                    <p className="text-sm text-gray-500">
                      Livro aparece nas listagens e buscas
                    </p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={watchedValues.ativo}
                    onCheckedChange={(checked) => setValue('ativo', checked)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emprestavel">Disponível para Empréstimo</Label>
                    <p className="text-sm text-gray-500">
                      Usuários podem emprestar este livro
                    </p>
                  </div>
                  <Switch
                    id="emprestavel"
                    checked={watchedValues.emprestavel}
                    onCheckedChange={(checked) => setValue('emprestavel', checked)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="destaque">Livro em Destaque</Label>
                    <p className="text-sm text-gray-500">
                      Aparece na seção de livros em destaque
                    </p>
                  </div>
                  <Switch
                    id="destaque"
                    checked={watchedValues.destaque}
                    onCheckedChange={(checked) => setValue('destaque', checked)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_arquivo_digital">Arquivo Digital (URL)</Label>
                  <Input
                    id="url_arquivo_digital"
                    {...register('url_arquivo_digital')}
                    placeholder="https://exemplo.com/livro.pdf"
                    disabled={isReadOnly}
                  />
                  <p className="text-xs text-gray-500">
                    Link para versão digital do livro (opcional)
                  </p>
                </div>

                {/* Preview das configurações */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Preview das Configurações:</h4>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.ativo && (
                      <Badge variant="default">Ativo</Badge>
                    )}
                    {!watchedValues.ativo && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                    {watchedValues.emprestavel && (
                      <Badge variant="default">Emprestável</Badge>
                    )}
                    {!watchedValues.emprestavel && (
                      <Badge variant="destructive">Não Emprestável</Badge>
                    )}
                    {watchedValues.destaque && (
                      <Badge variant="default">Em Destaque</Badge>
                    )}
                    {watchedValues.estado_conservacao && (
                      <Badge variant="outline">{watchedValues.estado_conservacao}</Badge>
                    )}
                    {watchedValues.classificacao_etaria && (
                      <Badge variant="outline">{watchedValues.classificacao_etaria}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ModalFooter className="pt-6 mt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditing ? 'Atualizando...' : 'Criando...')
                : (isEditing ? 'Atualizar Livro' : 'Criar Livro')
              }
            </Button>
          )}
        </ModalFooter>
      </form>
    </div>
  )
}