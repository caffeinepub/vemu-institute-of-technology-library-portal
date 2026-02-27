import React, { useState } from 'react';
import { useAddAnnouncement } from '../../hooks/useQueries';
import type { AnnouncementCreateData } from '../../backend';
import { AnnouncementPriority } from '../../backend';
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

interface AddAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  title: '',
  body: '',
  priority: AnnouncementPriority.normal as AnnouncementPriority,
  publishDate: todayStr(),
};

export default function AddAnnouncementModal({ open, onOpenChange }: AddAnnouncementModalProps) {
  const addMutation = useAddAnnouncement();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.body.trim()) newErrors.body = 'Body is required';
    if (!form.publishDate) newErrors.publishDate = 'Publish date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const publishDateMs = new Date(form.publishDate).getTime();
    const data: AnnouncementCreateData = {
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      publishDate: BigInt(publishDateMs) * BigInt(1_000_000),
    };

    try {
      await addMutation.mutateAsync(data);
      toast.success(`Announcement "${form.title}" published!`);
      setForm({ ...EMPTY_FORM, publishDate: todayStr() });
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Failed to add announcement.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Announcement</DialogTitle>
          <DialogDescription>Post a new announcement to the notice board.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">Title *</Label>
            <Input
              id="ann-title"
              value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
              placeholder="Announcement title"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ann-priority">Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={v => setForm(p => ({ ...p, priority: v as AnnouncementPriority }))}
              >
                <SelectTrigger id="ann-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnnouncementPriority.normal}>Normal</SelectItem>
                  <SelectItem value={AnnouncementPriority.urgent}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-date">Publish Date *</Label>
              <Input
                id="ann-date"
                type="date"
                value={form.publishDate}
                onChange={e => { setForm(p => ({ ...p, publishDate: e.target.value })); if (errors.publishDate) setErrors(p => ({ ...p, publishDate: undefined })); }}
              />
              {errors.publishDate && <p className="text-xs text-destructive">{errors.publishDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ann-body">Body *</Label>
            <Textarea
              id="ann-body"
              value={form.body}
              onChange={e => { setForm(p => ({ ...p, body: e.target.value })); if (errors.body) setErrors(p => ({ ...p, body: undefined })); }}
              placeholder="Write the announcement content here..."
              rows={5}
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : 'Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
