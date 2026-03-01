import React, { useState, useContext, useEffect, useRef } from 'react';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import { ExternalBlob } from '../../backend';

interface AddBookModalProps {
  open: boolean;
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

export default function AddBookModal({ open, onClose, editBook }: AddBookModalProps) {
  const { userRole } = useContext(AuthContext);
  const addMutation = useAddBook();
  const editMutation = useEditBook();

  const isEditing = !!editBook;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or editBook changes
  useEffect(() => {
    if (open) {
      if (editBook) {
        setForm({
          title: editBook.title,
          author: editBook.author,
          category: editBook.category,
          isbn: editBook.isbn,
          totalCopies: String(editBook.totalCopies),
          description: editBook.description,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, editBook]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsBytes = (file: File): Promise<Uint8Array<ArrayBuffer>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        resolve(new Uint8Array(buffer) as Uint8Array<ArrayBuffer>);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      toast.error('Only admins can manage books');
      return;
    }
    if (!validate()) return;

    let fileBlob: ExternalBlob | undefined = undefined;

    // If editing and no new file selected, preserve existing file
    if (isEditing && editBook && !selectedFile) {
      fileBlob = editBook.file ?? undefined;
    }

    // If a new file is selected, prepare the ExternalBlob
    if (selectedFile) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const bytes = await readFileAsBytes(selectedFile);
        fileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
      } catch {
        toast.error('Failed to read the selected file');
        setIsUploading(false);
        return;
      }
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      totalCopies: BigInt(parseInt(form.totalCopies, 10)),
      description: form.description.trim(),
      file: fileBlob,
    };

    try {
      if (isEditing && editBook) {
        await editMutation.mutateAsync({ bookId: editBook.id, bookData });
        toast.success(`"${form.title}" updated successfully`);
      } else {
        await addMutation.mutateAsync(bookData);
        toast.success(`"${form.title}" added successfully`);
      }
      setIsUploading(false);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      toast.error(message);
      setIsUploading(false);
    }
  };

  const isPending = addMutation.isPending || editMutation.isPending || isUploading;

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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              Book File{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>

            {/* Show existing file info when editing */}
            {isEditing && editBook?.file && !selectedFile && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm text-muted-foreground">
                <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                <span className="flex-1 truncate">Current file: Uploaded ✓</span>
                <span className="text-xs">(select a new file to replace)</span>
              </div>
            )}

            {/* File input area */}
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a PDF or ePub file
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, EPUB supported</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50">
                <FileText className="w-5 h-5 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={clearFile}
                  disabled={isPending}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />

            {/* Upload progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading file…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading…' : isEditing ? 'Saving…' : 'Adding…'}
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
