'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeScannerModal } from './qrcode-scanner-modal';
import { Camera, Search, Loader2 } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { Book } from '@/types/qrcode';

export function CreateLoanForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookSuggestions, setBookSuggestions] = useState<Book[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { selectedCompany } = useCompany();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Buscar livros conforme digita
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (bookSearch.length < 2) {
      setBookSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/books?search=${encodeURIComponent(bookSearch)}`,
          {
            headers: {
              'x-company-id': String(selectedCompany?.id || '')
            }
          }
        );
        const data = await response.json();
        
        if (data.data) {
          setBookSuggestions(data.data.slice(0, 5)); // Limitar a 5 sugestões
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce de 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [bookSearch, selectedCompany?.id]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookScanned = (book: Book) => {
    setSelectedBook(book);
    setBookSearch(book.title);
    setShowScanner(false);
    setShowSuggestions(false);
    // Focar no campo de usuário
    document.getElementById('user-search')?.focus();
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setBookSearch(book.title);
    setShowSuggestions(false);
    // Focar no campo de usuário
    document.getElementById('user-search')?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar criação de empréstimo
    console.log('Criar empréstimo:', { selectedBook, userSearch });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novo Empréstimo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de Livro */}
            <div className="space-y-2">
              <Label htmlFor="book-search">Livro</Label>
              <div className="flex gap-2">
                <div className="relative flex-1" ref={suggestionsRef}>
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="book-search"
                    placeholder="Buscar livro por título ou ISBN..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setSelectedBook(null);
                    }}
                    onFocus={() => {
                      if (bookSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  
                  {/* Sugestões de Livros */}
                  {showSuggestions && bookSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {bookSuggestions.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleSelectBook(book)}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          {book.isbn && (
                            <p className="text-xs text-muted-foreground mt-1">ISBN: {book.isbn}</p>
                          )}
                          <p className="text-xs text-green-600 mt-1">
                            {book.available_quantity > 0 
                              ? `✓ ${book.available_quantity} disponível(is)` 
                              : '✗ Indisponível'}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Nenhum resultado */}
                  {showSuggestions && bookSuggestions.length === 0 && !isSearching && bookSearch.length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum livro encontrado
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Escanear
                </Button>
              </div>
            </div>

            {/* Livro Selecionado */}
            {selectedBook && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">{selectedBook.title}</p>
                <p className="text-sm text-muted-foreground">{selectedBook.author}</p>
              </div>
            )}

            {/* Campo de Usuário */}
            <div className="space-y-2">
              <Label htmlFor="user-search">Usuário</Label>
              <Input
                id="user-search"
                placeholder="Buscar usuário por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Criar Empréstimo
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal do Scanner */}
      <QRCodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onBookFound={handleBookScanned}
        companyId={Number(selectedCompany?.id) || 0}
      />
    </>
  );
}
