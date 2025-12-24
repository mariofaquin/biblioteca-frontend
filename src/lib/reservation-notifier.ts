// Sistema global de notificação de reservas
// Este módulo garante que as notificações funcionem mesmo quando o componente não está montado

let isInitialized = false

export function initializeReservationNotifier() {
  if (isInitialized) return
  
  console.log('🔔 Inicializando sistema de notificação de reservas')
  
  // Listener global para evento de reserva pronta
  window.addEventListener('reservationReady', (event: any) => {
    console.log('🔔 [Global] Evento reservationReady recebido:', event.detail)
    
    // Mostrar alerta imediatamente
    const { reservation, bookTitle } = event.detail
    
    // Alert para garantir que o usuário veja
    alert(`🎉 Boa Notícia!\n\nO livro "${bookTitle}" que você reservou está disponível para retirada!\n\nVá para a aba "Reservas" para efetivar o empréstimo.`)
    
    // Tentar mostrar notificação do navegador
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('📚 Livro Disponível!', {
          body: `O livro "${bookTitle}" está disponível para retirada!`,
          icon: '/book-icon.png',
          tag: 'reservation-' + reservation.id,
          requireInteraction: true
        })
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('📚 Livro Disponível!', {
              body: `O livro "${bookTitle}" está disponível para retirada!`,
              icon: '/book-icon.png',
              tag: 'reservation-' + reservation.id,
              requireInteraction: true
            })
          }
        })
      }
    }
  })
  
  // Solicitar permissão para notificações
  if ('Notification' in window && Notification.permission === 'default') {
    console.log('📢 Solicitando permissão para notificações')
    Notification.requestPermission().then(permission => {
      console.log('📢 Permissão para notificações:', permission)
    })
  }
  
  isInitialized = true
  console.log('✅ Sistema de notificação inicializado')
}

// Função para testar o sistema
export function testReservationNotification() {
  const testEvent = new CustomEvent('reservationReady', {
    detail: {
      reservation: {
        id: 'test-123',
        book_title: 'Livro de Teste',
        book_author: 'Autor de Teste',
        book_cover_image: ''
      },
      bookTitle: 'Livro de Teste'
    }
  })
  
  window.dispatchEvent(testEvent)
  console.log('🧪 Evento de teste disparado')
}
