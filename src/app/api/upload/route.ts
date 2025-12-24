import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API /api/upload chamada')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }
    
    console.log('📁 Arquivo recebido:', file.name, 'Tamanho:', file.size, 'bytes')
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `book-${timestamp}-${randomStr}.${extension}`
    
    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Salvar arquivo na pasta public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // Retornar caminho público
    const publicPath = `/uploads/${fileName}`
    
    console.log('✅ Arquivo salvo:', publicPath)
    
    return NextResponse.json({
      success: true,
      url: publicPath,
      fileName: fileName,
      size: file.size
    })
    
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}
