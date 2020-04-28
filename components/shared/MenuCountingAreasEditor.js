import React, { Component } from 'react'
import { connect } from 'react-redux'
import SVG from 'react-inlinesvg';

import { deleteCountingArea, setMode, EDITOR_MODE, restoreCountingAreasFromJSON } from '../../statemanagement/app/CounterStateManagement'

class MenuCountingAreasEditor extends Component {

  handleDelete() {
    if(this.props.countingAreas.size > 1) {
      this.props.dispatch(setMode(EDITOR_MODE.DELETE))
    } else {
      this.props.dispatch(deleteCountingArea(this.props.countingAreas.keySeq().first()))
    }
  }

  loadFile() {
    console.log('loadFile')
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('upload');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = (e) => {
        let lines = e.target.result;
        var json = JSON.parse(lines); 
        this.props.dispatch(restoreCountingAreasFromJSON(json));
      };
      fr.readAsText(file);
    }
  }

  render () {

    return (
      <div className="menu-active-areas flex fixed bottom-0 left-0 mb-2 ml-2">
        {this.props.mode !== EDITOR_MODE.DELETE &&
          <>
            <button
              className="btn btn-default p-0 rounded-l shadow"
              onClick={() => this.handleDelete()}
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/delete.svg`} 
                aria-label="icon delete"
              />
            </button>
            <button
              className="btn btn-default p-0 shadow rounded-r btn-default--active"
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/addline.svg`} 
                aria-label="icon edit"
              />
            </button>
            <a
              href={`/counter/areas`} 
              target="_blank" 
              download
              className="btn btn-default p-0 ml-4 rounded-l shadow"
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/download.svg`} 
                aria-label="icon download"
              />
            </a>
            <label 
              htmlFor="upload" 
              className="btn btn-default p-0 rounded-r shadow cursor-pointer	"
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/upload.svg`} 
                aria-label="icon upload"
              />
              <input type="file" id="upload" onChange={() => this.loadFile()} style={{"display":"none"}} />
            </label>
          </>
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <button
            className="btn btn-default p-0 rounded shadow"
            onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT))}
          >
            <SVG 
              className="w-10 h-10 svg-icon flex items-center" 
              cacheRequests={true}
              src={`/static/icons/ui/close.svg`} 
              aria-label="icon edit"
            />
          </button>
        }
        <style jsx>{`
          .menu-active-areas {
            z-index: 8;
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas'),
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    mode: state.counter.get('mode')
  }
})(MenuCountingAreasEditor)
