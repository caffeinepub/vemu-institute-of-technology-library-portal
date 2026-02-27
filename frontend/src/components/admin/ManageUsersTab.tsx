import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllUsers } from '../../hooks/useQueries';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ManageUsersTab() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, error } = useGetAllUsers();

  const filteredUsers = users.filter(([principal, profile]) => {
    const q = search.toLowerCase();
    return (
      profile.name.toLowerCase().includes(q) ||
      profile.email.toLowerCase().includes(q) ||
      principal.toString().toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">Failed to load users</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length === 0
              ? 'No users have registered yet'
              : 'Try a different search term'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(([principal, profile]) => (
                <TableRow key={principal.toString()}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                    {principal.toString().slice(0, 12)}…
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(profile.joinedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
