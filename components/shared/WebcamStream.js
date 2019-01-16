import React, { Component } from 'react'
import { connect } from 'react-redux';

class WebcamStream extends Component {

  constructor(props) {
    super(props);

    this.state = {
       dateRefresh: new Date().getTime()
    };

    this.refresh = this.refresh.bind(this);
   }

   getUrl() {
      return `${this.props.urlData.protocol}://${this.props.urlData.address}:8090/?time=${this.state.dateRefresh}`
   }

   componentDidMount() {
     this.refreshInterval = setInterval(() => {
       this.refresh();
     }, 1000);
   }

   componentWillUnmount() {
     clearInterval(this.refreshInterval);
   }

   refresh() {
     this.setState({ dateRefresh: new Date().getTime() });
   }

  render () {
    return (
      <React.Fragment>
        <img
           width={1280}
           height={720}
           src={this.getUrl()}
         />
        <style jsx>{`
          @media (min-aspect-ratio: 16/9) {
            img {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            img {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    urlData: state.app.get('urlData').toJS()
  }
})(WebcamStream)
