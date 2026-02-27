import React, { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
import { useGetAllDigitalResources, useDeleteDigitalResource } from '../../hooks/useQueries';
import type { DigitalResource } from '../../backend';
import AddDigitalResourceModal from './AddDigitalResourceModal';
import EditDigitalResourceModal from './EditDigitalResourceModal';
import { toast } from 'sonner';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageDigitalResourcesTab() {
  const { data: resources = [], isLoading } = useGetAllDigitalResources();
  const deleteMutation = useDeleteDigitalResource();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<DigitalResource | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return resources.filter(r =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const handleDelete = async (resource: DigitalResource) => {
    try {
      await deleteMutation.mutateAsync(resource.id);
      toast.success(`"${resource.title}" deleted successfully.`);
    } catch (err) {
      toast.error('Failed to delete resource.');
    }
  };

  const handleEdit = (resource: DigitalResource) => {
    setEditResource(resource);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Digital Resources</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{resources.length} resources available</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Database className="w-8 h-8 opacity-40" />
                      <p className="text-sm">No resources found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium text-sm max-w-[160px] truncate">{resource.title}</TableCell>
                    <TableCell><Badge variant="secondary">{resource.category}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                      <span className="line-clamp-2">{resource.description}</span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-navy dark:text-gold hover:underline max-w-[140px] truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{resource.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(resource.addedAt)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(resource)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddDigitalResourceModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditDigitalResourceModal resource={editResource} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </div>
  );
}
