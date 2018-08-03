import React, { Component } from 'react';
import { addBook } from '../actions';
import uuid from 'uuid';
import { connect } from 'react-redux';

export class BookInput extends Component {

  state = {
    title: '',
    authorName: ''
  }

  handleOnChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }


  handleOnSubmit = event => {
    event.preventDefault();
    const book = {...this.state, id: uuid() };
    this.props.addBook(book);
    this.setState({
      title: '',
      authorName: ''
    });
  }

  render() {
    return(
      <form onSubmit={(event) => this.handleOnSubmit(event)}>
        <p>
          <input
            type="text"
            onChange={(event) => this.handleOnChange(event)}
            name="title"
            value={this.state.title}
            placeholder="book title" />
        </p>
        <p>
          <input
            type="text"
            onChange={(event) => this.handleOnChange(event)}
            name="authorName"
            value={this.state.authorName}
            placeholder="author name" />
        </p>
        <input type="submit" />
      </form>
    );
  }
};

export default connect(null, { addBook })(BookInput);
