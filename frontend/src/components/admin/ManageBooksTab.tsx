import React, { useState, useContext } from 'react';
import { Plus, Trash2, Search, Pencil, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGetAllBooks, useDeleteBook } from '../../hooks/useQueries';
import { AuthContext } from '../../contexts/AuthContext';
import AddBookModal from './AddBookModal';
import { toast } from 'sonner';
import type { Book } from '../../backend';

export default function ManageBooksTab() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { userRole } = useContext(AuthContext);
  const { data: books = [], isLoading } = useGetAllBooks();
  const deleteMutation = useDeleteBook();

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (bookId: string, title: string) => {
    try {
      await deleteMutation.mutateAsync(bookId);
      toast.success(`"${title}" deleted successfully`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete book';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {userRole === 'admin' && (
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {books.length === 0 ? 'Add your first book to get started' : 'Try a different search'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Copies</TableHead>
                {userRole === 'admin' && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => {
                const available = Number(book.availableCopies);
                const total = Number(book.totalCopies);
                const isDeleting =
                  deleteMutation.isPending && deleteMutation.variables === book.id;

                return (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {book.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {book.isbn}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          available > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-destructive'
                        }
                      >
                        {available}/{total}
                      </span>
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingBook(book)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Book</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{book.title}"? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(book.id, book.title)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}

      {/* Edit Book Modal */}
      {editingBook && (
        <AddBookModal
          onClose={() => setEditingBook(null)}
          editBook={editingBook}
        />
      )}
    </div>
  );
}
