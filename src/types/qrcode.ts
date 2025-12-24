// Tipos para QR Code Scanner

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  barcode?: string;
  cover_url?: string;
  available_quantity: number;
  total_quantity: number;
}

export interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (error: string) => void;
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
}

export interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookFound: (book: Book) => void;
  companyId: number;
}

export interface ScannerState {
  isScanning: boolean;
  lastScannedCode: string | null;
  scannedBook: Book | null;
  error: string | null;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
}
