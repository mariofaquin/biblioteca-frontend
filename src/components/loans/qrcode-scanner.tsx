'use client';

import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export function QRCodeScanner({
  onScanSuccess,
  onScanError,
}: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevenir inicialização dupla (React Strict Mode)
    if (isInitializedRef.current) {
      return;
    }

    const initScanner = async () => {
      try {
        isInitializedRef.current = true;
        
        console.log('📷 Iniciando scanner ZXing...');
        
        // Criar leitor
        const codeReader = new BrowserMultiFormatReader();
        readerRef.current = codeReader;

        // Obter dispositivos de vídeo
        const videoInputDevices = await codeReader.listVideoInputDevices();
        console.log(`📹 ${videoInputDevices.length} câmeras encontradas`);

        if (videoInputDevices.length === 0) {
          throw new Error('Nenhuma câmera encontrada');
        }

        // Usar primeira câmera disponível
        const selectedDeviceId = videoInputDevices[0].deviceId;
        console.log(`✅ Usando câmera: ${videoInputDevices[0].label || 'Padrão'}`);

        // Iniciar decodificação contínua
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              console.log('✅ Código detectado:', result.getText());
              onScanSuccess(result.getText());
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error('❌ Erro no scanner:', error);
              onScanError?.(error.message);
            }
          }
        );

        console.log('🎥 Scanner iniciado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao iniciar scanner:', error);
        onScanError?.(error instanceof Error ? error.message : 'Erro desconhecido');
        isInitializedRef.current = false;
      }
    };

    initScanner();

    // Cleanup
    return () => {
      console.log('🛑 Parando scanner...');
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full rounded-lg"
        style={{ maxHeight: '400px', objectFit: 'cover' }}
      />
    </div>
  );
}
