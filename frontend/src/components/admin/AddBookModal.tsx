import React, { useState, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAddBook, useEditBook } from '../../hooks/useQueries';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import type { Book } from '../../backend';

interface AddBookModalProps {
  onClose: () => void;
  editBook?: Book | null;
}

interface FormState {
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  author: '',
  category: '',
  isbn: '',
  totalCopies: '1',
  description: '',
};

export default function AddBookModal({ onClose, editBook }: AddBookModalProps) {
  const { userRole } = useContext(AuthContext);
  const addMutation = useAddBook();
  const editMutation = useEditBook();

  const isEditing = !!editBook;

  const [form, setForm] = useState<FormState>(
    editBook
      ? {
          title: editBook.title,
          author: editBook.author,
          category: editBook.category,
          isbn: editBook.isbn,
          totalCopies: String(editBook.totalCopies),
          description: editBook.description,
        }
      : EMPTY_FORM
  );

  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author is required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (!form.isbn.trim()) newErrors.isbn = 'ISBN is required';
    const copies = parseInt(form.totalCopies, 10);
    if (isNaN(copies) || copies < 1) newErrors.totalCopies = 'Must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      toast.error('Only admins can manage books');
      return;
    }
    if (!validate()) return;

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      totalCopies: BigInt(parseInt(form.totalCopies, 10)),
      description: form.description.trim(),
    };

    try {
      if (isEditing && editBook) {
        await editMutation.mutateAsync({ bookId: editBook.id, bookData });
        toast.success(`"${form.title}" updated successfully`);
      } else {
        await addMutation.mutateAsync(bookData);
        toast.success(`"${form.title}" added successfully`);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      toast.error(message);
    }
  };

  const isPending = addMutation.isPending || editMutation.isPending;

  const renderField = (
    id: keyof FormState,
    label: string,
    type: string = 'text',
    placeholder?: string
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm((prev) => ({ ...prev, [id]: e.target.value }))}
        disabled={isPending}
        className={errors[id] ? 'border-destructive' : ''}
      />
      {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderField('title', 'Title', 'text', 'e.g. Introduction to Algorithms')}
          {renderField('author', 'Author', 'text', 'e.g. Thomas H. Cormen')}
          {renderField('category', 'Category', 'text', 'e.g. Computer Science')}
          {renderField('isbn', 'ISBN', 'text', 'e.g. 978-0-262-03384-8')}
          {renderField('totalCopies', 'Total Copies', 'number', '1')}

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the book..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              disabled={isPending}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving…' : 'Adding…'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Book'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
