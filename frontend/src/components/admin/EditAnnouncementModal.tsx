import React, { useState, useEffect } from 'react';
import { useEditAnnouncement } from '../../hooks/useQueries';
import type { Announcement, AnnouncementCreateData } from '../../backend';
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

interface EditAnnouncementModalProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function nsToDateStr(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toISOString().split('T')[0];
}

export default function EditAnnouncementModal({ announcement, open, onOpenChange }: EditAnnouncementModalProps) {
  const editMutation = useEditAnnouncement();
  const [form, setForm] = useState({
    title: '',
    body: '',
    priority: AnnouncementPriority.normal as AnnouncementPriority,
    publishDate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title,
        body: announcement.body,
        priority: announcement.priority,
        publishDate: nsToDateStr(announcement.publishDate),
      });
    }
  }, [announcement]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.body.trim()) newErrors.body = 'Body is required';
    if (!form.publishDate) newErrors.publishDate = 'Publish date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement || !validate()) return;

    const publishDateMs = new Date(form.publishDate).getTime();
    const data: AnnouncementCreateData = {
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      publishDate: BigInt(publishDateMs) * BigInt(1_000_000),
    };

    try {
      await editMutation.mutateAsync({ announcementId: announcement.id, data });
      toast.success(`Announcement updated successfully!`);
      onOpenChange(false);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Failed to update announcement.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>Update this announcement on the notice board.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="eann-title">Title *</Label>
            <Input
              id="eann-title"
              value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
              placeholder="Announcement title"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eann-priority">Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={v => setForm(p => ({ ...p, priority: v as AnnouncementPriority }))}
              >
                <SelectTrigger id="eann-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnnouncementPriority.normal}>Normal</SelectItem>
                  <SelectItem value={AnnouncementPriority.urgent}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eann-date">Publish Date *</Label>
              <Input
                id="eann-date"
                type="date"
                value={form.publishDate}
                onChange={e => { setForm(p => ({ ...p, publishDate: e.target.value })); if (errors.publishDate) setErrors(p => ({ ...p, publishDate: undefined })); }}
              />
              {errors.publishDate && <p className="text-xs text-destructive">{errors.publishDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eann-body">Body *</Label>
            <Textarea
              id="eann-body"
              value={form.body}
              onChange={e => { setForm(p => ({ ...p, body: e.target.value })); if (errors.body) setErrors(p => ({ ...p, body: undefined })); }}
              placeholder="Write the announcement content here..."
              rows={5}
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
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
