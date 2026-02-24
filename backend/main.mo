import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Book = {
    id : Text;
    title : Text;
    author : Text;
    category : Text;
    isbn : Text;
    totalCopies : Nat;
    availableCopies : Nat;
    description : Text;
    addedAt : Time.Time;
  };

  public type BookCreateData = {
    title : Text;
    author : Text;
    category : Text;
    isbn : Text;
    totalCopies : Nat;
    description : Text;
  };

  public type BorrowRecord = {
    id : Text;
    bookId : Text;
    borrowedAt : Time.Time;
    dueDate : Time.Time;
    returnedAt : ?Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
    joinedAt : Time.Time;
  };

  module Book {
    public func compareByTitle(book1 : Book, book2 : Book) : Order.Order {
      Text.compare(book1.title, book2.title);
    };
  };

  let bookRecords = Map.empty<Principal, Map.Map<Text, BorrowRecord>>();

  // Books state
  let books = Map.empty<Text, Book>();

  // User profiles state
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Book Functions ──────────────────────────────────────────────────────────

  public query ({ caller }) func getAllBooksSortedByTitle() : async [Book] {
    books.values().toArray().sort(Book.compareByTitle);
  };

  public query ({ caller }) func getBookById(id : Text) : async Book {
    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public shared ({ caller }) func addBook(bookCreateData : BookCreateData) : async () {
    // Only allow admins to add books
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };

    // Check if ISBN already exists
    if (books.values().toArray().find(func(book) { book.isbn == bookCreateData.isbn }) != null) {
      Runtime.trap("Book with given ISBN already exists");
    };

    // Generate unique book ID
    let bookId = bookCreateData.isbn;
    let newBook : Book = {
      id = bookId;
      title = bookCreateData.title;
      author = bookCreateData.author;
      category = bookCreateData.category;
      isbn = bookCreateData.isbn;
      totalCopies = bookCreateData.totalCopies;
      availableCopies = bookCreateData.totalCopies;
      description = bookCreateData.description;
      addedAt = Time.now();
    };

    books.add(bookId, newBook);
  };

  public shared ({ caller }) func borrowBook(bookId : Text) : async () {
    // Only authenticated users (not guests) can borrow books
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can borrow books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?book) {
        if (book.availableCopies == 0) {
          Runtime.trap("No copies available for this book");
        };
        let newBook : Book = {
          id = book.id;
          title = book.title;
          author = book.author;
          category = book.category;
          isbn = book.isbn;
          totalCopies = book.totalCopies;
          availableCopies = book.availableCopies - 1;
          description = book.description;
          addedAt = book.addedAt;
        };
        books.add(bookId, newBook);

        let newBorrowRecord : BorrowRecord = {
          id = bookId;
          bookId = bookId;
          borrowedAt = Time.now();
          dueDate = Time.now() + 14 * 24 * 60 * 60 * 1000000000;
          returnedAt = null;
        };

        let userBorrowRecords = switch (bookRecords.get(caller)) {
          case (null) {
            let newMap = Map.empty<Text, BorrowRecord>();
            newMap.add(bookId, newBorrowRecord);
            newMap;
          };
          case (?existing) {
            existing.add(bookId, newBorrowRecord);
            existing;
          };
        };

        bookRecords.add(caller, userBorrowRecords);
      };
    };
  };

  public shared ({ caller }) func returnBook(bookId : Text) : async () {
    // Only authenticated users (not guests) can return books
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can return books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?book) {
        let newBook : Book = {
          id = book.id;
          title = book.title;
          author = book.author;
          category = book.category;
          isbn = book.isbn;
          totalCopies = book.totalCopies;
          availableCopies = book.availableCopies + 1;
          description = book.description;
          addedAt = book.addedAt;
        };
        books.add(bookId, newBook);

        // Mark the borrow record as returned
        switch (bookRecords.get(caller)) {
          case (null) {};
          case (?userBorrowRecords) {
            switch (userBorrowRecords.get(bookId)) {
              case (null) {};
              case (?record) {
                let updatedRecord : BorrowRecord = {
                  id = record.id;
                  bookId = record.bookId;
                  borrowedAt = record.borrowedAt;
                  dueDate = record.dueDate;
                  returnedAt = ?Time.now();
                };
                userBorrowRecords.add(bookId, updatedRecord);
              };
            };
          };
        };
      };
    };
  };

  // ── Query Functions ─────────────────────────────────────────────────────────

  public query ({ caller }) func getMyBorrowHistory() : async [BorrowRecord] {
    // Only authenticated users can view their borrow history
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view borrow history");
    };
    switch (bookRecords.get(caller)) {
      case (null) { [] };
      case (?userBorrowRecords) { userBorrowRecords.values().toArray() };
    };
  };

  public query ({ caller }) func getAllBorrowRecords() : async [(Principal, [BorrowRecord])] {
    // Only admins can view all borrow records
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all borrow records");
    };
    bookRecords.entries().toArray().map(
      func((principal, recordMap)) : (Principal, [BorrowRecord]) {
        (principal, recordMap.values().toArray());
      }
    );
  };

  public query ({ caller }) func getDashboardStats() : async {
    totalBooks : Nat;
    totalUsers : Nat;
    booksBorrowed : Nat;
    overdueCount : Nat;
  } {
    // Only admins can view dashboard stats
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let now = Time.now();
    var booksBorrowed = 0;
    var overdueCount = 0;

    for ((_, userBorrowRecords) in bookRecords.entries().toArray().vals()) {
      for (record in userBorrowRecords.values().toArray().vals()) {
        switch (record.returnedAt) {
          case (null) {
            booksBorrowed += 1;
            if (now > record.dueDate) {
              overdueCount += 1;
            };
          };
          case (?_) {};
        };
      };
    };

    {
      totalBooks = books.size();
      totalUsers = userProfiles.size();
      booksBorrowed = booksBorrowed;
      overdueCount = overdueCount;
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    // Only admins can list all users
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    userProfiles.entries().toArray();
  };
};
