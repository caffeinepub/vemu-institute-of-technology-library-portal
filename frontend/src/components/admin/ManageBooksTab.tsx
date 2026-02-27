import React, { useState } from 'react';
import { useGetAllBooks, useDeleteBook } from '../../hooks/useQueries';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../backend';
import type { Book } from '../../backend';
import AddBookModal from './AddBookModal';
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
import { Plus, Search, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageBooksTab() {
  const { userRole } = useAuth();
  const isAdmin = userRole === UserRole.admin;

  const { data: books, isLoading } = useGetAllBooks();
  const deleteBookMutation = useDeleteBook();

  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = (books ?? []).filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (book: Book) => {
    try {
      await deleteBookMutation.mutateAsync(book.id);
      toast.success(`"${book.title}" deleted successfully.`);
    } catch (err) {
      toast.error('Failed to delete book. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Manage Books</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {books?.length ?? 0} books in the library
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddModalOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead className="text-center">Copies</TableHead>
              <TableHead className="text-center">Available</TableHead>
              {isAdmin && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: isAdmin ? 7 : 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-8 h-8 opacity-40" />
                    <p className="text-sm">No books found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{book.title}</TableCell>
                  <TableCell className="text-muted-foreground">{book.author}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{book.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{book.isbn}</TableCell>
                  <TableCell className="text-center">{Number(book.totalCopies)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={Number(book.availableCopies) > 0 ? 'default' : 'destructive'}
                    >
                      {Number(book.availableCopies)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Book</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{book.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(book)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAdmin && (
        <AddBookModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      )}
    </div>
  );
}
