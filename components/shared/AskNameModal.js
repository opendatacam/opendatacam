import React, { Component } from 'react'
import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import SVG from 'react-inlinesvg';

class AskNameModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: props.name || ''
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
        <form className="ask-name flex" onSubmit={(e) => {
          e.preventDefault()
          if(this.state.name !== '') {
            this.props.save(this.state.name)
          }
        }}>
          <input 
            type="text"
            className="appearance-none rounded-l py-2 px-3" 
            value={this.state.name} 
            onChange={this.handleChange} 
            placeholder='Counting line name'
            autoFocus
          />
          <input 
            type="submit"
            className="btn btn-default cursor-pointer"
            value="OK"
          />
          <button
            className="btn btn-default p-0 rounded-r"
            onClick={() => this.props.cancel()}
          >
            <SVG 
              className="w-10 h-10 svg-icon flex items-center" 
              cacheRequests={true}
              src={`/static/icons/ui/close.svg`} 
              aria-label="icon close"
            />
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
            z-index: 8;
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
