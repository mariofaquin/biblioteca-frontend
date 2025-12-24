// Script para limpar cache do localStorage
// Execute no console do navegador: localStorage.clear()

console.log('🧹 Limpando cache do sistema...')

// Limpar cache de livros
localStorage.removeItem('books_cache')
localStorage.removeItem('books_pending_sync')

// Limpar outros caches se existirem
localStorage.removeItem('users_cache')
localStorage.removeItem('companies_cache')

console.log('✅ Cache limpo! Recarregue a página para ver os dados atualizados.')