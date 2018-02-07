import React, { Component } from 'react'

class Title extends Component {

  render () {
    return (
      <div className="title">
        <h1>Neckartor</h1>
        <style jsx>{`
          .title{
            position: fixed;
            left: 1.5rem;
            top: 2rem;
          }
        `}</style>
      </div>
    )
  }
}

export default Title
