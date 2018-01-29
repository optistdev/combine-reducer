# Redux Combine Reducers

## Objectives

1. Write action creators and reducers to modify different pieces of application state
2. Build __Redux's combineReducers()__ function
3. Use the __combineReducers()__ function to delegate different pieces of state to each reducer

## Introduction

So far we have been using a single reducer to return a new state when an action is dispatched. This works great for a small application where we only need our reducer to manage the state of one resource. However, as you will see, when working with multiple resources, placing all of this logic in one reducer function can quickly become unwieldy.

Enter __combineReducers()__ to save the day! In this lab, we'll see how __Redux's combineReducers()__ function lets us delegate different pieces of state to separate reducer functions.

We'll do this in the context of a book application that we'll use to keep track of programming books that we've read.

We want our app to do two things:
1. Keep track of all the books we've read: title, author, description.
2. Keep track of the authors who wrote these books.

### Determine Application State Structure

Our app will need a state object that stores two types of information:

1. All our books, in an array
2. Our authors, also in an array

Each of these types of information--all our books, and the authors--should be represented on our store's state object. We want to think of our store's state structure as a database. We will represent this as a belongs to/has many relationship, in that a book belongs to an author and an author has many books. So this means each author would have its own id, and each book would have an authorId as a foreign key.

With that, we can set the application state as:

```
{
  books: // array of books,
  authors: //array of favorite books
}
```

So our state object will have two top-level keys, each pointing to an array. For now, let's write a single reducer to manage both of these resources. 

```javascript
export function bookApp(state = {
  authors: [], 
  books: []
}, action) {
  switch (action.type) {

    case "ADD_BOOK":
      return Object.assign(state, {
        books: state.books.concat(action.book)
      });

    case "REMOVE_BOOK":
      const idx = state.books.indexOf(action.id);
      return Object.assign(state, {
        books: [
          state.books.slice(0, idx),
          state.books.slice(idx + 1),
        ]
      });

    case "ADD_AUTHOR":
        return Object.assign(state, {
          authors: state.authors.concat(action.author)
        });

    case "REMOVE_AUTHOR":
      const idx = state.authors.indexOf(action.id);
      return Object.assign(state, {
        authors: [
          state.authors.slice(0, idx),
          state.authors.slice(idx + 1)
        ]
      });

    default:
      return state;
    }
};

export const store = createStore(bookApp)
```

As you can see, just working with two resources increases the size of our reducer to almost twenty lines of code. Moreover, by placing each resource in the same reducer, we are coupling these resources together, where we would prefer to maintain their separation.  

## Refactor by using combineReducers

The __combineReducers()__ function allows us to write two separate reducers, then pass each reducer to the __combineReducers()__ function to produce the reducer we wrote above. Then we pass that combined reducer to the store. Let's write some code, and then we'll walk through it below.  

```javascript
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  books: booksReducer, 
  authors: authorsReducer
});

export const store = createStore(rootReducer);

function booksReducer(state = [], action) {
  switch (action.type) {

     case "ADD_BOOK":
      return state.concat(action.book);

    case "REMOVE_BOOK":
      const idx = state.indexOf(action.id);
      return [ ...state.slice(0, idx), ...state.slice(idx + 1) ];

    default:
      return state;
  }
}

function authorsReducer(state = [], action) {
  switch (action.type) {

    case "ADD_AUTHOR":
      return state.concat(action.author);

    case "REMOVE_AUTHOR":
      const idx = state.indexOf(action.id);
      return [ ...state.slice(0, idx), ...state.slice(idx + 1) ];

    default:
      return state;
  }
}
```

There's a lot of code there, so let's unpack it a bit.  At the very top you see the following line:

```javascript
const rootReducer = combineReducers({
  books: booksReducer, 
  authors: authorsReducer
});

```

We're telling __Redux__ to produce a reducer which will return a state that has a key of books with a value equal to the return value of the __booksReducer()__ and a key of __authors__ with a value equal to the return value of the __authorsReducer()__.  Now if you look at the __booksReducer()__ and the __authorsReducer()__ you will see that each returns a default state of an empty array. So by passing our rootReducer to the createStore method, the application maintains its initial state of `{ books: [], authors: [] }`.  

### Examining Our New Reducers

Now if you examine the __authorsReducer()__, notice that this reducer only concerns itself with its own slice of the state. This makes sense. Remember that ultimately the array that the __authorsReducer()__ returns will be the value to the key of authors. Similarly the __authorsReducer()__ only receives as it's state argument the value of state.authors, in other words the authors array.  

So examining the __authorsReducer()__, we see that we no longer retrieve the list of authors with a call to `state.authors`, but can access the list of authors simply by calling `state`.

```javascript
function authorsReducer(state = [], action) {
  switch (action.type) {

    case "ADD_AUTHOR":
      return state.concat(action.author);

    case "REMOVE_AUTHOR":
      const idx = state.indexOf(action.id);
      return [ ...state.slice(0, idx), ...state.slice(idx + 1) ];

    default:
      return state;
  }
}
```

### Dispatching Actions

The __combineReducer()__ function returns to us one large reducer looks like the following:

```javascript
function reducer(state = {
  authors: [], 
  books: []
}, action) {
  switch (action.type) {

    case "ADD_AUTHOR"
      return state.concat(action.author)

    case 'REMOVE_AUTHOR'
    ....
  }
};
```

Because of this, it means that we can dispatch actions the same way we always did.  `store.dispatch({ type: 'ADD_AUTHOR', { title: 'huck finn' } });` will hit our switch statement in the reducer and add a new author.  
One thing to note, is that if you want to have more than one reducer respond to the same action, you can.  For example, let's say that when a user inputs information about a book, the user also inputs the author's name. The action dispatched may look like the following: `store.dispatch({ action: 'ADD_BOOK', book: { title: 'huck finn', authorName: 'Mark Twain' } });`. Our reducers may look like the following:

```javascript
function booksReducer(state = [], action) {
  switch (action.type) {

    case "ADD_BOOK":
      return state.concat(action.book);

    case "REMOVE_BOOK":
      const idx = state.indexOf(action.id);
      return [ ...state.slice(0, idx), ...state.slice(idx + 1) ];

    default:
      return state;
  }
}

function authorsReducer(state = [], action) {
  switch (action.type) {
    
    case "ADD_AUTHOR":
      return state.concat(action.author);
    
    case "REMOVE_AUTHOR":
      const idx = state.indexOf(action.id)
      return [ ...state.slice(0, idx), ...state.slice(idx + 1) ];
    
    case "ADD_BOOK":
      let existingAuthor = state.filter(author => author.name === action.authorName)
      if(!existingAuthor) {
        return state.concat(action.author);
      } else {
        return state
      }
    
    default:
      return state;
    }
}
```

So you can see that both the __booksReducer()__ and the __authorsReducer()__ will be modifying the store's state when an action of type `ADD_BOOK` is dispatched. The __booksReducer()__ will provide the standard behavior of adding the new book. The __authorsReducer()__ will look to see if there is an existing author of that type in the store, and if not add a new author.  

> Note: The above code has a bug in that we would not be able to add a foreign key of the authorId on a book, because when the books reducer receives the action, the related author would not exist yet.  Therefore, we would take a different approach, and likely dispatch two sequential actions of types 'ADD_AUTHOR' and then 'ADD_BOOK'. However, the above example is to show that two separate reducers can respond to the same dispatched action. 

### Resources

+ [Implementing Combine Reducers from Scratch](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

<p class='util--hide'>View <a href='https://learn.co/lessons/combine-reducers-codealong'>Combine Reducers Codealong</a> on Learn.co and start learning to code for free.</p>
