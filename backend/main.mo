import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";


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

  public type ReservationStatus = {
    #pending;
    #approved;
    #rejected;
    #cancelled;
  };

  public type Reservation = {
    id : Text;
    bookId : Text;
    userId : Principal;
    status : ReservationStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    dueDate : ?Time.Time;
  };

  public type DigitalResource = {
    id : Text;
    title : Text;
    description : Text;
    category : Text;
    url : Text;
    addedAt : Time.Time;
  };

  public type DigitalResourceCreateData = {
    title : Text;
    description : Text;
    category : Text;
    url : Text;
  };

  public type AnnouncementPriority = {
    #normal;
    #urgent;
  };

  public type Announcement = {
    id : Text;
    title : Text;
    body : Text;
    priority : AnnouncementPriority;
    publishDate : Time.Time;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type AnnouncementCreateData = {
    title : Text;
    body : Text;
    priority : AnnouncementPriority;
    publishDate : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
    joinedAt : Time.Time;
  };

  func compareBooksByTitle(book1 : Book, book2 : Book) : Order.Order {
    Text.compare(book1.title, book2.title);
  };

  func compareAnnouncementsByDate(a1 : Announcement, a2 : Announcement) : Order.Order {
    if (a1.publishDate > a2.publishDate) { #less }
    else if (a1.publishDate < a2.publishDate) { #greater }
    else { #equal };
  };

  let bookRecords = Map.empty<Principal, Map.Map<Text, BorrowRecord>>();
  let books = Map.empty<Text, Book>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let reservations = Map.empty<Text, Reservation>();
  let digitalResources = Map.empty<Text, DigitalResource>();
  let announcements = Map.empty<Text, Announcement>();

  var activeUsersCount = 0;
  var reservationCounter = 0;
  var digitalResourceCounter = 0;
  var announcementCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func initialize(adminToken : Text, userProvidedToken : Text) : async () {
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

  public query ({ caller }) func getUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

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

  // ── Book Catalog ──────────────────────────────────────────────────────────

  public query ({ caller }) func getAllBooksSortedByTitle() : async [Book] {
    books.values().toArray().sort(compareBooksByTitle);
  };

  public query ({ caller }) func getBookById(id : Text) : async Book {
    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  // ── Book Management (Admin only) ──────────────────────────────────────────

  public shared ({ caller }) func addBook(bookCreateData : BookCreateData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };

    if (books.values().toArray().find(func(book : Book) : Bool { book.isbn == bookCreateData.isbn }) != null) {
      Runtime.trap("Book with given ISBN already exists");
    };

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

  public shared ({ caller }) func editBook(bookId : Text, bookCreateData : BookCreateData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let updatedBook : Book = {
          id = book.id;
          title = bookCreateData.title;
          author = bookCreateData.author;
          category = bookCreateData.category;
          isbn = bookCreateData.isbn;
          totalCopies = bookCreateData.totalCopies;
          availableCopies = book.availableCopies;
          description = bookCreateData.description;
          addedAt = book.addedAt;
        };
        books.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func deleteBook(bookId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?_) {
        books.remove(bookId);
      };
    };
  };

  // ── Borrowing (Users only) ────────────────────────────────────────────────

  public shared ({ caller }) func borrowBook(bookId : Text) : async () {
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

  public query ({ caller }) func getMyBorrowHistory() : async [BorrowRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view borrow history");
    };
    switch (bookRecords.get(caller)) {
      case (null) { [] };
      case (?userBorrowRecords) { userBorrowRecords.values().toArray() };
    };
  };

  // ── Reservations ──────────────────────────────────────────────────────────

  public shared ({ caller }) func createReservation(bookId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create reservations");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?_) {};
    };

    reservationCounter += 1;
    let reservationId = "res-" # reservationCounter.toText();
    let now = Time.now();

    let newReservation : Reservation = {
      id = reservationId;
      bookId = bookId;
      userId = caller;
      status = #pending;
      createdAt = now;
      updatedAt = now;
      dueDate = null;
    };

    reservations.add(reservationId, newReservation);
    reservationId;
  };

  public shared ({ caller }) func cancelReservation(reservationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can cancel reservations");
    };

    switch (reservations.get(reservationId)) {
      case (null) { Runtime.trap("Reservation not found") };
      case (?reservation) {
        if (reservation.userId != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own reservations");
        };
        let updated : Reservation = {
          id = reservation.id;
          bookId = reservation.bookId;
          userId = reservation.userId;
          status = #cancelled;
          createdAt = reservation.createdAt;
          updatedAt = Time.now();
          dueDate = reservation.dueDate;
        };
        reservations.add(reservationId, updated);
      };
    };
  };

  public query ({ caller }) func getMyReservations() : async [Reservation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their reservations");
    };
    reservations.values().toArray().filter(func(r : Reservation) : Bool { r.userId == caller });
  };

  public shared ({ caller }) func approveReservation(reservationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve reservations");
    };

    switch (reservations.get(reservationId)) {
      case (null) { Runtime.trap("Reservation not found") };
      case (?reservation) {
        switch (books.get(reservation.bookId)) {
          case (null) { Runtime.trap("Book does not exist") };
          case (?book) {
            if (book.availableCopies == 0) {
              Runtime.trap("No copies available for this book");
            };
            let updatedBook : Book = {
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
            books.add(reservation.bookId, updatedBook);
          };
        };

        let dueDate = Time.now() + 14 * 24 * 60 * 60 * 1000000000;
        let updated : Reservation = {
          id = reservation.id;
          bookId = reservation.bookId;
          userId = reservation.userId;
          status = #approved;
          createdAt = reservation.createdAt;
          updatedAt = Time.now();
          dueDate = ?dueDate;
        };
        reservations.add(reservationId, updated);
      };
    };
  };

  public shared ({ caller }) func rejectReservation(reservationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject reservations");
    };

    switch (reservations.get(reservationId)) {
      case (null) { Runtime.trap("Reservation not found") };
      case (?reservation) {
        let updated : Reservation = {
          id = reservation.id;
          bookId = reservation.bookId;
          userId = reservation.userId;
          status = #rejected;
          createdAt = reservation.createdAt;
          updatedAt = Time.now();
          dueDate = reservation.dueDate;
        };
        reservations.add(reservationId, updated);
      };
    };
  };

  public query ({ caller }) func getAllReservations() : async [Reservation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all reservations");
    };
    reservations.values().toArray();
  };

  // ── Digital Resources ─────────────────────────────────────────────────────

  public query ({ caller }) func getAllDigitalResources() : async [DigitalResource] {
    digitalResources.values().toArray();
  };

  public shared ({ caller }) func addDigitalResource(data : DigitalResourceCreateData) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add digital resources");
    };

    digitalResourceCounter += 1;
    let resourceId = "dr-" # digitalResourceCounter.toText();
    let newResource : DigitalResource = {
      id = resourceId;
      title = data.title;
      description = data.description;
      category = data.category;
      url = data.url;
      addedAt = Time.now();
    };
    digitalResources.add(resourceId, newResource);
    resourceId;
  };

  public shared ({ caller }) func editDigitalResource(resourceId : Text, data : DigitalResourceCreateData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit digital resources");
    };

    switch (digitalResources.get(resourceId)) {
      case (null) { Runtime.trap("Digital resource not found") };
      case (?existing) {
        let updated : DigitalResource = {
          id = existing.id;
          title = data.title;
          description = data.description;
          category = data.category;
          url = data.url;
          addedAt = existing.addedAt;
        };
        digitalResources.add(resourceId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteDigitalResource(resourceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete digital resources");
    };

    switch (digitalResources.get(resourceId)) {
      case (null) { Runtime.trap("Digital resource not found") };
      case (?_) {
        digitalResources.remove(resourceId);
      };
    };
  };

  // ── Announcements ─────────────────────────────────────────────────────────

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort(compareAnnouncementsByDate);
  };

  public shared ({ caller }) func addAnnouncement(data : AnnouncementCreateData) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add announcements");
    };

    announcementCounter += 1;
    let announcementId = "ann-" # announcementCounter.toText();
    let now = Time.now();
    let newAnnouncement : Announcement = {
      id = announcementId;
      title = data.title;
      body = data.body;
      priority = data.priority;
      publishDate = data.publishDate;
      createdAt = now;
      updatedAt = now;
    };
    announcements.add(announcementId, newAnnouncement);
    announcementId;
  };

  public shared ({ caller }) func editAnnouncement(announcementId : Text, data : AnnouncementCreateData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit announcements");
    };

    switch (announcements.get(announcementId)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        let updated : Announcement = {
          id = existing.id;
          title = data.title;
          body = data.body;
          priority = data.priority;
          publishDate = data.publishDate;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        announcements.add(announcementId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAnnouncement(announcementId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete announcements");
    };

    switch (announcements.get(announcementId)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?_) {
        announcements.remove(announcementId);
      };
    };
  };

  // ── Admin Dashboard ───────────────────────────────────────────────────────

  public query ({ caller }) func getAllBorrowRecords() : async [(Principal, [BorrowRecord])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all borrow records");
    };
    bookRecords.entries().toArray().map<(Principal, Map.Map<Text, BorrowRecord>), (Principal, [BorrowRecord])>(
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    userProfiles.entries().toArray();
  };

  public query ({ caller }) func getActiveUserCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view active user count");
    };
    activeUsersCount;
  };

  public shared ({ caller }) func incrementActiveUsers() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can register an active session");
    };
    activeUsersCount += 1;
  };

  public shared ({ caller }) func decrementActiveUsers() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can deregister an active session");
    };
    if (activeUsersCount > 0) {
      activeUsersCount -= 1;
    };
  };
};

