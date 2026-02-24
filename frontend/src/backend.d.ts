import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Book {
    id: string;
    title: string;
    availableCopies: bigint;
    isbn: string;
    description: string;
    author: string;
    totalCopies: bigint;
    addedAt: Time;
    category: string;
}
export type Time = bigint;
export interface BookCreateData {
    title: string;
    isbn: string;
    description: string;
    author: string;
    totalCopies: bigint;
    category: string;
}
export interface UserProfile {
    name: string;
    joinedAt: Time;
    role: string;
    email: string;
}
export interface BorrowRecord {
    id: string;
    borrowedAt: Time;
    dueDate: Time;
    bookId: string;
    returnedAt?: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(bookCreateData: BookCreateData): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    borrowBook(bookId: string): Promise<void>;
    getAllBooksSortedByTitle(): Promise<Array<Book>>;
    getAllBorrowRecords(): Promise<Array<[Principal, Array<BorrowRecord>]>>;
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
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    returnBook(bookId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
