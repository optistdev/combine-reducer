import React, { Component } from 'react';
import { connect } from 'react-redux';

class Authors extends Component {

  render() {

    const {authors} = this.props

    let filteredAuthors = authors.map(author => <li key={author.id}>{author.authorName}</li>);

    return (
      <div>
        <ul>
          {filteredAuthors}
        </ul>
      </div>
    );
  }
};

const mapStateToProps = state => {
  return { authors: state.authors }
}

export default connect(mapStateToProps)(Authors);
