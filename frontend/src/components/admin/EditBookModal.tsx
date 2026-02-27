import React, { useState, useEffect } from 'react';
import { useEditBook } from '../../hooks/useQueries';
import type { Book, BookCreateData } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toForm = (book: Book | null) => ({
  title: book?.title ?? '',
  author: book?.author ?? '',
  category: book?.category ?? '',
  isbn: book?.isbn ?? '',
  totalCopies: book ? String(Number(book.totalCopies)) : '',
  description: book?.description ?? '',
});

export default function EditBookModal({ book, open, onOpenChange }: EditBookModalProps) {
  const editBookMutation = useEditBook();
  const [form, setForm] = useState(toForm(book));
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (book) setForm(toForm(book));
  }, [book]);

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author is required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (!form.isbn.trim()) newErrors.isbn = 'ISBN is required';
    const copies = parseInt(form.totalCopies, 10);
    if (isNaN(copies) || copies < 1) newErrors.totalCopies = 'Must be at least 1';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !validate()) return;

    const bookData: BookCreateData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      totalCopies: BigInt(parseInt(form.totalCopies, 10)),
      description: form.description.trim(),
    };

    try {
      await editBookMutation.mutateAsync({ bookId: book.id, bookData });
      toast.success(`"${form.title}" updated successfully!`);
      onOpenChange(false);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Failed to update book.');
    }
  };

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update the details for this book.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" value={form.title} onChange={handleChange('title')} placeholder="Book title" />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-author">Author *</Label>
              <Input id="edit-author" value={form.author} onChange={handleChange('author')} placeholder="Author name" />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Category *</Label>
              <Input id="edit-category" value={form.category} onChange={handleChange('category')} placeholder="e.g. Computer Science" />
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-isbn">ISBN *</Label>
              <Input id="edit-isbn" value={form.isbn} onChange={handleChange('isbn')} placeholder="978-0-000-00000-0" />
              {errors.isbn && <p className="text-xs text-destructive">{errors.isbn}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-copies">Total Copies *</Label>
            <Input
              id="edit-copies"
              type="number"
              min={1}
              value={form.totalCopies}
              onChange={handleChange('totalCopies')}
              placeholder="1"
            />
            {errors.totalCopies && <p className="text-xs text-destructive">{errors.totalCopies}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Brief description of the book"
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editBookMutation.isPending}>
              {editBookMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
