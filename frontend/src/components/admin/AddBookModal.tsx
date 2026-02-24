import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddBook } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  author: string;
  category: string;
  isbn: string;
  description: string;
  totalCopies: string;
}

const initialForm: FormData = {
  title: '', author: '', category: '', isbn: '', description: '', totalCopies: '1',
};

export default function AddBookModal({ open, onClose }: AddBookModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const addBook = useAddBook();

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.author.trim()) errs.author = 'Author is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.isbn.trim()) errs.isbn = 'ISBN is required';
    const copies = parseInt(form.totalCopies);
    if (isNaN(copies) || copies < 1) errs.totalCopies = 'Must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addBook.mutateAsync({
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        isbn: form.isbn.trim(),
        description: form.description.trim(),
        totalCopies: BigInt(parseInt(form.totalCopies)),
      });
      toast.success(`"${form.title}" added to the library!`);
      setForm(initialForm);
      setErrors({});
      onClose();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add book');
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
    className: errors[key] ? 'border-destructive' : '',
  });

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : undefined}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Book</DialogTitle>
          <DialogDescription>Fill in the details to add a book to the library collection.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="book-title">Title *</Label>
              <Input id="book-title" placeholder="Book title" {...field('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book-author">Author *</Label>
              <Input id="book-author" placeholder="Author name" {...field('author')} />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book-category">Category *</Label>
              <Input id="book-category" placeholder="e.g. Computer Science" {...field('category')} />
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book-isbn">ISBN *</Label>
              <Input id="book-isbn" placeholder="978-..." {...field('isbn')} />
              {errors.isbn && <p className="text-xs text-destructive">{errors.isbn}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book-copies">Total Copies *</Label>
              <Input id="book-copies" type="number" min="1" {...field('totalCopies')} />
              {errors.totalCopies && <p className="text-xs text-destructive">{errors.totalCopies}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="book-desc">Description</Label>
              <Textarea
                id="book-desc"
                placeholder="Brief description of the book..."
                rows={3}
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={addBook.isPending}
              className="bg-navy hover:bg-navy-light text-warm-white gap-2"
            >
              {addBook.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Book'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
