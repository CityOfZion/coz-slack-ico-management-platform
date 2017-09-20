import React, { Component } from 'react';
import PropTypes from 'prop-types';

class App extends Component {
  
  render() {
    const {content} = this.props;
    return (
      <div>
        {content}
      </div>
    );
  }
}

App.propTypes = {
  content: PropTypes.any.isRequired
};

export default App;