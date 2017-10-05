import React, { Component } from 'react';

class Title extends Component {

  render() {
    return (
      <div className="title-container">
        <h3>{this.props.label}</h3>
        <style jsx>{`
          .title-container {
            position: absolute;
            top: 30px;
            z-index: 10;
            top: 5px;
            left: 40%;
            color: white;
            background-color: black;
            padding: 10px;
            border-radius: 5px;
          }
        `}</style>
      </div>
    );
  }
}

export default Title;
