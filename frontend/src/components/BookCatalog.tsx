import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Loader2, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllBooks, useBorrowBook } from '../hooks/useQueries';
import type { Book } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function BookCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { data: books = [], isLoading } = useGetAllBooks();
  const borrowBook = useBorrowBook();
  const [borrowingId, setBorrowingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(books.map(b => b.category))).sort();
    return cats;
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || book.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const handleBorrow = async (book: Book) => {
    setBorrowingId(book.id);
    try {
      await borrowBook.mutateAsync(book.id);
      toast.success(`"${book.title}" borrowed successfully! Due in 14 days.`);
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {books.length} books
      </p>

      {/* Book Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No books found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(book => {
            const available = Number(book.availableCopies);
            const total = Number(book.totalCopies);
            const isBorrowing = borrowingId === book.id;

            return (
              <div key={book.id} className="card-premium p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-navy/10 dark:bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <BookMarked className="w-5 h-5 text-navy dark:text-gold" />
                  </div>
                  <Badge
                    variant={available > 0 ? 'default' : 'secondary'}
                    className={available > 0
                      ? 'bg-success/15 text-success border-success/20 text-xs'
                      : 'bg-muted text-muted-foreground text-xs'
                    }
                  >
                    {available > 0 ? `${available}/${total} available` : 'Unavailable'}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {book.category}
                  </Badge>
                </div>

                {book.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}

                <Button
                  size="sm"
                  onClick={() => handleBorrow(book)}
                  disabled={available === 0 || isBorrowing}
                  className="w-full bg-navy hover:bg-navy-light text-warm-white disabled:opacity-50 gap-1.5"
                >
                  {isBorrowing ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Borrowing...</>
                  ) : available === 0 ? (
                    'Not Available'
                  ) : (
                    'Borrow Book'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
