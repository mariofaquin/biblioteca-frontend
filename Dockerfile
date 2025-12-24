# =====================================================
# DOCKERFILE - FRONTEND NEXT.JS
# =====================================================
# Imagem otimizada para produção
# Versão: 1.0.26
# =====================================================

# Estágio 1: Dependências
FROM node:18-alpine AS deps

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# =====================================================
# Estágio 2: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Variáveis de ambiente para build
# Serão substituídas em runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Build da aplicação Next.js
RUN npm run build

# =====================================================
# Estágio 3: Produção
FROM node:18-alpine AS runner

WORKDIR /app

# Metadados
LABEL maintainer="Sistema Biblioteca"
LABEL version="1.0.26"
LABEL description="Frontend Next.js para Sistema de Biblioteca"

# Variáveis de ambiente
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Criar diretórios para uploads
RUN mkdir -p public/uploads && \
    chown -R nextjs:nodejs public/uploads

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar aplicação
CMD ["node", "server.js"]
