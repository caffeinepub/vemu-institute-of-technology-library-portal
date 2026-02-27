import React, { useState, useEffect } from 'react';
import { useEditDigitalResource } from '../../hooks/useQueries';
import type { DigitalResource, DigitalResourceCreateData } from '../../backend';
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

interface EditDigitalResourceModalProps {
  resource: DigitalResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDigitalResourceModal({ resource, open, onOpenChange }: EditDigitalResourceModalProps) {
  const editMutation = useEditDigitalResource();
  const [form, setForm] = useState({ title: '', description: '', url: '', category: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (resource) {
      setForm({
        title: resource.title,
        description: resource.description,
        url: resource.url,
        category: resource.category,
      });
    }
  }, [resource]);

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {};
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
    if (!resource || !validate()) return;

    const data: DigitalResourceCreateData = {
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
      category: form.category,
    };

    try {
      await editMutation.mutateAsync({ resourceId: resource.id, data });
      toast.success(`"${form.title}" updated successfully!`);
      onOpenChange(false);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Failed to update resource.');
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
          <DialogTitle>Edit Digital Resource</DialogTitle>
          <DialogDescription>Update the details for this resource.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edr-title">Title *</Label>
            <Input id="edr-title" value={form.title} onChange={handleChange('title')} placeholder="Resource title" />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edr-category">Category *</Label>
            <Select value={form.category} onValueChange={v => { setForm(p => ({ ...p, category: v })); if (errors.category) setErrors(p => ({ ...p, category: undefined })); }}>
              <SelectTrigger id="edr-category">
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
            <Label htmlFor="edr-url">URL *</Label>
            <Input id="edr-url" type="url" value={form.url} onChange={handleChange('url')} placeholder="https://example.com/resource" />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edr-description">Description *</Label>
            <Textarea id="edr-description" value={form.description} onChange={handleChange('description')} placeholder="Brief description" rows={3} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
