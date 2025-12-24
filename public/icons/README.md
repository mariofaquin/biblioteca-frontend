# Ícones do PWA

## 📱 Ícones Necessários

Para o PWA funcionar corretamente, você precisa criar ícones nos seguintes tamanhos:

- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## 🎨 Como Gerar os Ícones

### Opção 1: Gerador Online (Recomendado)

1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem 512x512px
3. Baixe todos os tamanhos gerados
4. Coloque nesta pasta

### Opção 2: Photoshop/GIMP

1. Crie uma imagem 512x512px
2. Redimensione para cada tamanho
3. Salve como PNG
4. Nomeie como: icon-{tamanho}.png

### Opção 3: Ferramenta CLI

```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo.png ./icons
```

## 📐 Especificações

- **Formato**: PNG
- **Fundo**: Transparente ou cor sólida
- **Design**: Simples e reconhecível
- **Cores**: Contrastantes

## 🎯 Dica

Use um ícone de livro (📚) ou biblioteca para representar o app.

## ✅ Checklist

- [ ] icon-72x72.png
- [ ] icon-96x96.png
- [ ] icon-128x128.png
- [ ] icon-144x144.png
- [ ] icon-152x152.png
- [ ] icon-192x192.png
- [ ] icon-384x384.png
- [ ] icon-512x512.png

## 🔗 Recursos Úteis

- https://www.flaticon.com/ (ícones grátis)
- https://www.canva.com/ (criar ícones)
- https://realfavicongenerator.net/ (gerador)
