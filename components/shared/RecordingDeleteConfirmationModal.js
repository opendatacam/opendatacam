import React, { Component } from 'react';

class RecordingDeleteConfirmationModal extends Component {

  render() {

    return (
      <div className="overlay" onClick={() => this.props.onCancel()}>
        <div className="modal rounded p-10 shadow text-inverse bg-default border-inverse">
          <h3 className="text-center text-xl font-bold">
            Delete Recording
          </h3>
          <div className="text-center mt-2">Are you sure you want to delete this recording ?</div>
          <div className="flex items-center">
            <button 
                className="btn btn-secondary btn-rounded min-w-100 mt-5 pl-10 pr-10"
                onClick={() => this.props.onCancel()}>
                Cancel
            </button>
            <button 
                className="btn btn-primary btn-rounded min-w-100 mt-5 pl-10 pr-10"
                onClick={() => this.props.onConfirm()}>
                Confirm
            </button>
          </div>
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 8;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .modal {
            border: 1px solid black;
            width: 300px;
            height: auto;
            padding: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
        `}</style>
      </div>
    )
  }
}

export default RecordingDeleteConfirmationModal;
