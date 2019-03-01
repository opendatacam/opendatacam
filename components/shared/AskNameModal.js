import React, { Component } from 'react'
import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';

class AskNameModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.escFunction = this.escFunction.bind(this);
  }

  handleChange(event) {
    this.setState({name: event.target.value});
  }

  escFunction(event){
    if(event.keyCode === 27) {
      this.props.cancel()
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
  }

  render() {
    return (
      <div className="overlay">
        <form className="ask-name" onSubmit={(e) => {
          e.preventDefault()
          if(this.state.name !== '') {
            this.props.save(this.state.name)
          }
        }}>
          <input 
            type="text" 
            value={this.state.name} 
            onChange={this.handleChange} 
            placeholder='Counting line name'
            autoFocus
          />
          <input type="submit"
            value="OK"
          />
          <button
            onClick={() => this.props.cancel()}
          >
            Cancel
          </button>
        </form>
        <CanvasEngine mode={CANVAS_RENDERING_MODE.COUNTING_AREAS} />
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 6;
          }

          .ask-name{
              text-align: center;
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 6;
          }
        `}</style>
      </div>
    )
  }
}

export default AskNameModal
