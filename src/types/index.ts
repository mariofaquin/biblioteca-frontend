export interface Usuario {
  id: string
  nome: string
  email: string
  papel: 'admin' | 'usuario' | 'root'
  ativo: boolean
  data_criacao: string
  data_atualizacao: string
  eh_root?: boolean
  tem_multiplas_empresas?: boolean
  empresas?: Empresa[]
  empresa_id?: string
  nome_empresa?: string
  slug_empresa?: string
  token?: string
  telefone?: string
  cpf?: string
  endereco?: string
  data_nascimento?: string
  observacoes?: string
  ultimo_acesso?: string
  criado_por?: string
  atualizado_por?: string
}

export interface Empresa {
  id: string
  nome: string
  slug: string
  descricao?: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  site?: string
  logo_url?: string
  total_usuarios?: number
  total_livros?: number
  asaas_habilitado?: boolean
  ativa: boolean
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
}

export interface Book {
  // Identificação
  id: string
  titulo: string
  subtitulo?: string
  autor: string
  coautor?: string
  isbn?: string
  codigo_interno?: string
  codigo_barras?: string
  codigo_qr?: string

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
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
  tags?: string[]

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
  exemplares_disponiveis: number
  exemplares_total: number
  estado_conservacao?: 'Novo' | 'Bom' | 'Regular' | 'Ruim' | 'Péssimo'

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

  // Metadados
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
  empresa_id: string
}

// Interface para empréstimos
export interface Emprestimo {
  id: string
  usuario_id: string
  livro_id: string
  empresa_id: string
  data_emprestimo: string
  data_devolucao_prevista: string
  data_devolucao_real?: string
  status: 'ativo' | 'devolvido' | 'atrasado' | 'perdido'
  observacoes?: string
  multa_valor?: number
  multa_paga?: boolean
  renovacoes: number
  max_renovacoes: number
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
  
  // Dados relacionados (para exibição)
  usuario_nome?: string
  usuario_email?: string
  livro_titulo?: string
  livro_autor?: string
  livro_isbn?: string
  empresa_nome?: string
}

// Interface para reservas
export interface Reserva {
  id: string
  usuario_id: string
  livro_id: string
  empresa_id: string
  data_reserva: string
  data_expiracao: string
  status: 'ativa' | 'atendida' | 'cancelada' | 'expirada'
  posicao_fila: number
  observacoes?: string
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
  
  // Dados relacionados (para exibição)
  usuario_nome?: string
  usuario_email?: string
  livro_titulo?: string
  livro_autor?: string
  livro_isbn?: string
  empresa_nome?: string
}

// Interface para categorias
export interface Categoria {
  id: string
  nome: string
  descricao?: string
  cor?: string
  icone?: string
  ativa: boolean
  ordem: number
  empresa_id: string
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
  
  // Estatísticas
  total_livros?: number
}

// Interface para configurações do sistema
export interface ConfiguracaoSistema {
  id: string
  chave: string
  valor: string
  tipo: 'texto' | 'numero' | 'booleano' | 'json'
  descricao?: string
  categoria: string
  empresa_id?: string
  publica: boolean
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
}

// Interface para auditoria
export interface LogAuditoria {
  id: string
  usuario_id?: string
  empresa_id?: string
  acao: string
  tabela: string
  registro_id: string
  dados_anteriores?: any
  dados_novos?: any
  ip_address?: string
  user_agent?: string
  data_criacao: string
  
  // Dados relacionados
  usuario_nome?: string
  usuario_email?: string
  empresa_nome?: string
}

// Interface para notificações
export interface Notificacao {
  id: string
  usuario_id: string
  empresa_id: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  titulo: string
  mensagem: string
  lida: boolean
  data_leitura?: string
  link?: string
  dados_extras?: any
  data_criacao: string
  data_atualizacao: string
  
  // Dados relacionados
  usuario_nome?: string
  empresa_nome?: string
}

// Interface para relatórios
export interface Relatorio {
  id: string
  nome: string
  descricao?: string
  tipo: 'emprestimos' | 'reservas' | 'usuarios' | 'livros' | 'financeiro'
  parametros: any
  formato: 'pdf' | 'excel' | 'csv'
  status: 'processando' | 'concluido' | 'erro'
  arquivo_url?: string
  erro_mensagem?: string
  usuario_id: string
  empresa_id: string
  data_criacao: string
  data_atualizacao: string
  
  // Dados relacionados
  usuario_nome?: string
  empresa_nome?: string
}

// Interface para multas
export interface Multa {
  id: string
  emprestimo_id: string
  usuario_id: string
  empresa_id: string
  valor: number
  motivo: string
  status: 'pendente' | 'paga' | 'cancelada'
  data_vencimento: string
  data_pagamento?: string
  forma_pagamento?: string
  observacoes?: string
  data_criacao: string
  data_atualizacao: string
  criado_por?: string
  atualizado_por?: string
  
  // Dados relacionados
  usuario_nome?: string
  usuario_email?: string
  empresa_nome?: string
  livro_titulo?: string
}

// Interfaces para respostas da API
export interface RespostaPaginada<T> {
  dados: T[]
  pagina_atual: number
  ultima_pagina: number
  por_pagina: number
  total: number
}

export interface RespostaApi<T> {
  dados: T
  mensagem?: string
  erro?: string
  sucesso: boolean
}

// Interfaces para filtros
export interface FiltrosUsuario {
  busca?: string
  papel?: 'admin' | 'usuario' | 'root'
  ativo?: boolean
  empresa_id?: string
  por_pagina?: number
  pagina?: number
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

export interface FiltrosLivro {
  busca?: string
  categoria?: string
  autor?: string
  isbn?: string
  ativo?: boolean
  emprestavel?: boolean
  destaque?: boolean
  empresa_id?: string
  por_pagina?: number
  pagina?: number
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

export interface FiltrosEmprestimo {
  busca?: string
  status?: 'ativo' | 'devolvido' | 'atrasado' | 'perdido'
  usuario_id?: string
  livro_id?: string
  empresa_id?: string
  data_inicio?: string
  data_fim?: string
  por_pagina?: number
  pagina?: number
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

export interface FiltrosReserva {
  busca?: string
  status?: 'ativa' | 'atendida' | 'cancelada' | 'expirada'
  usuario_id?: string
  livro_id?: string
  empresa_id?: string
  data_inicio?: string
  data_fim?: string
  por_pagina?: number
  pagina?: number
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

// Interfaces para estatísticas
export interface EstatisticasGerais {
  total_usuarios: number
  total_livros: number
  total_emprestimos: number
  total_reservas: number
  emprestimos_ativos: number
  emprestimos_atrasados: number
  reservas_ativas: number
  multas_pendentes: number
  valor_multas_pendentes: number
}

export interface EstatisticasEmpresa {
  empresa_id: string
  empresa_nome: string
  total_usuarios: number
  total_livros: number
  total_emprestimos: number
  total_reservas: number
  emprestimos_mes: number
  reservas_mes: number
  usuarios_ativos: number
  livros_mais_emprestados: Array<{
    livro_id: string
    titulo: string
    autor: string
    total_emprestimos: number
  }>
}

// Interfaces para dashboard
export interface DadosDashboard {
  estatisticas_gerais: EstatisticasGerais
  emprestimos_recentes: Emprestimo[]
  reservas_pendentes: Reserva[]
  livros_populares: Array<{
    livro_id: string
    titulo: string
    autor: string
    total_emprestimos: number
  }>
  usuarios_ativos: Array<{
    usuario_id: string
    nome: string
    email: string
    total_emprestimos: number
  }>
  alertas: Array<{
    tipo: 'info' | 'aviso' | 'erro'
    titulo: string
    mensagem: string
    data: string
  }>
}