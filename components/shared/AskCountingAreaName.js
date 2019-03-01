import React, { Component } from 'react'

class AskCountingAreaName extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({name: event.target.value});
  }

  render() {
    return (
      <div className="ask-name">
        <input 
          type="text" 
          value={this.state.name} 
          onChange={this.handleChange} 
          placeholder='Area name'
        />
        <div
          onClick={() => this.props.save()}
          className="button ok"
        >
          <h2>
            OK
          </h2>
        </div>
        <style jsx>{`
          .ask-name{
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

export default AskCountingAreaName
