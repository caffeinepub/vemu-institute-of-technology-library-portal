import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  // Original book type.
  type OldBook = {
    id : Text;
    title : Text;
    author : Text;
    category : Text;
    isbn : Text;
    totalCopies : Nat;
    availableCopies : Nat;
    description : Text;
    addedAt : Int;
  };

  // Original actor type
  type OldActor = {
    books : Map.Map<Text, OldBook>;
  };

  // New extended book type.
  type NewBook = {
    id : Text;
    title : Text;
    author : Text;
    category : Text;
    isbn : Text;
    totalCopies : Nat;
    availableCopies : Nat;
    description : Text;
    file : ?Storage.ExternalBlob;
    addedAt : Int;
  };

  // New actor type
  type NewActor = {
    books : Map.Map<Text, NewBook>;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newBooks = old.books.map<Text, OldBook, NewBook>(
      func(_id, oldBook) {
        { oldBook with file = null };
      },
    );
    { books = newBooks };
  };
};
