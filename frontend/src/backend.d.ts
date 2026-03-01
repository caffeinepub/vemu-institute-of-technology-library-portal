import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DigitalResource {
    id: string;
    url: string;
    title: string;
    description: string;
    addedAt: Time;
    category: string;
}
export interface Reservation {
    id: string;
    status: ReservationStatus;
    userId: Principal;
    createdAt: Time;
    dueDate?: Time;
    bookId: string;
    updatedAt: Time;
}
export interface Book {
    id: string;
    title: string;
    availableCopies: bigint;
    file?: ExternalBlob;
    isbn: string;
    description: string;
    author: string;
    totalCopies: bigint;
    addedAt: Time;
    category: string;
}
export interface BookCreateData {
    title: string;
    file?: ExternalBlob;
    isbn: string;
    description: string;
    author: string;
    totalCopies: bigint;
    category: string;
}
export interface BorrowRecord {
    id: string;
    borrowedAt: Time;
    dueDate: Time;
    bookId: string;
    returnedAt?: Time;
}
export interface Announcement {
    id: string;
    title: string;
    publishDate: Time;
    body: string;
    createdAt: Time;
    updatedAt: Time;
    priority: AnnouncementPriority;
}
export interface AnnouncementCreateData {
    title: string;
    publishDate: Time;
    body: string;
    priority: AnnouncementPriority;
}
export interface UserProfile {
    name: string;
    joinedAt: Time;
    role: string;
    email: string;
}
export interface DigitalResourceCreateData {
    url: string;
    title: string;
    description: string;
    category: string;
}
export enum AnnouncementPriority {
    normal = "normal",
    urgent = "urgent"
}
export enum ReservationStatus {
    cancelled = "cancelled",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnnouncement(data: AnnouncementCreateData): Promise<string>;
    addBook(bookCreateData: BookCreateData): Promise<void>;
    addDigitalResource(data: DigitalResourceCreateData): Promise<string>;
    approveReservation(reservationId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    borrowBook(bookId: string): Promise<void>;
    cancelReservation(reservationId: string): Promise<void>;
    createReservation(bookId: string): Promise<string>;
    decrementActiveUsers(): Promise<void>;
    deleteAnnouncement(announcementId: string): Promise<void>;
    deleteBook(bookId: string): Promise<void>;
    deleteDigitalResource(resourceId: string): Promise<void>;
    editAnnouncement(announcementId: string, data: AnnouncementCreateData): Promise<void>;
    editBook(bookId: string, bookCreateData: BookCreateData): Promise<void>;
    editDigitalResource(resourceId: string, data: DigitalResourceCreateData): Promise<void>;
    getActiveUserCount(): Promise<bigint>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllBooksSortedByTitle(): Promise<Array<Book>>;
    getAllBorrowRecords(): Promise<Array<[Principal, Array<BorrowRecord>]>>;
    getAllDigitalResources(): Promise<Array<DigitalResource>>;
    getAllReservations(): Promise<Array<Reservation>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getBookById(id: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        overdueCount: bigint;
        booksBorrowed: bigint;
        totalUsers: bigint;
        totalBooks: bigint;
    }>;
    getMyBorrowHistory(): Promise<Array<BorrowRecord>>;
    getMyReservations(): Promise<Array<Reservation>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(): Promise<UserRole>;
    incrementActiveUsers(): Promise<void>;
    initialize(adminToken: string, userProvidedToken: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    rejectReservation(reservationId: string): Promise<void>;
    returnBook(bookId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
