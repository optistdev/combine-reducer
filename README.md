# Redux Combine Reducers

## Objectives

1. Write action creators and reducers to modify different pieces of application state
2. Build **Redux's combineReducers()** function
3. Use the `combineReducers()` function to delegate different pieces of state to each reducer

## Introduction

So far we have been using a single reducer to return a new state when an action
is dispatched. This works great for a small application where we only need our
reducer to manage the state of one resource. However, as you will see, when
working with multiple resources, placing all of this logic in one reducer
function can quickly become unwieldy.

Enter `combineReducers()` to save the day! In this lab, we'll see how
**Redux**'s `combineReducers()` function lets us delegate different pieces of
state to separate reducer functions.

We'll do this in the context of a book application that we'll use to keep track
of programming books that we've read.

We want our app to do two things:

1. Keep track of all the books we've read: title, author, description.
2. Keep track of the authors who wrote these books.

#### Determine Application State Structure

Our app will need a state object that stores two types of information:

1. All our books, in an array
2. Our authors, also in an array

Each of these types of information--all our books, and the authors--should be
represented on our store's state object. We want to think of our store's state
structure as a database. We will represent this as a belongs to/has many
relationship, in that a book belongs to an author and an author has many books.
So this means each author would have its own id, and each book would have an
authorId as a foreign key.

With that, we can set the application state as:

```
{
  authors: //array of authors
  books: // array of books,
}
```

So our state object will have two top-level keys, each pointing to an array. For
now, let's write a single reducer to manage both of these resources.

```javascript
export default function bookApp(
  state = {
    authors: [],
    books: []
  },
  action
) {
  let idx;
  switch (action.type) {
    case "ADD_BOOK":
      return {
        ...state,
        books: [...state.books, action.book]
      };

    case "REMOVE_BOOK":
      idx = state.books.indexOf(action.id);
      return {
        ...state,
        books: [state.books.slice(0, idx), state.books.slice(idx + 1)]
      };

    case "ADD_AUTHOR":
      return {
        ...state,
        authors: [...state.authors, action.author]
      };

    case "REMOVE_AUTHOR":
      idx = state.authors.indexOf(action.id);
      return {
        ...state,
        authors: [state.authors.slice(0, idx), state.authors.slice(idx + 1)]
      };

    default:
      return state;
  }
}
```

This is the current set up in `src/reducers/manageAuthorsAndBooks.js`, and it
works. You can see, however, by working with just two resources, the size of our
reducer increased significantly. Moreover, by placing each resource in the same
reducer, we are coupling these resources together, where we would prefer to
maintain their separation. By creating separate reducers for each resource in an
application, we can keep our code organized as our applications get more
complicated.

## Refactor by using combineReducers

The `combineReducers()` function allows us to write two or more separate
reducers, then pass each reducer to the `combineReducers()` function to produce
the reducer we wrote above. Then we pass that combined reducer to the store in
`src/index.js`. Let's write some code, and then we'll walk through it below.

```javascript
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  authors: authorsReducer,
  books: booksReducer
});

export default rootReducer;

function booksReducer(state = [], action) {
  let idx;
  switch (action.type) {
    case "ADD_BOOK":
      return [...state, action.book];

    case "REMOVE_BOOK":
      idx = state.indexOf(action.id);
      return [...state.slice(0, idx), ...state.slice(idx + 1)];

    default:
      return state;
  }
}

function authorsReducer(state = [], action) {
  let idx;
  switch (action.type) {
    case "ADD_AUTHOR":
      return [...state, action.author];

    case "REMOVE_AUTHOR":
      idx = state.indexOf(action.id);
      return [...state.slice(0, idx), ...state.slice(idx + 1)];

    default:
      return state;
  }
}
```

There's a lot of code there, so let's unpack it a bit. At the very top you see
the following line:

```javascript
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  authors: authorsReducer,
  books: booksReducer
});

export default rootReducer;
```

Through `combineReducer`, we're telling **Redux** to produce a reducer which
will return a state that has both a key of books with a value equal to the
return value of the `booksReducer()` _and_ a key of **authors** with a value
equal to the return value of the `authorsReducer()`. Now if you look at the
`booksReducer()` and the `authorsReducer()` you will see that each returns a
default state of an empty array.

Since we've changed the default export of `manageAuthorsAndBooks.js`, in
`index.js`, we don't need to change anything with createStore unless we wanted
to update names we've assigned:

```js
import { createStore } from "redux";
import rootReducer from "./reducers/manageAuthorsAndBooks";

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
```

By passing our rootReducer to the createStore method, the application maintains
its initial state of `{ books: [], authors: [] }`, just as it did when we had
one reducer. From the application's perspective nothing has changed.

#### Examining Our New Reducers

Now if we examine the `authorsReducer()`, notice that this reducer only
concerns itself with its own slice of the state. This makes sense. Remember that
ultimately the array that the `authorsReducer()` returns will be the value to
the key of authors. Similarly the `authorsReducer()` only receives as its
state argument the value of state.authors, in other words the authors array.

So examining the `authorsReducer()`, we see that we no longer retrieve the
list of authors with a call to `state.authors`, but can access the list of
authors simply by calling `state`.

```javascript
function authorsReducer(state = [], action) {
  let idx;
  switch (action.type) {
    case "ADD_AUTHOR":
      return [...state, action.author];

    case "REMOVE_AUTHOR":
      idx = state.indexOf(action.id);
      return [...state.slice(0, idx), ...state.slice(idx + 1)];

    default:
      return state;
  }
}
```

#### Dispatching Actions

The `combineReducer()` function returns to us one large reducer that looks like
the following:

```javascript
function reducer(state = {
  authors: [],
  books: []
}, action) {
  let idx
  switch (action.type) {

    case "ADD_AUTHOR":
      return [...state, action.author]

    case 'REMOVE_AUTHOR':
      ...
  }
}
```

Because of this, we can dispatch actions the same way we always did.
`store.dispatch({ type: 'ADD_BOOK', { title: 'Snow Crash', author: 'Neal Stephenson' } });`
will hit our switch statement in the reducer and add a new author. One thing
to note, is that if you want to have more than one reducer respond to the same
action, you can.

For example, in our application, when a user inputs information about a book,
the user _also_ inputs the author's name. It would be handy if, when a user
submits a book with an author, that author is also added to our author array.

The action dispatched doesn't change: `store.dispatch({ type: 'ADD_BOOK', { title: 'Snow Crash', author: 'Neal Stephenson' } });`. Our
`booksReducer` can stay the same for now:

```javascript
function booksReducer(state = [], action) {
  let idx;
  switch (action.type) {
    case "ADD_BOOK":
      return [...state, action.book];

    case "REMOVE_BOOK":
      idx = state.indexOf(action.id);
      return [...state.slice(0, idx), ...state.slice(idx + 1)];

    default:
      return state;
  }
}
```

However, in `authorsReducer`, we can _also_ include a switch case for
"ADD_BOOK":

```js
import uuid from "uuid";

function authorsReducer(state = [], action) {
  let idx;
  switch (action.type) {
    case "ADD_AUTHOR":
      return [...state, action.author];

    case "REMOVE_AUTHOR":
      idx = state.indexOf(action.id);
      return [...state.slice(0, idx), ...state.slice(idx + 1)];

    case "ADD_BOOK":
      let existingAuthor = state.filter(
        author => author.authorName === action.book.authorName
      );
      if (existingAuthor.length > 0) {
        return state;
      } else {
        return [...state, { authorName: action.book.authorName, id: uuid() }];
      }

    default:
      return state;
  }
}
```

In the new "ADD*BOOK" case, we're checking to see if an authorName matches with
the name dispatches from the BookInput component. If the name already exists,
state is returned unchanged. If the name is not present, it is added to the
author array. Use the example above to modify the `manageAuthorsAndBooks`
reducer and you can see the effect. We have two separate forms, one for adding
just authors, and one that adds books \_and* authors.

**Note:** We're using a useful package, `uuid`, to handle unique ID generation.
With this refactor, since we are creating an author ID from within the reducer
instead of in `AuthorInput.js`, we need to import it here as well.

## Conclusion

For learning purposes, our two reducers are in the same file, but it is common
to separate each reducer into its own file. You could then either import each
reducer into a _new_ file, something like `reducers/rootReducer.js`, where
`combineReducer` is called. Or, alternatively, you could include
`combineReducer` in your `src/index.js` file. For example:

```js
import authorsReducer from './reducers/authorsReducer';
import booksReducer from './reducers/booksReducer';

const rootReducer = combineReducers({
  books: booksReducer,
  authors: authorsReducer
})

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

...
```

In React/Redux apps where we're using and storing many resources in our store,
keeping reducers separated helps us organize code and separate concerns. Actions
can cause multiple reducers to modify their own state, but we can still keep all
modifications to a _particular_ resource within its own separate file.

#### Resources

- [Implementing Combine Reducers from Scratch](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

<p class='util--hide'>View <a href='https://learn.co/lessons/combine-reducers-codealong'>Combine Reducers Codealong</a> on Learn.co and start learning to code for free.</p>
