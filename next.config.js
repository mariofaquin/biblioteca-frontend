/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Desabilitar geração estática para páginas com useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Configurações de imagem
  images: {
    domains: ['localhost', '164.152.46.41'],
    unoptimized: true,
  },
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://164.152.46.41:8003',
  },
}

module.exports = nextConfig