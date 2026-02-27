import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Book, BookCreateData, UserProfile, BorrowRecord, UserRole } from '../backend';

// ── Auth / Role ──────────────────────────────────────────────────────────────

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

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole();
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

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole();
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

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Books ────────────────────────────────────────────────────────────────────

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

  return useMutation<void, Error, BookCreateData>({
    mutationFn: async (bookData: BookCreateData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useEditBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { bookId: string; bookData: BookCreateData }>({
    mutationFn: async ({ bookId, bookData }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBook(bookId, bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

// ── Borrow / Return ──────────────────────────────────────────────────────────

export function useBorrowBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.borrowBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
    },
  });
}

export function useReturnBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.returnBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
    },
  });
}

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

// ── Admin ────────────────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[import('@dfinity/principal').Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllUsers();
      return result as [import('@dfinity/principal').Principal, UserProfile][];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllBorrowRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[import('@dfinity/principal').Principal, BorrowRecord[]][]>({
    queryKey: ['allBorrowRecords'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllBorrowRecords();
      return result as [import('@dfinity/principal').Principal, BorrowRecord[]][];
    },
    enabled: !!actor && !actorFetching,
  });
}

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
  });
}

export function useGetActiveUserCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['activeUserCount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveUserCount();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useIncrementActiveUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementActiveUsers();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeUserCount'] });
    },
  });
}

export function useDecrementActiveUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.decrementActiveUsers();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeUserCount'] });
    },
  });
}
