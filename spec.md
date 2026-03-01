# Specification

## Summary
**Goal:** Fix broken admin panel buttons (Add Book, Manage Users) and add book file upload capability for admins in the VEMU Library Portal.

**Planned changes:**
- Fix the Add Book button in ManageBooksTab so it reliably opens the AddBookModal, with all form fields (title, author, category, ISBN, copies, description) interactive, validated, and wired to the add-book mutation
- Fix the Manage Users button/tab in AdminDashboard so it correctly switches to ManageUsersTab, displaying a full user list (name, email, principal, role, join date) with a working search input
- Add a file upload field (PDF/ePub) to AddBookModal and EditBookModal, showing the selected filename and a success/error indicator on upload
- Update the backend Motoko actor to store an optional file blob field on the Book type and expose an upload call
- Generate migration.mo to handle the Book type schema change

**User-visible outcome:** Admins can reliably open the Add Book modal and submit new books, navigate to the Manage Users tab to view and search all registered users, and upload a PDF or ePub file when adding or editing a book, with the file stored directly in the canister.
