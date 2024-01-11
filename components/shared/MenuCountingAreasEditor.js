import React, { Component } from 'react';
import { connect } from 'react-redux';
import SVG from 'react-inlinesvg';

import {
  deleteCountingArea, setMode, EDITOR_MODE, restoreCountingAreasFromJSON,
} from '../../statemanagement/app/CounterStateManagement';

class MenuCountingAreasEditor extends Component {
  handleDelete() {
    if (Object.keys(this.props.countingAreas).length > 1) {
      this.props.dispatch(setMode(EDITOR_MODE.DELETE));
    } else {
      this.props.dispatch(deleteCountingArea(Object.keys(this.props.countingAreas)[0]));
    }
  }

  loadFile() {
    console.log('loadFile');
    let input; let file; let
      fr;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('upload');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    } else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = (e) => {
        const lines = e.target.result;
        const json = JSON.parse(lines);
        this.props.dispatch(restoreCountingAreasFromJSON(json));
      };
      fr.readAsText(file);
    }
  }

  render() {
    return (
      <div className="menu-active-areas flex fixed bottom-0 left-0 mb-2 ml-2">
        {this.props.mode !== EDITOR_MODE.DELETE
          && (
          <>
            <button
              className="btn btn-default p-0 rounded-l shadow"
              onClick={() => this.handleDelete()}
            >
              <SVG
                className="w-10 h-10 svg-icon flex items-center"
                cacheRequests
                src="/static/icons/ui/delete.svg"
                aria-label="icon delete"
              />
            </button>
            <button
              className={`btn btn-default p-0 shadow ${this.props.mode === EDITOR_MODE.EDIT_LINE ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT_LINE))}
            >
              <SVG
                className="w-10 h-10 svg-icon flex items-center"
                cacheRequests
                src="/static/icons/ui/addline.svg"
                aria-label="icon addline"
              />
            </button>
            <button
              className={`btn btn-default p-0 shadow rounded-r ${this.props.mode === EDITOR_MODE.EDIT_POLYGON ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT_POLYGON))}
            >
              <SVG
                className="w-10 h-10 svg-icon flex items-center"
                cacheRequests
                src="/static/icons/ui/addpolygon.svg"
                aria-label="icon addpolygon"
              />
            </button>
            <a
              href="/counter/areas"
              target="_blank"
              download
              className="btn btn-default p-0 ml-4 rounded-l shadow"
            >
              <SVG
                className="w-10 h-10 svg-icon flex items-center"
                cacheRequests
                src="/static/icons/ui/download.svg"
                aria-label="icon download"
              />
            </a>
            <label
              htmlFor="upload"
              className="btn btn-default p-0 rounded-r shadow cursor-pointer	"
            >
              <SVG
                className="w-10 h-10 svg-icon flex items-center"
                cacheRequests
                src="/static/icons/ui/upload.svg"
                aria-label="icon upload"
              />
              <input type="file" id="upload" onChange={() => this.loadFile()} style={{ display: 'none' }} />
            </label>
          </>
          )}
        {this.props.mode === EDITOR_MODE.DELETE
          && (
          <button
            className="btn btn-default p-0 rounded shadow"
            onClick={() => this.props.dispatch(setMode(this.props.lastEditingMode))}
          >
            <SVG
              className="w-10 h-10 svg-icon flex items-center"
              cacheRequests
              src="/static/icons/ui/close.svg"
              aria-label="icon edit"
            />
          </button>
          )}
        <style jsx>
          {`
          .menu-active-areas {
            z-index: 8;
          }
        `}
        </style>
      </div>
    );
  }
}

export default connect((state) => ({
  countingAreas: state.counter.countingAreas,
  selectedCountingArea: state.counter.selectedCountingArea,
  mode: state.counter.mode,
  lastEditingMode: state.counter.lastEditingMode,
}))(MenuCountingAreasEditor);
