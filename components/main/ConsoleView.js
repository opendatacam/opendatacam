import React, { Component } from 'react'
import axios from 'axios';
import { connect } from 'react-redux';

class ConsoleView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      console: ""
    }

    this.consoleLog = React.createRef();
  }

  fetchConsoleData() {
    axios.get('/console').then((response) => {
      this.setState({ console: response.data })
    })
  }


  componentDidMount() {
    this.fetchConsoleData();
    this.intervalFetchingConsoleData = setInterval(() => {
      this.fetchConsoleData();
    }, 1000)
    
  }

  componentDidUpdate() {
    this.consoleLog.current.scrollTop = this.consoleLog.current.scrollHeight;
  }


  componentWillUnmount() {
    if(this.intervalFetchingConsoleData) {
      clearInterval(this.intervalFetchingConsoleData)
    }
  }

  render () {
    return (
        <div className="console-view bg-default-soft">
          <div className="w-full h-full p-5">
            <textarea 
              className="w-full h-full"
              ref={this.consoleLog} 
              value={this.state.console}
            >
            </textarea>
          </div>
          <style jsx>{`
            .console-view {
              width: 100%;
              height: 100%;
              position: fixed;
              will-change: transform;
              overflow: scroll;
              padding-top: 100px;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
            }
          `}</style>
        </div>
    )
  }
}

export default ConsoleView
