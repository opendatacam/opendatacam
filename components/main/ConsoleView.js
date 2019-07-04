import React, { Component } from 'react'
import axios from 'axios';
import Console from '../shared/Console';

class ConsoleView extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
        <div className="console-view bg-default-soft">
          <div className="flex justify-end pl-5 pt-5 pr-5">
            <a 
              className="btn btn-light rounded" 
              target="_blank"
              href="/console"
            >
              Download logs
            </a>
          </div>
          <div className="w-full h-full p-5">
            <Console />
          </div>
          <style jsx>{`
            .console-view {
              width: 100%;
              height: 100%;
              position: fixed;
              will-change: transform;
              overflow: scroll;
              padding-top: 3.1rem;
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
