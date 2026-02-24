import React, { useState, useMemo } from 'react';
import { Users, Search, Shield, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllUsers } from '../../hooks/useQueries';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncatePrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}...${p.slice(-6)}`;
}

export default function ManageUsersTab() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, error } = useGetAllUsers();

  const filtered = useMemo(() =>
    users.filter(([, profile]) =>
      !search ||
      profile.name.toLowerCase().includes(search.toLowerCase()) ||
      profile.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-bold">Manage Users</h2>
        <p className="text-muted-foreground text-sm">{users.length} registered members</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Principal</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-destructive">
                    Failed to load users
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(([principal, profile]) => (
                  <TableRow key={principal.toString()} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center flex-shrink-0">
                          {profile.role === 'admin'
                            ? <Shield className="w-3.5 h-3.5 text-navy dark:text-gold" />
                            : <User className="w-3.5 h-3.5 text-navy dark:text-gold" />
                          }
                        </div>
                        <span className="font-medium text-sm">{profile.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{profile.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {truncatePrincipal(principal.toString())}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={profile.role === 'admin' ? 'default' : 'secondary'}
                        className={profile.role === 'admin'
                          ? 'bg-navy text-warm-white text-xs'
                          : 'text-xs'
                        }
                      >
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(profile.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
