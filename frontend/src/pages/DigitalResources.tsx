import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, BookOpen, Database, Video, FileText, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllDigitalResources } from '../hooks/useQueries';
import type { DigitalResource } from '../backend';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'e-books': BookOpen,
  'journals': FileText,
  'databases': Database,
  'video tutorials': Video,
  'websites': Globe,
};

function getCategoryIcon(category: string): React.ElementType {
  const lower = category.toLowerCase();
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Globe;
}

export default function DigitalResources() {
  const { data: resources = [], isLoading } = useGetAllDigitalResources();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo((): string[] => {
    return Array.from(new Set(resources.map((r) => r.category))).sort();
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [resources, search, selectedCategory]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search resources by title, description, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-navy text-warm-white border-navy dark:bg-gold dark:text-navy dark:border-gold'
              : 'bg-transparent text-muted-foreground border-border hover:border-navy/50 dark:hover:border-gold/50'
          }`}
        >
          All
        </button>
        {categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              selectedCategory === cat
                ? 'bg-navy text-warm-white border-navy dark:bg-gold dark:text-navy dark:border-gold'
                : 'bg-transparent text-muted-foreground border-border hover:border-navy/50 dark:hover:border-gold/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {resources.length} resources
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No resources found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource: DigitalResource) => {
            const Icon = getCategoryIcon(resource.category);
            return (
              <div key={resource.id} className="card-premium p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-navy/10 dark:bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-navy dark:text-gold" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {resource.category}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2 mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full gap-1.5 border-navy/30 text-navy dark:border-gold/30 dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5"
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Resource
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
