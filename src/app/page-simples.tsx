import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            BiblioTech
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema Completo de Biblioteca
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            {/* Landing Page */}
            <Link href="/landing" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-blue-600 text-3xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold mb-2">Landing Page</h3>
              <p className="text-gray-600">Página inicial com planos e preços</p>
            </Link>

            {/* Checkout */}
            <Link href="/checkout" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-3xl mb-4">💳</div>
              <h3 className="text-lg font-semibold mb-2">Checkout</h3>
              <p className="text-gray-600">Contratação e pagamento</p>
            </Link>

            {/* API Test */}
            <a href="http://localhost:8003/api/health" target="_blank" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-purple-600 text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold mb-2">API Health</h3>
              <p className="text-gray-600">Testar backend PostgreSQL</p>
            </a>

            {/* Books API */}
            <a href="http://localhost:8003/api/books" target="_blank" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-orange-600 text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">API Books</h3>
              <p className="text-gray-600">Livros do PostgreSQL</p>
            </a>

            {/* Categories API */}
            <a href="http://localhost:8003/api/books/categories" target="_blank" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-red-600 text-3xl mb-4">🏷️</div>
              <h3 className="text-lg font-semibold mb-2">API Categories</h3>
              <p className="text-gray-600">Categorias do PostgreSQL</p>
            </a>

            {/* Payment Success */}
            <Link href="/payment/success" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-3xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">Pagamento Sucesso</h3>
              <p className="text-gray-600">Página de confirmação</p>
            </Link>

          </div>

          <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Status do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h3 className="font-semibold text-green-600">✅ Funcionando</h3>
                <ul className="text-sm text-gray-600 mt-2">
                  <li>• Backend PostgreSQL</li>
                  <li>• APIs de livros e categorias</li>
                  <li>• Sistema de pagamento Asaas</li>
                  <li>• Landing page</li>
                  <li>• Checkout completo</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600">🔧 Informações</h3>
                <ul className="text-sm text-gray-600 mt-2">
                  <li>• Backend: localhost:8003</li>
                  <li>• Frontend: localhost:3000</li>
                  <li>• PostgreSQL: 178.156.133.86</li>
                  <li>• Versão: v1.0.31</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}