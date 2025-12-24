'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeScanner } from './qrcode-scanner';
import { ScanDebouncer } from '@/lib/qrcode-utils';
import { QRCodeScannerModalProps, ScannerState, Book } from '@/types/qrcode';
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const debouncer = new ScanDebouncer();

export function QRCodeScannerModal({
  isOpen,
  onClose,
  onBookFound,
  companyId,
}: QRCodeScannerModalProps) {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    lastScannedCode: null,
    scannedBook: null,
    error: null,
    cameraPermission: 'unknown',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Buscar livro por código
  const fetchBookByCode = async (code: string): Promise<Book | null> => {
    try {
      const response = await fetch(
        `/api/books/search?code=${encodeURIComponent(code)}&company_id=${companyId}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar livro');
      }

      const data = await response.json();
      return data.book || null;
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      throw error;
    }
  };

  // Handler de sucesso do scan
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Verificar debounce
      if (!debouncer.shouldProcess(decodedText)) {
        return;
      }

      setState((prev) => ({ ...prev, lastScannedCode: decodedText, error: null }));
      setIsLoading(true);

      try {
        const book = await fetchBookByCode(decodedText);

        if (!book) {
          setState((prev) => ({
            ...prev,
            error: `Livro não encontrado com o código: ${decodedText}`,
            scannedBook: null,
          }));
          return;
        }

        if (book.available_quantity <= 0) {
          setState((prev) => ({
            ...prev,
            error: 'Este livro não está disponível para empréstimo.',
            scannedBook: book,
          }));
          return;
        }

        // Sucesso!
        setState((prev) => ({
          ...prev,
          scannedBook: book,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: 'Erro ao buscar informações do livro. Tente novamente.',
          scannedBook: null,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [companyId]
  );

  // Handler de erro do scan
  const handleScanError = useCallback((error: string) => {
    console.error('Erro no scanner:', error);
  }, []);

  // Confirmar livro selecionado
  const handleConfirm = () => {
    if (state.scannedBook) {
      onBookFound(state.scannedBook);
      handleClose();
    }
  };

  // Fechar modal e resetar estado
  const handleClose = () => {
    setState({
      isScanning: false,
      lastScannedCode: null,
      scannedBook: null,
      error: null,
      cameraPermission: 'unknown',
    });
    debouncer.reset();
    onClose();
  };

  // Tentar novamente
  const handleTryAgain = () => {
    setState((prev) => ({
      ...prev,
      error: null,
      scannedBook: null,
      lastScannedCode: null,
    }));
    debouncer.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="scanner-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código do Livro
          </DialogTitle>
        </DialogHeader>
        <p id="scanner-description" className="sr-only">
          Modal para escanear código de barras ou QR Code de livros usando a câmera
        </p>

        <div className="space-y-4">
          {/* Scanner */}
          {!state.scannedBook && !state.error && (
            <div className="space-y-3">
              <QRCodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
              
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando livro...
                </div>
              )}
              
              {!isLoading && (
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">📷 Dicas para melhor leitura:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Mantenha o código a <strong>20-30cm</strong> da câmera</li>
                      <li>• Código de barras: posicione <strong>horizontalmente</strong></li>
                      <li>• Certifique-se que há <strong>boa iluminação</strong></li>
                      <li>• Mantenha o código <strong>firme e centralizado</strong></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Livro encontrado */}
          {state.scannedBook && !state.error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Código Detectado!</span>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{state.scannedBook.title}</h3>
                <p className="text-sm text-muted-foreground">{state.scannedBook.author}</p>
                {state.scannedBook.isbn && (
                  <p className="text-xs text-muted-foreground">ISBN: {state.scannedBook.isbn}</p>
                )}
                <p className="text-sm text-green-600">
                  ✓ Disponível ({state.scannedBook.available_quantity} cópias)
                </p>
              </div>
            </div>
          )}

          {/* Erro */}
          {state.error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Erro</span>
              </div>

              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-sm text-red-800">{state.error}</p>
                {state.lastScannedCode && (
                  <p className="text-xs text-red-600 mt-2">Código: {state.lastScannedCode}</p>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            {state.scannedBook && !state.error ? (
              <>
                <Button variant="outline" onClick={handleTryAgain}>
                  Escanear Outro
                </Button>
                <Button onClick={handleConfirm}>Confirmar</Button>
              </>
            ) : state.error ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Digitar Manual
                </Button>
                <Button onClick={handleTryAgain}>Tentar Novamente</Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
