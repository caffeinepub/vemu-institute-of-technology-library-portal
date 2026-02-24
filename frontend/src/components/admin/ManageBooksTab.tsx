import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllBooks } from '../../hooks/useQueries';
import AddBookModal from './AddBookModal';
import type { Book } from '../../backend';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';

export default function ManageBooksTab() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: books = [], isLoading } = useGetAllBooks();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const filtered = useMemo(() =>
    books.filter(b =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search)
    ), [books, search]);

  const handleDelete = async () => {
    if (!deleteBook || !actor) return;
    setIsDeleting(true);
    try {
      // Backend doesn't expose deleteBook directly; we note this limitation
      toast.error('Delete functionality is not available in the current backend version.');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to delete book');
    } finally {
      setIsDeleting(false);
      setDeleteBook(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">Manage Books</h2>
          <p className="text-muted-foreground text-sm">{books.length} books in collection</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-navy hover:bg-navy-light text-warm-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Author</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">ISBN</TableHead>
                <TableHead className="font-semibold text-center">Copies</TableHead>
                <TableHead className="font-semibold text-center">Available</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No books found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(book => (
                  <TableRow key={book.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium max-w-[200px]">
                      <span className="line-clamp-1 font-heading text-sm">{book.title}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{book.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{book.isbn}</TableCell>
                    <TableCell className="text-center text-sm">{Number(book.totalCopies)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={Number(book.availableCopies) > 0 ? 'default' : 'secondary'}
                        className={Number(book.availableCopies) > 0
                          ? 'bg-success/15 text-success border-success/20 text-xs'
                          : 'text-xs'
                        }
                      >
                        {Number(book.availableCopies)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteBook(book)}
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddBookModal open={addOpen} onClose={() => setAddOpen(false)} />

      <AlertDialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteBook?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
