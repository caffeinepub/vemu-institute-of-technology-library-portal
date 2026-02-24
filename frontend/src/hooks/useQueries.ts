import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Book, BookCreateData, UserProfile, BorrowRecord } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
    },
  });
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ── Books ─────────────────────────────────────────────────────────────────────

export function useGetAllBooks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooksSortedByTitle();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookCreateData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useBorrowBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.borrowBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useReturnBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.returnBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Borrow Records ────────────────────────────────────────────────────────────

export function useGetMyBorrowHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BorrowRecord[]>({
    queryKey: ['myBorrowHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBorrowHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    overdueCount: bigint;
    booksBorrowed: bigint;
    totalUsers: bigint;
    totalBooks: bigint;
  }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetAllBorrowRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Principal, BorrowRecord[]][]>({
    queryKey: ['allBorrowRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBorrowRecords();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
