import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 API /api/books/search GET chamada');
  
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const companyId = url.searchParams.get('company_id');
    
    if (!code) {
      return NextResponse.json({
        error: 'Código é obrigatório',
      }, { status: 400 });
    }
    
    if (!companyId) {
      return NextResponse.json({
        error: 'company_id é obrigatório',
      }, { status: 400 });
    }
    
    // Buscar livro por ISBN, código de barras ou QR code
    const backendUrl = `http://localhost:8003/api/books?company_id=${companyId}`;
    
    console.log('🔗 Buscando livro no backend:', backendUrl);
    console.log('📝 Código para buscar:', code);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ Backend retornou erro: ${response.status}`);
      return NextResponse.json({
        error: 'Erro ao buscar livros',
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log(`📚 Livros encontrados: ${data.data?.length || 0}`);
    
    // Procurar livro que corresponda ao código
    const books = data.data || [];
    const book = books.find((b: any) => 
      b.isbn === code || 
      b.barcode === code || 
      b.qr_code === code ||
      b.tombo === code
    );
    
    if (book) {
      console.log('✅ Livro encontrado:', book.title);
      return NextResponse.json({
        book,
      });
    } else {
      console.log('❌ Nenhum livro encontrado com o código:', code);
      return NextResponse.json({
        book: null,
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na API books/search GET:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
