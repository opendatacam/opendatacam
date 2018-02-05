import React, { Component } from 'react'

class DrawInstructions extends Component {

  render () {
    return (
      <div className="instructions">
        <h1>Draw to define Active Areas</h1>
        <div
          onClick={() => this.props.onConfirm()}
          className="button ok"
        >
          <h2>
            OK
          </h2>
        </div>
        <style jsx>{`
          .instructions{
            text-align: center;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 5;
          }

          .instructions .button {
            display: flex;
            justify-content: center;
            align-items: center;

            background-color: white;
            color: black;
            width: 3rem;
            height: 2.5rem;
            border: 5px solid transparent;
            position: relative;
            left: 50%;
            margin-top: 1rem;
            transform: translateX(-50%);
          }
      
          .instructions .button:hover{
            border: 5px solid #D6D6D6;
          }
        `}</style>
      </div>
    )
  }
}

export default DrawInstructions
