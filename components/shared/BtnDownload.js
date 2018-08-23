import React, { Component } from 'react'

class BtnDownload extends Component {

  render () {
    return (
      <div
        className="btn-download"
        onClick={() => this.props.onClick()}
      >
        <img src="/static/icons/icon-download.svg" />
        <h2>Export data</h2>
        <style jsx>{`
          .btn-download {
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }
      
          .btn-download h2{
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default BtnDownload
