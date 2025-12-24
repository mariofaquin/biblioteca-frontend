// Utilitários para QR Code Scanner
import { Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Tipos
export interface ScannerConfig {
  fps: number;
  qrbox: { width: number; height: number };
  aspectRatio: number;
  formatsToSupport: Html5QrcodeSupportedFormats[];
}

export interface ScanResult {
  decodedText: string;
  format: string;
  timestamp: number;
}

// Configuração padrão do scanner
export const defaultScannerConfig: ScannerConfig = {
  fps: 10,
  qrbox: { width: 300, height: 150 }, // Retângulo horizontal para códigos de barras
  aspectRatio: 1.777778, // 16:9 para melhor visualização
  formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
  ],
};

// Debounce para evitar leituras duplicadas
export class ScanDebouncer {
  private lastScannedCode: string = '';
  private lastScanTime: number = 0;
  private readonly debounceTime: number = 2000; // 2 segundos

  shouldProcess(code: string): boolean {
    const now = Date.now();
    
    if (code === this.lastScannedCode && now - this.lastScanTime < this.debounceTime) {
      return false;
    }
    
    this.lastScannedCode = code;
    this.lastScanTime = now;
    return true;
  }

  reset(): void {
    this.lastScannedCode = '';
    this.lastScanTime = 0;
  }
}
