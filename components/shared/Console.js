import React, { Component } from 'react';
import axios from 'axios';

let LazyLog;
let ScrollFollow;

class Console extends Component {
  constructor(props) {
    super(props);

    this.state = {
      onClient: false,
    };
  }

  componentDidMount() {
    this.setState({
      onClient: true,
    });

    LazyLog = require('react-lazylog').LazyLog;
    ScrollFollow = require('react-lazylog').ScrollFollow;
  }

  render() {
    return (
      <>
        {this.state.onClient
            && (
            <ScrollFollow
              startFollowing
              render={({ follow, onScroll }) => (
                <LazyLog
                  url="/console"
                  stream
                  follow={follow}
                  onScroll={onScroll}
                  overscanRowCount={300}
                />
              )}
            />
            )}
      </>
    );
  }
}

export default Console;
