import React from 'react'
import { connect } from 'react-redux'; 

import WebcamView from './WebcamView';
import CountingView from './CountingView';

class MainPage extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className="main-page">
        {this.props.isCounting &&
          <CountingView />
        }
        {!this.props.isCounting &&
          <WebcamView />
        }
        <style jsx>{`
          .main-page {
            height: 100%;
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    isCounting: state.app.get('isCounting')
  }
})(MainPage)
