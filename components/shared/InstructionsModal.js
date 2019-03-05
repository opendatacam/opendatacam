import React, { Component } from 'react';

class InstructionsModal extends Component {

  render() {

    return (
      <div className="overlay" onClick={() => this.props.close()}>
        <div className="modal">
          <h1>Draw to define counting lines</h1>
          <button onClick={() => this.props.close()}>OK</button>
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 5;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .modal {
            background-color: white;
            border: 1px solid black;
            width: 300px;
            height: auto;
            padding: 15px;
            color: black;
          }
        `}</style>
      </div>
    )
  }
}

export default InstructionsModal;
