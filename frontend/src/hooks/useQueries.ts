import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Book,
  BookCreateData,
  BorrowRecord,
  UserProfile,
  UserRole,
  Reservation,
  DigitalResource,
  DigitalResourceCreateData,
  Announcement,
  AnnouncementCreateData,
} from '../backend';

// ── Books ─────────────────────────────────────────────────────────────────

export function useGetAllBooks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBooksSortedByTitle();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: BookCreateData) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addBook(bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useEditBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, bookData }: { bookId: string; bookData: BookCreateData }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editBook(bookId, bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Borrow / Return ───────────────────────────────────────────────────────

export function useBorrowBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.borrowBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['allBorrowRecords'] });
    },
  });
}

export function useReturnBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.returnBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['allBorrowRecords'] });
    },
  });
}

export function useGetMyBorrowHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<BorrowRecord[]>({
    queryKey: ['myBorrowHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyBorrowHistory();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    staleTime: 30_000,
  });
}

// ── Reservations ──────────────────────────────────────────────────────────

export function useGetMyReservations() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Reservation[]>({
    queryKey: ['myReservations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyReservations();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useCreateReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReservation(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useCancelReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.cancelReservation(reservationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
    },
  });
}

export function useGetAllReservations() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Reservation[]>({
    queryKey: ['allReservations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllReservations();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useApproveReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveReservation(reservationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useRejectReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectReservation(reservationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });
}

// ── Digital Resources ─────────────────────────────────────────────────────

export function useGetAllDigitalResources() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DigitalResource[]>({
    queryKey: ['allDigitalResources'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDigitalResources();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useAddDigitalResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DigitalResourceCreateData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDigitalResource(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDigitalResources'] });
    },
  });
}

export function useEditDigitalResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resourceId, data }: { resourceId: string; data: DigitalResourceCreateData }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editDigitalResource(resourceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDigitalResources'] });
    },
  });
}

export function useDeleteDigitalResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteDigitalResource(resourceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDigitalResources'] });
    },
  });
}

// ── Announcements ─────────────────────────────────────────────────────────

export function useGetAllAnnouncements() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['allAnnouncements'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useAddAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnnouncementCreateData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
    },
  });
}

export function useEditAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ announcementId, data }: { announcementId: string; data: AnnouncementCreateData }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editAnnouncement(announcementId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAnnouncement(announcementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
    },
  });
}

// ── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
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
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── User Role ─────────────────────────────────────────────────────────────

export function useGetUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole() as Promise<UserRole>;
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 60_000,
  });
}

// Alias for backward compatibility
export { useGetUserRole as useGetCallerRole };
export { useGetUserRole as useGetCallerUserRole };

// ── Admin: Dashboard Stats ────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<{
    totalBooks: bigint;
    totalUsers: bigint;
    booksBorrowed: bigint;
    overdueCount: bigint;
  }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Admin: All Users ──────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[import('@dfinity/principal').Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getAllUsers();
      return result as [import('@dfinity/principal').Principal, UserProfile][];
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 30_000,
  });
}

// ── Admin: All Borrow Records ─────────────────────────────────────────────

export function useGetAllBorrowRecords() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[import('@dfinity/principal').Principal, BorrowRecord[]][]>({
    queryKey: ['allBorrowRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getAllBorrowRecords();
      return result as [import('@dfinity/principal').Principal, BorrowRecord[]][];
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 30_000,
  });
}

// ── Admin: Active User Count ──────────────────────────────────────────────

export function useGetActiveUserCount() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['activeUserCount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveUserCount();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

// ── Active Session Tracking ───────────────────────────────────────────────

export function useIncrementActiveUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.incrementActiveUsers();
    },
  });
}

export function useDecrementActiveUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.decrementActiveUsers();
    },
  });
}
