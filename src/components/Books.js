import React, { Component } from 'react';
import { connect } from 'react-redux';

class Books extends Component {

  render() {

    let books = this.props.books.map(book => <li key={book.id}>{book.title} by {book.authorName}</li>);

    return (
      <div>
        <ul>
          {books}
        </ul>
      </div>
    );
  }
};

const mapStateToProps = state => {
  return { books: state.books }
}

export default connect(mapStateToProps)(Books);
