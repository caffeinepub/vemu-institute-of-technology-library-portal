import React, { useState } from 'react';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllBooks, useBorrowBook } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Book } from '../backend';

export default function BookCatalog() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: books = [], isLoading, error } = useGetAllBooks();
  const borrowMutation = useBorrowBook();

  // Derive unique categories from books
  const categories = React.useMemo(() => {
    const cats = new Set(books.map((b) => b.category));
    return Array.from(cats).sort();
  }, [books]);

  // Filter books based on search and category
  const filteredBooks = React.useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        search.trim() === '' ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, selectedCategory]);

  const handleBorrow = async (book: Book) => {
    try {
      await borrowMutation.mutateAsync(book.id);
      toast.success(`Successfully borrowed "${book.title}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to borrow book';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-foreground">Failed to load books</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredBooks.length} of {books.length} books
      </p>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-14 h-14 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {books.length === 0
              ? 'No books have been added to the library yet'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => {
            const available = Number(book.availableCopies);
            const total = Number(book.totalCopies);
            const isBorrowing =
              borrowMutation.isPending && borrowMutation.variables === book.id;

            return (
              <div
                key={book.id}
                className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Book Icon */}
                <div className="flex items-center justify-center h-24 bg-primary/10 rounded-lg">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <Badge variant="secondary" className="text-xs">
                    {book.category}
                  </Badge>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      available > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                    }
                  >
                    {available > 0 ? `${available}/${total} available` : 'Not available'}
                  </span>
                </div>

                {/* Borrow Button */}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={available === 0 || isBorrowing}
                  onClick={() => handleBorrow(book)}
                >
                  {isBorrowing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Borrowing…
                    </>
                  ) : available > 0 ? (
                    'Borrow'
                  ) : (
                    'Unavailable'
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
