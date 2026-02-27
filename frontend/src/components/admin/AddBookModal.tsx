import React, { useState } from 'react';
import { useAddBook } from '../../hooks/useQueries';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../backend';
import type { BookCreateData } from '../../backend';
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
import { toast } from 'sonner';

interface AddBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = {
  title: '',
  author: '',
  category: '',
  isbn: '',
  totalCopies: '',
  description: '',
};

export default function AddBookModal({ open, onOpenChange }: AddBookModalProps) {
  const { userRole } = useAuth();
  const addBookMutation = useAddBook();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  // Defense-in-depth: don't render for non-admins
  if (userRole !== UserRole.admin) return null;

  const validate = (): boolean => {
    const newErrors: Partial<typeof EMPTY_FORM> = {};
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
    if (!validate()) return;

    const bookData: BookCreateData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      totalCopies: BigInt(parseInt(form.totalCopies, 10)),
      description: form.description.trim(),
    };

    try {
      await addBookMutation.mutateAsync(bookData);
      toast.success(`"${form.title}" added to the library!`);
      setForm(EMPTY_FORM);
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes('ISBN already exists') ? 'A book with this ISBN already exists.' : 'Failed to add book. Please try again.');
    }
  };

  const handleChange = (field: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new book to the library catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="Book title"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={form.author}
                onChange={handleChange('author')}
                placeholder="Author name"
              />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={handleChange('category')}
                placeholder="e.g. Computer Science"
              />
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={handleChange('isbn')}
                placeholder="978-0-000-00000-0"
              />
              {errors.isbn && <p className="text-xs text-destructive">{errors.isbn}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="totalCopies">Total Copies *</Label>
            <Input
              id="totalCopies"
              type="number"
              min={1}
              value={form.totalCopies}
              onChange={handleChange('totalCopies')}
              placeholder="1"
            />
            {errors.totalCopies && <p className="text-xs text-destructive">{errors.totalCopies}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Brief description of the book…"
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addBookMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addBookMutation.isPending}>
              {addBookMutation.isPending && (
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              )}
              Add Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
