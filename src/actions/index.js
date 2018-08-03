export const addAuthor = author => {
  return {
    type: 'ADD_AUTHOR',
    author
  };
};

export const removeAuthor = id => {
  return {
    type: 'REMOVE_AUTHOR',
    id
  };
};

export const addBook = book => {
  return {
    type: 'ADD_BOOK',
    book
  };
};

export const removeBook = id => {
  return {
    type: 'REMOVE_BOOK',
    id
  };
};
