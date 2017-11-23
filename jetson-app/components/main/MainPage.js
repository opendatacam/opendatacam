import React from 'react'
import { connect } from 'react-redux'; 

import WebcamView from './WebcamView';

class MainPage extends React.Component {

  render () {
    return (
      <div className="main-page">
        {this.props.isCounting &&
          <div>Render counting UI</div>
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
