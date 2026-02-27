import React, { useState } from 'react';
import { useAddDigitalResource } from '../../hooks/useQueries';
import type { DigitalResourceCreateData } from '../../backend';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['E-Books', 'Journals', 'Databases', 'Video Tutorials', 'Websites', 'Research Papers', 'Other'];

interface AddDigitalResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = { title: '', description: '', url: '', category: '' };

export default function AddDigitalResourceModal({ open, onOpenChange }: AddDigitalResourceModalProps) {
  const addMutation = useAddDigitalResource();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  const validate = (): boolean => {
    const newErrors: Partial<typeof EMPTY_FORM> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try { new URL(form.url); } catch { newErrors.url = 'Enter a valid URL'; }
    }
    if (!form.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: DigitalResourceCreateData = {
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
      category: form.category,
    };

    try {
      await addMutation.mutateAsync(data);
      toast.success(`"${form.title}" added successfully!`);
      setForm(EMPTY_FORM);
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Failed to add resource.');
    }
  };

  const handleChange = (field: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Digital Resource</DialogTitle>
          <DialogDescription>Add a new digital resource to the library collection.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dr-title">Title *</Label>
            <Input id="dr-title" value={form.title} onChange={handleChange('title')} placeholder="Resource title" />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dr-category">Category *</Label>
            <Select value={form.category} onValueChange={v => { setForm(p => ({ ...p, category: v })); if (errors.category) setErrors(p => ({ ...p, category: undefined })); }}>
              <SelectTrigger id="dr-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dr-url">URL *</Label>
            <Input id="dr-url" type="url" value={form.url} onChange={handleChange('url')} placeholder="https://example.com/resource" />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dr-description">Description *</Label>
            <Textarea id="dr-description" value={form.description} onChange={handleChange('description')} placeholder="Brief description of this resource" rows={3} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
