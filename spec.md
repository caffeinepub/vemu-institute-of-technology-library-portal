# Specification

## Summary
**Goal:** Fix broken data loading across the Student Dashboard, Admin Dashboard, and Book Catalog so that all existing features work correctly with real backend data.

**Planned changes:**
- Fix `getAllBooks` backend call wiring in `useQueries.ts` so the Book Catalog fetches and displays books from the canister instead of showing "Showing 0 of 0 books" / "No books found"
- Fix the Student Dashboard so the "Browse Books" tab renders the BookCatalog with data and the "My Borrowed Books" tab renders the user's borrow history
- Fix the Admin Dashboard so all four tabs (Overview, Manage Books, Manage Users, Borrow Records) load and display real data
- Audit `backend/main.mo` to ensure all methods called by the frontend (`getAllBooks`, `getAllUsers`, `getAllBorrowRecords`, `borrowBook`, `returnBook`, `reserveBook`, `cancelReservation`, `approveReservation`, `rejectReservation`, `addBook`, `editBook`, `deleteBook`, `getAllAnnouncements`, `getAllDigitalResources`, etc.) are implemented and publicly accessible
- Fix actor initialization and caching in `useActor.ts` so the authenticated actor is available before any React Query hooks attempt to call backend methods, preventing silent fetch skips due to null/undefined actor

**User-visible outcome:** Students can browse the full book catalog with search and category filtering, view their borrowed books, and admins can see real stats and manage books, users, and borrow records across all dashboard tabs.
